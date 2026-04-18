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
  FormControlLabel,
  Rating,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { api } from 'src/lib/api';

const emptyValues = {
  name: '',
  location: '',
  avatar: '',
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
        avatar: item.avatar || '',
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
  avatar: v.avatar.trim(),
  text: { en: v.textEn.trim(), ar: v.textAr.trim() },
  rating: Number(v.rating),
  sortOrder: Number(v.sortOrder) || 0,
  isPublished: v.isPublished
});

export const TestimonialDialog = ({ open, item, onClose, onSaved }) => {
  const isEdit = Boolean(item?._id);
  const [submitError, setSubmitError] = useState(null);

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
        onSaved?.(data?.data, { created: !isEdit });
        handleClose(true);
      } catch (err) {
        setSubmitError(err?.response?.data?.message || 'Save failed');
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
    <Dialog open={open} onClose={() => handleClose()} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Edit testimonial' : 'New testimonial'}</DialogTitle>
      <DialogContent dividers>
        <form id="testimonial-form" onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.name && formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formik.values.location}
                onChange={formik.handleChange}
              />
            </Stack>
            <TextField
              fullWidth
              label="Avatar URL"
              name="avatar"
              value={formik.values.avatar}
              onChange={formik.handleChange}
            />
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Text (English)"
              name="textEn"
              value={formik.values.textEn}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.textEn && formik.errors.textEn)}
              helperText={formik.touched.textEn && formik.errors.textEn}
            />
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Text (Arabic)"
              name="textAr"
              value={formik.values.textAr}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.textAr && formik.errors.textAr)}
              helperText={formik.touched.textAr && formik.errors.textAr}
              inputProps={{ dir: 'rtl' }}
            />
            <Stack direction="row" spacing={3} alignItems="center">
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Rating
                </Typography>
                <Rating
                  name="rating"
                  value={Number(formik.values.rating) || 0}
                  onChange={(_, value) => formik.setFieldValue('rating', value || 1)}
                />
              </Stack>
              <TextField
                label="Sort order"
                name="sortOrder"
                type="number"
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
        <Button onClick={() => handleClose()} disabled={formik.isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="testimonial-form"
          variant="contained"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
