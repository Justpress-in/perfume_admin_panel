import { useRef, useState } from 'react';
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
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { api } from 'src/lib/api';

const emptyValues = {
  slug: '',
  nameEn: '',
  nameAr: '',
  addressEn: '',
  addressAr: '',
  phone: '',
  email: '',
  hoursEn: '',
  hoursAr: '',
  mapEmbed: '',
  navLink: '',
  latitude: '',
  longitude: '',
  sortOrder: 0,
  isActive: true
};

const validationSchema = Yup.object({
  slug: Yup.string().trim().required('Slug is required'),
  nameEn: Yup.string().trim().required('English name is required'),
  nameAr: Yup.string().trim().required('Arabic name is required'),
  addressEn: Yup.string().trim().required('English address is required'),
  addressAr: Yup.string().trim().required('Arabic address is required')
});

const toValues = (item) =>
  item
    ? {
        slug: item.slug || '',
        nameEn: item.name?.en || '',
        nameAr: item.name?.ar || '',
        addressEn: item.address?.en || '',
        addressAr: item.address?.ar || '',
        phone: item.phone || '',
        email: item.email || '',
        hoursEn: item.hours?.en || '',
        hoursAr: item.hours?.ar || '',
        mapEmbed: item.mapEmbed || '',
        navLink: item.navLink || '',
        latitude: item.latitude ?? '',
        longitude: item.longitude ?? '',
        sortOrder: item.sortOrder ?? 0,
        isActive: item.isActive !== false
      }
    : emptyValues;

const toPayload = (v) => ({
  slug: v.slug.trim().toLowerCase(),
  name: { en: v.nameEn.trim(), ar: v.nameAr.trim() },
  address: { en: v.addressEn.trim(), ar: v.addressAr.trim() },
  phone: v.phone.trim(),
  email: v.email.trim(),
  hours: { en: v.hoursEn.trim(), ar: v.hoursAr.trim() },
  mapEmbed: v.mapEmbed.trim(),
  navLink: v.navLink.trim(),
  latitude: v.latitude === '' ? undefined : Number(v.latitude),
  longitude: v.longitude === '' ? undefined : Number(v.longitude),
  sortOrder: Number(v.sortOrder) || 0,
  isActive: v.isActive
});

export const StoreDialog = ({ open, item, onClose, onSaved }) => {
  const isEdit = Boolean(item?._id);
  const [submitError, setSubmitError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const imagePreview = imageFile
    ? URL.createObjectURL(imageFile)
    : item?.image || '';

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: toValues(item),
    validationSchema,
    onSubmit: async (values, helpers) => {
      setSubmitError(null);
      try {
        const payload = toPayload(values);
        const { data } = isEdit
          ? await api.put(`/api/stores/${item._id}`, payload)
          : await api.post('/api/stores', payload);

        let saved = data?.data;

        if (imageFile && saved?._id) {
          setUploading(true);
          try {
            const form = new FormData();
            form.append('image', imageFile);
            const { data: up } = await api.post(
              `/api/stores/${saved._id}/image`,
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
    setImageFile(null);
    formik.resetForm();
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={() => handleClose()} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Edit store' : 'New store'}</DialogTitle>
      <DialogContent dividers>
        <form id="store-form" onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={2}>

            {/* ── Store image ── */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>Store image</Typography>
              {imagePreview ? (
                <Box
                  component="img"
                  src={imagePreview}
                  alt="store"
                  sx={{
                    width: '100%',
                    height: 180,
                    objectFit: 'cover',
                    borderRadius: 2,
                    mb: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 180,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'neutral.100',
                    borderRadius: 2,
                    mb: 1,
                    border: '1px dashed',
                    borderColor: 'divider'
                  }}
                >
                  <Stack alignItems="center" spacing={0.5}>
                    <PhotoCameraIcon color="disabled" fontSize="large" />
                    <Typography variant="caption" color="text.secondary">No image uploaded</Typography>
                  </Stack>
                </Box>
              )}
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PhotoCameraIcon />}
                  onClick={() => fileRef.current?.click()}
                >
                  {imagePreview ? 'Replace image' : 'Upload image'}
                </Button>
                {imageFile && (
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => setImageFile(null)}
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
                  if (f) setImageFile(f);
                  e.target.value = '';
                }}
              />
            </Box>

            <TextField
              fullWidth label="Slug" name="slug"
              value={formik.values.slug}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.slug && formik.errors.slug)}
              helperText={formik.touched.slug && formik.errors.slug}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth label="Name (English)" name="nameEn"
                value={formik.values.nameEn}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.nameEn && formik.errors.nameEn)}
                helperText={formik.touched.nameEn && formik.errors.nameEn}
              />
              <TextField
                fullWidth label="Name (Arabic)" name="nameAr"
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
                fullWidth multiline minRows={2} label="Address (English)" name="addressEn"
                value={formik.values.addressEn}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.addressEn && formik.errors.addressEn)}
                helperText={formik.touched.addressEn && formik.errors.addressEn}
              />
              <TextField
                fullWidth multiline minRows={2} label="Address (Arabic)" name="addressAr"
                value={formik.values.addressAr}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.addressAr && formik.errors.addressAr)}
                helperText={formik.touched.addressAr && formik.errors.addressAr}
                inputProps={{ dir: 'rtl' }}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth label="Phone" name="phone"
                value={formik.values.phone} onChange={formik.handleChange} />
              <TextField fullWidth label="Email" name="email"
                value={formik.values.email} onChange={formik.handleChange} />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth label="Hours (English)" name="hoursEn"
                value={formik.values.hoursEn} onChange={formik.handleChange} />
              <TextField fullWidth label="Hours (Arabic)" name="hoursAr"
                value={formik.values.hoursAr} onChange={formik.handleChange}
                inputProps={{ dir: 'rtl' }} />
            </Stack>

            <TextField
              fullWidth multiline minRows={2} label="Map embed (iframe or URL)" name="mapEmbed"
              value={formik.values.mapEmbed} onChange={formik.handleChange}
            />

            <TextField
              fullWidth label="Navigation link" name="navLink"
              value={formik.values.navLink} onChange={formik.handleChange}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth type="number" label="Latitude" name="latitude"
                inputProps={{ step: 'any' }}
                value={formik.values.latitude} onChange={formik.handleChange}
              />
              <TextField
                fullWidth type="number" label="Longitude" name="longitude"
                inputProps={{ step: 'any' }}
                value={formik.values.longitude} onChange={formik.handleChange}
              />
              <TextField
                label="Sort order" name="sortOrder" type="number"
                value={formik.values.sortOrder} onChange={formik.handleChange}
                sx={{ minWidth: 140 }}
              />
            </Stack>

            <FormControlLabel
              control={<Switch name="isActive" checked={formik.values.isActive} onChange={formik.handleChange} />}
              label="Active"
            />

            {submitError && <Alert severity="error">{submitError}</Alert>}
          </Stack>
        </form>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Box sx={{ flex: 1 }}>
          {uploading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">Uploading image…</Typography>
            </Stack>
          )}
        </Box>
        <Button onClick={() => handleClose()} disabled={formik.isSubmitting || uploading}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="store-form"
          variant="contained"
          disabled={formik.isSubmitting || uploading}
        >
          {formik.isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
