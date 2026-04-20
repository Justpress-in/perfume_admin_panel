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
  MenuItem,
  Stack,
  Switch,
  TextField
} from '@mui/material';
import { api } from 'src/lib/api';

const emptyValues = {
  slug: '',
  nameEn: '',
  nameAr: '',
  descriptionEn: '',
  descriptionAr: '',
  image: '',
  parent: '',
  sortOrder: 0,
  isActive: true
};

const validationSchema = Yup.object({
  slug: Yup.string().trim().required('Slug is required'),
  nameEn: Yup.string().trim().required('English name is required'),
  nameAr: Yup.string().trim().required('Arabic name is required'),
  sortOrder: Yup.number().integer('Must be a whole number').min(0, 'Must be 0 or greater').required()
});

const toValues = (item) =>
  item
    ? {
        slug: item.slug || '',
        nameEn: item.name?.en || '',
        nameAr: item.name?.ar || '',
        descriptionEn: item.description?.en || '',
        descriptionAr: item.description?.ar || '',
        image: item.image || '',
        parent: item.parent?._id || item.parent || '',
        sortOrder: item.sortOrder ?? 0,
        isActive: item.isActive !== false
      }
    : emptyValues;

const toPayload = (v) => ({
  slug: v.slug.trim(),
  name: { en: v.nameEn.trim(), ar: v.nameAr.trim() },
  description: { en: v.descriptionEn.trim(), ar: v.descriptionAr.trim() },
  image: v.image.trim(),
  parent: v.parent || null,
  sortOrder: Math.max(0, Number(v.sortOrder) || 0),
  isActive: v.isActive
});

export const CategoryDialog = ({ open, item, parents = [], onClose, onSaved }) => {
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
          ? await api.put(`/api/categories/${item._id}`, payload)
          : await api.post('/api/categories', payload);
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

  const availableParents = parents.filter((p) => p._id !== item?._id);

  return (
    <Dialog open={open} onClose={() => handleClose()} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Edit category' : 'New category'}</DialogTitle>
      <DialogContent dividers>
        <form id="category-form" onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Slug"
              name="slug"
              value={formik.values.slug}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.slug && formik.errors.slug)}
              helperText={formik.touched.slug && formik.errors.slug}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Name (English)"
                name="nameEn"
                value={formik.values.nameEn}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.nameEn && formik.errors.nameEn)}
                helperText={formik.touched.nameEn && formik.errors.nameEn}
              />
              <TextField
                fullWidth
                label="Name (Arabic)"
                name="nameAr"
                value={formik.values.nameAr}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.nameAr && formik.errors.nameAr)}
                helperText={formik.touched.nameAr && formik.errors.nameAr}
                inputProps={{ dir: 'rtl' }}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Description (English)"
                name="descriptionEn"
                value={formik.values.descriptionEn}
                onChange={formik.handleChange}
              />
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Description (Arabic)"
                name="descriptionAr"
                value={formik.values.descriptionAr}
                onChange={formik.handleChange}
                inputProps={{ dir: 'rtl' }}
              />
            </Stack>
            <TextField
              fullWidth
              label="Image URL"
              name="image"
              value={formik.values.image}
              onChange={formik.handleChange}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                select
                label="Parent category"
                name="parent"
                value={formik.values.parent}
                onChange={formik.handleChange}
              >
                <MenuItem value="">None</MenuItem>
                {availableParents.map((p) => (
                  <MenuItem key={p._id} value={p._id}>
                    {p.name?.en || p.slug}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Sort order"
                name="sortOrder"
                type="number"
                value={formik.values.sortOrder}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                inputProps={{ min: 0, step: 1 }}
                error={Boolean(formik.touched.sortOrder && formik.errors.sortOrder)}
                helperText={formik.touched.sortOrder && formik.errors.sortOrder}
                sx={{ maxWidth: 160 }}
              />
            </Stack>
            <FormControlLabel
              control={
                <Switch
                  name="isActive"
                  checked={formik.values.isActive}
                  onChange={formik.handleChange}
                />
              }
              label="Active"
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
          form="category-form"
          variant="contained"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
