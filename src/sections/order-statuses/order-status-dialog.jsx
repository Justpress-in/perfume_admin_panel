import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { api } from 'src/lib/api';

const PRESET_COLORS = [
  '#9e9e9e', '#2196f3', '#ff9800', '#4caf50',
  '#f44336', '#9c27b0', '#00bcd4', '#795548',
];

const emptyValues = { value: '', label: '', color: '#9e9e9e', sortOrder: 0, isDefault: false };

const toValues = (item) =>
  item
    ? { value: item.value || '', label: item.label || '', color: item.color || '#9e9e9e', sortOrder: item.sortOrder ?? 0, isDefault: item.isDefault || false }
    : emptyValues;

const validationSchema = Yup.object({
  value: Yup.string().trim().required('Value (slug) is required').matches(/^[a-z0-9-_]+$/, 'Only lowercase letters, numbers, hyphens and underscores'),
  label: Yup.string().trim().required('Label is required'),
});

export const OrderStatusDialog = ({ open, item, onClose, onSaved }) => {
  const isEdit = Boolean(item?._id);
  const [submitError, setSubmitError] = useState(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: toValues(item),
    validationSchema,
    onSubmit: async (values, helpers) => {
      setSubmitError(null);
      try {
        const payload = {
          value: values.value.trim().toLowerCase(),
          label: values.label.trim(),
          color: values.color,
          sortOrder: Number(values.sortOrder) || 0,
          isDefault: values.isDefault,
        };
        const { data } = isEdit
          ? await api.put(`/api/order-statuses/${item._id}`, payload)
          : await api.post('/api/order-statuses', payload);
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
      <DialogTitle>{isEdit ? 'Edit status' : 'New order status'}</DialogTitle>
      <DialogContent dividers>
        <form id="status-form" onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Label"
              name="label"
              placeholder="e.g. Processing"
              value={formik.values.label}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.label && formik.errors.label)}
              helperText={(formik.touched.label && formik.errors.label) || 'Displayed to admin'}
            />
            <TextField
              fullWidth
              label="Value (slug)"
              name="value"
              placeholder="e.g. processing"
              value={formik.values.value}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.value && formik.errors.value)}
              helperText={(formik.touched.value && formik.errors.value) || 'Used in the database — lowercase only'}
              disabled={isEdit}
            />

            {/* Color picker */}
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">Colour</Typography>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={1}>
                {PRESET_COLORS.map((c) => (
                  <Box
                    key={c}
                    onClick={() => formik.setFieldValue('color', c)}
                    sx={{
                      width: 28, height: 28, borderRadius: '50%',
                      bgcolor: c, cursor: 'pointer',
                      border: formik.values.color === c ? '3px solid #000' : '2px solid transparent',
                      flexShrink: 0,
                    }}
                  />
                ))}
                <Box
                  component="input"
                  type="color"
                  value={formik.values.color}
                  onChange={(e) => formik.setFieldValue('color', e.target.value)}
                  sx={{ width: 34, height: 34, p: 0, border: 'none', borderRadius: 1, cursor: 'pointer' }}
                />
                <Typography variant="caption" color="text.secondary">{formik.values.color}</Typography>
              </Stack>
            </Stack>

            <TextField
              label="Sort order"
              name="sortOrder"
              type="number"
              value={formik.values.sortOrder}
              onChange={formik.handleChange}
              sx={{ maxWidth: 160 }}
              helperText="Lower = shown first"
            />

            <FormControlLabel
              control={
                <Switch
                  name="isDefault"
                  checked={formik.values.isDefault}
                  onChange={formik.handleChange}
                />
              }
              label="Default status for new orders"
            />

            {submitError && <Alert severity="error">{submitError}</Alert>}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={() => handleClose()} disabled={formik.isSubmitting}>Cancel</Button>
        <Button type="submit" form="status-form" variant="contained" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
