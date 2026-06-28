import { useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { api } from 'src/lib/api';

const validationSchema = Yup.object({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'New password must be at least 8 characters')
    .required('New password is required')
    .notOneOf([Yup.ref('currentPassword')], 'New password must be different from current password'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
    .required('Please confirm your new password')
});

export const ChangePasswordDialog = ({ open, onClose, onSuccess }) => {
  const [serverError, setServerError] = useState(null);
  const [show, setShow] = useState({ current: false, next: false, confirm: false });

  const toggle = (field) => setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const formik = useFormik({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validationSchema,
    onSubmit: async (values, helpers) => {
      setServerError(null);
      try {
        await api.put('/api/auth/password', {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        });
        helpers.resetForm();
        onSuccess?.();
      } catch (err) {
        setServerError(err.response?.data?.message || 'Failed to change password');
      } finally {
        helpers.setSubmitting(false);
      }
    }
  });

  const handleClose = () => {
    if (formik.isSubmitting) return;
    formik.resetForm();
    setServerError(null);
    setShow({ current: false, next: false, confirm: false });
    onClose();
  };

  const adornment = (field) => (
    <InputAdornment position="end">
      <IconButton onClick={() => toggle(field)} edge="end" size="small" tabIndex={-1}>
        {show[field] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            For security, you will be signed out after changing your password and will need to log in again.
          </Typography>
          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Current password"
              name="currentPassword"
              type={show.current ? 'text' : 'password'}
              fullWidth
              autoComplete="current-password"
              value={formik.values.currentPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.currentPassword && formik.errors.currentPassword)}
              helperText={formik.touched.currentPassword && formik.errors.currentPassword}
              InputProps={{ endAdornment: adornment('current') }}
            />
            <TextField
              label="New password"
              name="newPassword"
              type={show.next ? 'text' : 'password'}
              fullWidth
              autoComplete="new-password"
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.newPassword && formik.errors.newPassword)}
              helperText={formik.touched.newPassword && formik.errors.newPassword}
              InputProps={{ endAdornment: adornment('next') }}
            />
            <TextField
              label="Confirm new password"
              name="confirmPassword"
              type={show.confirm ? 'text' : 'password'}
              fullWidth
              autoComplete="new-password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.confirmPassword && formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              InputProps={{ endAdornment: adornment('confirm') }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit" disabled={formik.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'Saving…' : 'Change Password'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

ChangePasswordDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};
