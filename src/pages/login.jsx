import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useAuth } from 'src/contexts/auth-context';

const validationSchema = Yup.object({
  email: Yup.string().email('Must be a valid email').required('Email is required'),
  password: Yup.string().required('Password is required')
});

const Page = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState(null);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema,
    onSubmit: async (values, helpers) => {
      setSubmitError(null);
      try {
        await login(values);
        navigate('/', { replace: true });
      } catch (err) {
        const message = err?.response?.data?.message || err?.message || 'Invalid credentials';
        setSubmitError(message);
        helpers.setSubmitting(false);
      }
    }
  });

  return (
    <>
      <Helmet>
        <title>Login</title>
      </Helmet>
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: 'background.default',
          display: 'flex',
          flexGrow: 1,
          minHeight: '100vh',
          py: 8
        }}
      >
        <Container maxWidth="sm">
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={1} sx={{ mb: 3 }}>
                <Typography variant="h5">Admin Login</Typography>
                <Typography color="text.secondary" variant="body2">
                  Sign in to manage the dashboard.
                </Typography>
              </Stack>
              <form onSubmit={formik.handleSubmit} noValidate>
                <Stack spacing={3}>
                  <TextField
                    autoFocus
                    fullWidth
                    label="Email address"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(formik.touched.email && formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(formik.touched.password && formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                  />
                  {submitError && <Alert severity="error">{submitError}</Alert>}
                  <Button
                    color="primary"
                    disabled={formik.isSubmitting}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                  >
                    {formik.isSubmitting ? 'Signing in…' : 'Sign in'}
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
};

export default Page;
