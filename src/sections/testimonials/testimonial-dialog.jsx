import { useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Rating,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { api } from 'src/lib/api';

const emptyValues = {
  name: '',
  location: '',
  textEn: '',
  textAr: '',
  rating: 5,
  sortOrder: 0,
  isPublished: true
};

const validationSchema = Yup.object({
  name: Yup.string().trim().required('Name is required'),
  textEn: Yup.string().trim().required('English text is required'),
  textAr: Yup.string().trim().required('Arabic text is required'),
  rating: Yup.number().min(1).max(5).required()
});

const toValues = (item) =>
  item
    ? {
        name: item.name || '',
        location: item.location || '',
        textEn: item.text?.en || '',
        textAr: item.text?.ar || '',
        rating: item.rating ?? 5,
        sortOrder: item.sortOrder ?? 0,
        isPublished: item.isPublished !== false
      }
    : emptyValues;

const toPayload = (v) => ({
  name: v.name.trim(),
  location: v.location.trim(),
  text: { en: v.textEn.trim(), ar: v.textAr.trim() },
  rating: Number(v.rating),
  sortOrder: Number(v.sortOrder) || 0,
  isPublished: v.isPublished
});

export const TestimonialDialog = ({ open, item, onClose, onSaved }) => {
  const isEdit = Boolean(item?._id);
  const [submitError, setSubmitError] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const avatarPreview = avatarFile
    ? URL.createObjectURL(avatarFile)
    : item?.avatar || '';

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: toValues(item),
    validationSchema,
    onSubmit: async (values, helpers) => {
      setSubmitError(null);
      try {
        const payload = toPayload(values);
        const { data } = isEdit
          ? await api.put(`/api/testimonials/${item._id}`, payload)
          : await api.post('/api/testimonials', payload);

        let saved = data?.data;

        if (avatarFile && saved?._id) {
          setUploading(true);
          try {
            const form = new FormData();
            form.append('image', avatarFile);
            const { data: up } = await api.post(
              `/api/testimonials/${saved._id}/avatar`,
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
        setSubmitError(err?.response?.data?.message || 'Save failed');
        helpers.setSubmitting(false);
      }
    }
  });

  const handleClose = (force = false) => {
    if (!force && (formik.isSubmitting || uploading)) return;
    setSubmitError(null);
    setAvatarFile(null);
    formik.resetForm();
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={() => handleClose()} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Edit testimonial' : 'New testimonial'}</DialogTitle>
      <DialogContent dividers>
        <form id="testimonial-form" onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={2}>

            {/* ── Avatar upload ── */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={avatarPreview || undefined}
                sx={{ width: 72, height: 72, flexShrink: 0 }}
              >
                {!avatarPreview && <PhotoCameraIcon color="disabled" />}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Avatar photo</Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PhotoCameraIcon />}
                    onClick={() => fileRef.current?.click()}
                  >
                    {avatarPreview ? 'Replace' : 'Upload photo'}
                  </Button>
                  {avatarFile && (
                    <Button
                      size="small"
                      color="inherit"
                      startIcon={<DeleteOutlineIcon />}
                      onClick={() => setAvatarFile(null)}
                    >
                      Remove
                    </Button>
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  PNG or JPG. Uploaded after saving.
                </Typography>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setAvatarFile(f);
                    e.target.value = '';
                  }}
                />
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth label="Name" name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.name && formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              <TextField
                fullWidth label="Location" name="location"
                value={formik.values.location}
                onChange={formik.handleChange}
              />
            </Stack>

            <TextField
              fullWidth multiline minRows={3}
              label="Text (English)" name="textEn"
              value={formik.values.textEn}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.textEn && formik.errors.textEn)}
              helperText={formik.touched.textEn && formik.errors.textEn}
            />
            <TextField
              fullWidth multiline minRows={3}
              label="Text (Arabic)" name="textAr"
              value={formik.values.textAr}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.textAr && formik.errors.textAr)}
              helperText={formik.touched.textAr && formik.errors.textAr}
              inputProps={{ dir: 'rtl' }}
            />

            <Stack direction="row" spacing={3} alignItems="center">
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">Rating</Typography>
                <Rating
                  name="rating"
                  value={Number(formik.values.rating) || 0}
                  onChange={(_, value) => formik.setFieldValue('rating', value || 1)}
                />
              </Stack>
              <TextField
                label="Sort order" name="sortOrder" type="number"
                value={formik.values.sortOrder}
                onChange={formik.handleChange}
                sx={{ maxWidth: 160 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    name="isPublished"
                    checked={formik.values.isPublished}
                    onChange={formik.handleChange}
                  />
                }
                label="Published"
              />
            </Stack>

            {submitError && <Alert severity="error">{submitError}</Alert>}
          </Stack>
        </form>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Box sx={{ flex: 1 }}>
          {uploading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">Uploading photo…</Typography>
            </Stack>
          )}
        </Box>
        <Button onClick={() => handleClose()} disabled={formik.isSubmitting || uploading}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="testimonial-form"
          variant="contained"
          disabled={formik.isSubmitting || uploading}
        >
          {formik.isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
