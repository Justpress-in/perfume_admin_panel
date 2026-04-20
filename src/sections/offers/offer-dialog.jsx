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

const discountTypes = [
  { label: 'Percentage (%)', value: 'percentage' },
  { label: 'Fixed amount (RM)', value: 'fixed' },
  { label: 'Buy One Get One', value: 'bogo' },
  { label: 'Bundle deal', value: 'bundle' },
  { label: 'None', value: '' }
];

const emptyValues = {
  titleEn: '',
  titleAr: '',
  descriptionEn: '',
  descriptionAr: '',
  image: '',
  discountType: '',
  discountValue: 0,
  link: '',
  badge: '',
  category: '',
  startDate: '',
  endDate: '',
  sortOrder: 0,
  isActive: true
};

const validationSchema = Yup.object({
  titleEn: Yup.string().trim().required('English title is required'),
  titleAr: Yup.string().trim().required('Arabic title is required')
});

const isoToInput = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

const toValues = (item) =>
  item
    ? {
        titleEn: item.title?.en || '',
        titleAr: item.title?.ar || '',
        descriptionEn: item.description?.en || '',
        descriptionAr: item.description?.ar || '',
        image: item.image || '',
        discountType: item.discountType || '',
        discountValue: item.discountValue ?? 0,
        link: item.link || '',
        badge: item.badge || '',
        category: item.category || '',
        startDate: isoToInput(item.startDate),
        endDate: isoToInput(item.endDate),
        sortOrder: item.sortOrder ?? 0,
        isActive: item.isActive !== false
      }
    : emptyValues;

const toPayload = (v) => {
  const payload = {
    title: { en: v.titleEn.trim(), ar: v.titleAr.trim() },
    description: { en: v.descriptionEn.trim(), ar: v.descriptionAr.trim() },
    image: v.image.trim(),
    discountValue: Number(v.discountValue) || 0,
    link: v.link.trim(),
    badge: v.badge.trim(),
    category: v.category.trim(),
    startDate: v.startDate || null,
    endDate: v.endDate || null,
    sortOrder: Number(v.sortOrder) || 0,
    isActive: v.isActive,
  };
  if (v.discountType) payload.discountType = v.discountType;
  return payload;
};

export const OfferDialog = ({ open, item, onClose, onSaved }) => {
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
          ? await api.put(`/api/offers/${item._id}`, payload)
          : await api.post('/api/offers', payload);
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
    <Dialog open={open} onClose={() => handleClose()} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Edit offer' : 'New offer'}</DialogTitle>
      <DialogContent dividers>
        <form id="offer-form" onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={2}>
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
                select
                fullWidth
                label="Discount type"
                name="discountType"
                value={formik.values.discountType}
                onChange={formik.handleChange}
              >
                {discountTypes.map((t) => (
                  <MenuItem key={t.value || 'none'} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                type="number"
                label="Discount value"
                name="discountValue"
                value={formik.values.discountValue}
                onChange={formik.handleChange}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Link"
                name="link"
                value={formik.values.link}
                onChange={formik.handleChange}
              />
              <TextField
                fullWidth
                label="Badge"
                name="badge"
                value={formik.values.badge}
                onChange={formik.handleChange}
              />
              <TextField
                fullWidth
                label="Category"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                type="date"
                label="Start date"
                name="startDate"
                InputLabelProps={{ shrink: true }}
                value={formik.values.startDate}
                onChange={formik.handleChange}
              />
              <TextField
                fullWidth
                type="date"
                label="End date"
                name="endDate"
                InputLabelProps={{ shrink: true }}
                value={formik.values.endDate}
                onChange={formik.handleChange}
              />
              <TextField
                label="Sort order"
                name="sortOrder"
                type="number"
                value={formik.values.sortOrder}
                onChange={formik.handleChange}
                sx={{ minWidth: 140 }}
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
          form="offer-form"
          variant="contained"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
