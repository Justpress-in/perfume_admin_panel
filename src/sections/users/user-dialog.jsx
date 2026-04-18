import { useEffect, useState } from 'react';
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
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { api } from 'src/lib/api';

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Arabic', value: 'ar' }
];

const validationSchema = Yup.object({
  name: Yup.string().max(255).required('Name is required'),
  phone: Yup.string().max(50),
  language: Yup.string().oneOf(['en', 'ar']).required()
});

export const UserDialog = ({ open, userId, onClose, onSaved, onDeactivated }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    if (!open || !userId) return;
    let cancelled = false;
    const fetchUser = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const { data } = await api.get(`/api/users/${userId}`);
        if (!cancelled) {
          setUser(data?.data || null);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err?.response?.data?.message || 'Failed to load user');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchUser();
    return () => {
      cancelled = true;
    };
  }, [open, userId]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      language: user?.language || 'en',
      isWholesale: Boolean(user?.isWholesale),
      isActive: user?.isActive !== false
    },
    validationSchema,
    onSubmit: async (values, helpers) => {
      setSubmitError(null);
      try {
        const { data } = await api.put(`/api/users/${userId}`, values);
        onSaved?.(data?.data);
        onClose?.();
      } catch (err) {
        setSubmitError(err?.response?.data?.message || 'Update failed');
        helpers.setSubmitting(false);
      }
    }
  });

  const handleDeactivate = async () => {
    if (!userId) return;
    const confirmed = window.confirm('Deactivate this user? They will lose access.');
    if (!confirmed) return;
    setDeactivating(true);
    try {
      await api.delete(`/api/users/${userId}`);
      onDeactivated?.(userId);
      onClose?.();
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Deactivate failed');
    } finally {
      setDeactivating(false);
    }
  };

  const handleClose = () => {
    if (formik.isSubmitting || deactivating) return;
    setUser(null);
    setSubmitError(null);
    setLoadError(null);
    formik.resetForm();
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit user</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : loadError ? (
          <Alert severity="error">{loadError}</Alert>
        ) : user ? (
          <form id="user-edit-form" onSubmit={formik.handleSubmit} noValidate>
            <Stack spacing={2}>
              <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary">
                  User ID
                </Typography>
                <Typography variant="body2">{user._id}</Typography>
              </Stack>
              <TextField
                label="Email"
                value={user.email || ''}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Name"
                name="name"
                fullWidth
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.name && formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              <TextField
                label="Phone"
                name="phone"
                fullWidth
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.phone && formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
              <TextField
                select
                label="Language"
                name="language"
                fullWidth
                value={formik.values.language}
                onChange={formik.handleChange}
              >
                {languageOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    name="isWholesale"
                    checked={formik.values.isWholesale}
                    onChange={formik.handleChange}
                  />
                }
                label="Wholesale customer"
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
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button
          color="error"
          onClick={handleDeactivate}
          disabled={!user || deactivating || formik.isSubmitting}
        >
          {deactivating ? 'Deactivating…' : 'Deactivate'}
        </Button>
        <Stack direction="row" spacing={1}>
          <Button onClick={handleClose} disabled={formik.isSubmitting || deactivating}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="user-edit-form"
            variant="contained"
            disabled={!user || formik.isSubmitting || deactivating}
          >
            {formik.isSubmitting ? 'Saving…' : 'Save changes'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
