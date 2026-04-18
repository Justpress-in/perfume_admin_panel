import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Button,
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
import { api } from 'src/lib/api';

const emptyValues = {
  titleEn: '',
  titleAr: '',
  excerptEn: '',
  excerptAr: '',
  bodyEn: '',
  bodyAr: '',
  tags: '',
  image: '',
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
    image: post.image || '',
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
  image: values.image.trim(),
  published: values.published
});

export const BlogDialog = ({ open, post, onClose, onSaved }) => {
  const isEdit = Boolean(post?._id);
  const [submitError, setSubmitError] = useState(null);

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
        onSaved?.(saved, { created: !isEdit });
        handleClose(true);
      } catch (err) {
        setSubmitError(err?.response?.data?.message || err?.message || 'Save failed');
        helpers.setSubmitting(false);
      }
    }
  });

  const handleClose = (force = false) => {
    if (!force && formik.isSubmitting) return;
    setSubmitError(null);
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
                fullWidth
                multiline
                minRows={2}
                label="Excerpt (English)"
                name="excerptEn"
                value={formik.values.excerptEn}
                onChange={formik.handleChange}
              />
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Excerpt (Arabic)"
                name="excerptAr"
                value={formik.values.excerptAr}
                onChange={formik.handleChange}
                inputProps={{ dir: 'rtl' }}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                multiline
                minRows={6}
                label="Body (English)"
                name="bodyEn"
                value={formik.values.bodyEn}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.bodyEn && formik.errors.bodyEn)}
                helperText={formik.touched.bodyEn && formik.errors.bodyEn}
              />
              <TextField
                fullWidth
                multiline
                minRows={6}
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
              <Typography variant="caption" color="text.secondary">
                Meta
              </Typography>
            </Divider>

            <TextField
              fullWidth
              label="Cover image URL"
              name="image"
              placeholder="https://…"
              value={formik.values.image}
              onChange={formik.handleChange}
            />
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
        <Button onClick={() => handleClose()} disabled={formik.isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="blog-form"
          variant="contained"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create post'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
