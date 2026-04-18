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
  { label: 'Fixed amount', value: 'fixed' }
];

const emptyValues = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: 0,
  minOrderAmount: 0,
  maxDiscount: 0,
  usageLimit: 0,
  perUserLimit: 1,
  startDate: '',
  endDate: '',
  applicableCategories: '',
  isActive: true
};

const validationSchema = Yup.object({
  code: Yup.string().trim().required('Code is required'),
  discountType: Yup.string().oneOf(['percentage', 'fixed']).required(),
  discountValue: Yup.number().min(0).required('Discount value is required')
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
        code: item.code || '',
        description: item.description || '',
        discountType: item.discountType || 'percentage',
        discountValue: item.discountValue ?? 0,
        minOrderAmount: item.minOrderAmount ?? 0,
        maxDiscount: item.maxDiscount ?? 0,
        usageLimit: item.usageLimit ?? 0,
        perUserLimit: item.perUserLimit ?? 1,
        startDate: isoToInput(item.startDate),
        endDate: isoToInput(item.endDate),
        applicableCategories: Array.isArray(item.applicableCategories)
          ? item.applicableCategories.join(', ')
          : '',
        isActive: item.isActive !== false
      }
    : emptyValues;

const toPayload = (v) => ({
  code: v.code.trim().toUpperCase(),
  description: v.description.trim(),
  discountType: v.discountType,
  discountValue: Number(v.discountValue) || 0,
  minOrderAmount: Number(v.minOrderAmount) || 0,
  maxDiscount: Number(v.maxDiscount) || 0,
  usageLimit: Number(v.usageLimit) || 0,
  perUserLimit: Number(v.perUserLimit) || 1,
  startDate: v.startDate || null,
  endDate: v.endDate || null,
  applicableCategories: v.applicableCategories
    ? v.applicableCategories
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
    : [],
  isActive: v.isActive
});

export const CouponDialog = ({ open, item, onClose, onSaved }) => {
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
          ? await api.put(`/api/coupons/${item._id}`, payload)
          : await api.post('/api/coupons', payload);
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
      <DialogTitle>{isEdit ? 'Edit coupon' : 'New coupon'}</DialogTitle>
      <DialogContent dividers>
        <form id="coupon-form" onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Code"
                name="code"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.code && formik.errors.code)}
                helperText={formik.touched.code && formik.errors.code}
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </Stack>
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
                  <MenuItem key={t.value} value={t.value}>
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
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.discountValue && formik.errors.discountValue)}
                helperText={formik.touched.discountValue && formik.errors.discountValue}
              />
              <TextField
                fullWidth
                type="number"
                label="Max discount cap"
                name="maxDiscount"
                value={formik.values.maxDiscount}
                onChange={formik.handleChange}
                helperText="0 = no cap"
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                type="number"
                label="Min order amount"
                name="minOrderAmount"
                value={formik.values.minOrderAmount}
                onChange={formik.handleChange}
              />
              <TextField
                fullWidth
                type="number"
                label="Usage limit"
                name="usageLimit"
                value={formik.values.usageLimit}
                onChange={formik.handleChange}
                helperText="0 = unlimited"
              />
              <TextField
                fullWidth
                type="number"
                label="Per-user limit"
                name="perUserLimit"
                value={formik.values.perUserLimit}
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
            </Stack>
            <TextField
              fullWidth
              label="Applicable categories"
              placeholder="Comma-separated (empty = all)"
              name="applicableCategories"
              value={formik.values.applicableCategories}
              onChange={formik.handleChange}
            />
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
          form="coupon-form"
          variant="contained"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
