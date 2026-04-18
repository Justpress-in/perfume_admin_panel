import { useEffect, useMemo, useRef, useState } from 'react';
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
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { api } from 'src/lib/api';

const emptyValues = {
  nameEn: '',
  nameAr: '',
  descriptionEn: '',
  descriptionAr: '',
  category: '',
  subcategory: '',
  price: '',
  stock: '',
  features: '',
  isActive: true,
  isFeatured: false,
  shopee: '',
  grab: '',
  lalamove: '',
  jnt: ''
};

const validationSchema = Yup.object({
  nameEn: Yup.string().trim().required('English name is required'),
  nameAr: Yup.string().trim().required('Arabic name is required'),
  category: Yup.string().trim().required('Category is required'),
  price: Yup.number().typeError('Price must be a number').min(0).required('Price is required'),
  stock: Yup.number().typeError('Stock must be a number').integer().min(0).required('Stock is required')
});

const productToValues = (product) => {
  if (!product) return emptyValues;
  return {
    nameEn: product.name?.en || '',
    nameAr: product.name?.ar || '',
    descriptionEn: product.description?.en || '',
    descriptionAr: product.description?.ar || '',
    category: product.category || '',
    subcategory: product.subcategory || '',
    price: product.price ?? '',
    stock: product.stock ?? '',
    features: Array.isArray(product.features) ? product.features.join(', ') : '',
    isActive: product.isActive !== false,
    isFeatured: Boolean(product.isFeatured),
    shopee: product.purchaseLinks?.shopee || '',
    grab: product.purchaseLinks?.grab || '',
    lalamove: product.purchaseLinks?.lalamove || '',
    jnt: product.purchaseLinks?.jnt || ''
  };
};

const valuesToPayload = (values) => ({
  name: { en: values.nameEn.trim(), ar: values.nameAr.trim() },
  description: {
    en: values.descriptionEn.trim(),
    ar: values.descriptionAr.trim()
  },
  category: values.category.trim(),
  subcategory: values.subcategory.trim(),
  price: Number(values.price),
  stock: Number(values.stock),
  features: values.features
    ? values.features.split(',').map((f) => f.trim()).filter(Boolean)
    : [],
  isActive: values.isActive,
  isFeatured: values.isFeatured,
  purchaseLinks: {
    shopee: values.shopee.trim(),
    grab: values.grab.trim(),
    lalamove: values.lalamove.trim(),
    jnt: values.jnt.trim()
  }
});

export const ProductDialog = ({ open, product, onClose, onSaved }) => {
  const isEdit = Boolean(product?._id);
  const fileInputRef = useRef(null);
  const [submitError, setSubmitError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const previewUrl = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    return product?.image || '';
  }, [imageFile, product]);

  useEffect(() => {
    return () => {
      if (imageFile && previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [imageFile, previewUrl]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: productToValues(product),
    validationSchema,
    onSubmit: async (values, helpers) => {
      setSubmitError(null);
      try {
        const payload = valuesToPayload(values);
        let saved;
        if (isEdit) {
          const { data } = await api.put(`/api/products/${product._id}`, payload);
          saved = data?.data;
        } else {
          const { data } = await api.post('/api/products', payload);
          saved = data?.data;
        }
        if (imageFile && saved?._id) {
          setUploading(true);
          const form = new FormData();
          form.append('image', imageFile);
          const { data: upload } = await api.post(
            `/api/products/${saved._id}/image`,
            form,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
          if (upload?.data) saved = upload.data;
        }
        onSaved?.(saved, { created: !isEdit });
        handleClose(true);
      } catch (err) {
        setSubmitError(err?.response?.data?.message || err?.message || 'Save failed');
        helpers.setSubmitting(false);
      } finally {
        setUploading(false);
      }
    }
  });

  const handleClose = (force = false) => {
    if (!force && (formik.isSubmitting || uploading)) return;
    setImageFile(null);
    setSubmitError(null);
    formik.resetForm();
    onClose?.();
  };

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) setImageFile(file);
    event.target.value = '';
  };

  const handleClearImage = () => setImageFile(null);

  return (
    <Dialog open={open} onClose={() => handleClose()} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Edit product' : 'New product'}</DialogTitle>
      <DialogContent dividers>
        <form id="product-form" onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
              <Avatar
                src={previewUrl || undefined}
                variant="rounded"
                sx={{ width: 96, height: 96, bgcolor: 'neutral.100' }}
              >
                <PhotoCameraIcon color="disabled" />
              </Avatar>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Product image</Typography>
                <Typography color="text.secondary" variant="caption">
                  PNG or JPG. Uploaded after the product is saved.
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PhotoCameraIcon />}
                    onClick={handlePickFile}
                  >
                    {imageFile ? 'Replace' : 'Choose image'}
                  </Button>
                  {imageFile && (
                    <Button
                      size="small"
                      color="inherit"
                      startIcon={<DeleteOutlineIcon />}
                      onClick={handleClearImage}
                    >
                      Remove
                    </Button>
                  )}
                </Stack>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
              </Stack>
            </Stack>

            <Divider />

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
                label="Category"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.category && formik.errors.category)}
                helperText={formik.touched.category && formik.errors.category}
              />
              <TextField
                fullWidth
                label="Subcategory"
                name="subcategory"
                value={formik.values.subcategory}
                onChange={formik.handleChange}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                inputProps={{ min: 0, step: '0.01' }}
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.price && formik.errors.price)}
                helperText={formik.touched.price && formik.errors.price}
              />
              <TextField
                fullWidth
                label="Stock"
                name="stock"
                type="number"
                inputProps={{ min: 0, step: 1 }}
                value={formik.values.stock}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.stock && formik.errors.stock)}
                helperText={formik.touched.stock && formik.errors.stock}
              />
            </Stack>

            <TextField
              fullWidth
              label="Features"
              name="features"
              placeholder="Comma-separated, e.g. Aged 10 Years, Alcohol-free"
              value={formik.values.features}
              onChange={formik.handleChange}
            />

            <Divider textAlign="left">
              <Typography variant="caption" color="text.secondary">
                Purchase links
              </Typography>
            </Divider>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Shopee"
                name="shopee"
                value={formik.values.shopee}
                onChange={formik.handleChange}
              />
              <TextField
                fullWidth
                label="Grab"
                name="grab"
                value={formik.values.grab}
                onChange={formik.handleChange}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Lalamove"
                name="lalamove"
                value={formik.values.lalamove}
                onChange={formik.handleChange}
              />
              <TextField
                fullWidth
                label="J&T"
                name="jnt"
                value={formik.values.jnt}
                onChange={formik.handleChange}
              />
            </Stack>

            <Stack direction="row" spacing={3}>
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
              <FormControlLabel
                control={
                  <Switch
                    name="isFeatured"
                    checked={formik.values.isFeatured}
                    onChange={formik.handleChange}
                  />
                }
                label="Featured"
              />
            </Stack>

            {submitError && <Alert severity="error">{submitError}</Alert>}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Box sx={{ flex: 1 }}>
          {uploading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">
                Uploading image…
              </Typography>
            </Stack>
          )}
        </Box>
        <Button onClick={() => handleClose()} disabled={formik.isSubmitting || uploading}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="product-form"
          variant="contained"
          disabled={formik.isSubmitting || uploading}
        >
          {formik.isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
