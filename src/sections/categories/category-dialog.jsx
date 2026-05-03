import { useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Avatar,
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
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { api } from 'src/lib/api';

const emptyValues = {
  slug: '',
  nameEn: '',
  nameAr: '',
  descriptionEn: '',
  descriptionAr: '',
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
        parent: item.parent?._id || item.parent || '',
        sortOrder: item.sortOrder ?? 0,
        isActive: item.isActive !== false
      }
    : emptyValues;

const toPayload = (v) => ({
  slug: v.slug.trim(),
  name: { en: v.nameEn.trim(), ar: v.nameAr.trim() },
  description: { en: v.descriptionEn.trim(), ar: v.descriptionAr.trim() },
  parent: v.parent || null,
  sortOrder: Math.max(0, Number(v.sortOrder) || 0),
  isActive: v.isActive
});

export const CategoryDialog = ({ open, item, parents = [], onClose, onSaved }) => {
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
          ? await api.put(`/api/categories/${item._id}`, payload)
          : await api.post('/api/categories', payload);

        let saved = data?.data;

        // Upload image if one was selected
        if (imageFile && saved?._id) {
          setUploading(true);
          try {
            const form = new FormData();
            form.append('image', imageFile);
            const { data: up } = await api.post(
              `/api/categories/${saved._id}/image`,
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

  const availableParents = parents.filter((p) => p._id !== item?._id);

  return (
    <Dialog open={open} onClose={() => handleClose()} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Edit category' : 'New category'}</DialogTitle>
      <DialogContent dividers>
        <form id="category-form" onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={2}>

            {/* ── Category image ── */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={imagePreview || undefined}
                variant="rounded"
                sx={{ width: 80, height: 80, bgcolor: 'neutral.100', flexShrink: 0 }}
              >
                <PhotoCameraIcon color="disabled" />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Category image</Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PhotoCameraIcon />}
                    onClick={() => fileRef.current?.click()}
                  >
                    {imageFile ? 'Replace' : imagePreview ? 'Change' : 'Upload image'}
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
            </Stack>

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
          form="category-form"
          variant="contained"
          disabled={formik.isSubmitting || uploading}
        >
          {formik.isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
