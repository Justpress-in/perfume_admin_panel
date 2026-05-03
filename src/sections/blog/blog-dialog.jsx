import { useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { api } from 'src/lib/api';

const emptyValues = {
  titleEn: '',
  titleAr: '',
  excerptEn: '',
  excerptAr: '',
  bodyEn: '',
  bodyAr: '',
  tags: '',
  published: false
};

const validationSchema = Yup.object({
  titleEn: Yup.string().trim().required('English title is required'),
  titleAr: Yup.string().trim().required('Arabic title is required'),
  bodyEn: Yup.string().trim().required('English body is required'),
  bodyAr: Yup.string().trim().required('Arabic body is required')
});

const postToValues = (post) => {
  if (!post) return emptyValues;
  return {
    titleEn: post.title?.en || '',
    titleAr: post.title?.ar || '',
    excerptEn: post.excerpt?.en || '',
    excerptAr: post.excerpt?.ar || '',
    bodyEn: post.body?.en || '',
    bodyAr: post.body?.ar || '',
    tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
    published: Boolean(post.published)
  };
};

const valuesToPayload = (values) => ({
  title: { en: values.titleEn.trim(), ar: values.titleAr.trim() },
  excerpt: { en: values.excerptEn.trim(), ar: values.excerptAr.trim() },
  body: { en: values.bodyEn.trim(), ar: values.bodyAr.trim() },
  tags: values.tags
    ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [],
  published: values.published
});

export const BlogDialog = ({ open, post, onClose, onSaved }) => {
  const isEdit = Boolean(post?._id);
  const [submitError, setSubmitError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const imagePreview = imageFile
    ? URL.createObjectURL(imageFile)
    : post?.image || '';

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: postToValues(post),
    validationSchema,
    onSubmit: async (values, helpers) => {
      setSubmitError(null);
      try {
        const payload = valuesToPayload(values);
        let saved;
        if (isEdit) {
          const { data } = await api.put(`/api/blog/${post._id}`, payload);
          saved = data?.data;
        } else {
          const { data } = await api.post('/api/blog', payload);
          saved = data?.data;
        }

        // Upload cover image if selected
        if (imageFile && saved?._id) {
          setUploading(true);
          try {
            const form = new FormData();
            form.append('image', imageFile);
            const { data: up } = await api.post(
              `/api/blog/${saved._id}/image`,
              form,
              { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            if (up?.data) saved = up.data;
          } finally {
            setUploading(false);
          }
        }

        onSaved?.(saved, { created: !isEdit });
        handleClose(true);
      } catch (err) {
        setSubmitError(err?.response?.data?.message || err?.message || 'Save failed');
        helpers.setSubmitting(false);
      }
    }
  });

  const handleClose = (force = false) => {
    if (!force && (formik.isSubmitting || uploading)) return;
    setSubmitError(null);
    setImageFile(null);
    formik.resetForm();
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={() => handleClose()} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Edit post' : 'New post'}</DialogTitle>
      <DialogContent dividers>
        <form id="blog-form" onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={3}>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Title (English)"
                name="titleEn"
                value={formik.values.titleEn}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.titleEn && formik.errors.titleEn)}
                helperText={formik.touched.titleEn && formik.errors.titleEn}
              />
              <TextField
                fullWidth
                label="Title (Arabic)"
                name="titleAr"
                value={formik.values.titleAr}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.titleAr && formik.errors.titleAr)}
                helperText={formik.touched.titleAr && formik.errors.titleAr}
                inputProps={{ dir: 'rtl' }}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth multiline minRows={2}
                label="Excerpt (English)"
                name="excerptEn"
                value={formik.values.excerptEn}
                onChange={formik.handleChange}
              />
              <TextField
                fullWidth multiline minRows={2}
                label="Excerpt (Arabic)"
                name="excerptAr"
                value={formik.values.excerptAr}
                onChange={formik.handleChange}
                inputProps={{ dir: 'rtl' }}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth multiline minRows={6}
                label="Body (English)"
                name="bodyEn"
                value={formik.values.bodyEn}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.bodyEn && formik.errors.bodyEn)}
                helperText={formik.touched.bodyEn && formik.errors.bodyEn}
              />
              <TextField
                fullWidth multiline minRows={6}
                label="Body (Arabic)"
                name="bodyAr"
                value={formik.values.bodyAr}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.bodyAr && formik.errors.bodyAr)}
                helperText={formik.touched.bodyAr && formik.errors.bodyAr}
                inputProps={{ dir: 'rtl' }}
              />
            </Stack>

            <Divider textAlign="left">
              <Typography variant="caption" color="text.secondary">Meta</Typography>
            </Divider>

            {/* ── Cover image upload ── */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>Cover image</Typography>
              {imagePreview && (
                <Box
                  component="img"
                  src={imagePreview}
                  alt="cover preview"
                  sx={{
                    width: '100%',
                    maxHeight: 220,
                    objectFit: 'cover',
                    borderRadius: 2,
                    mb: 1.5,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                />
              )}
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PhotoCameraIcon />}
                  onClick={() => fileRef.current?.click()}
                >
                  {imagePreview ? 'Replace image' : 'Upload cover image'}
                </Button>
                {imageFile && (
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => setImageFile(null)}
                  >
                    Remove
                  </Button>
                )}
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                PNG or JPG. Uploaded after the post is saved.
              </Typography>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setImageFile(f);
                  e.target.value = '';
                }}
              />
            </Box>

            <TextField
              fullWidth
              label="Tags"
              name="tags"
              placeholder="Comma-separated, e.g. oud, tips"
              value={formik.values.tags}
              onChange={formik.handleChange}
            />

            <FormControlLabel
              control={
                <Switch
                  name="published"
                  checked={formik.values.published}
                  onChange={formik.handleChange}
                />
              }
              label="Published"
            />

            {submitError && <Alert severity="error">{submitError}</Alert>}
          </Stack>
        </form>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Box sx={{ flex: 1 }}>
          {uploading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">Uploading image…</Typography>
            </Stack>
          )}
        </Box>
        <Button onClick={() => handleClose()} disabled={formik.isSubmitting || uploading}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="blog-form"
          variant="contained"
          disabled={formik.isSubmitting || uploading}
        >
          {formik.isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create post'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
