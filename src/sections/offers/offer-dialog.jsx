import { useCallback, useEffect, useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  InputAdornment,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography
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
  discountType: '',
  discountValue: 0,
  startDate: '',
  endDate: '',
  sortOrder: 0,
  isActive: true,
  products: [],
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
        discountType: item.discountType || '',
        discountValue: item.discountValue ?? 0,
        startDate: isoToInput(item.startDate),
        endDate: isoToInput(item.endDate),
        sortOrder: item.sortOrder ?? 0,
        isActive: item.isActive !== false,
        products: Array.isArray(item.products)
          ? item.products.map((p) => (typeof p === 'object' ? p._id : p))
          : [],
      }
    : emptyValues;

const toPayload = (v) => {
  const payload = {
    title: { en: v.titleEn.trim(), ar: v.titleAr.trim() },
    description: { en: v.descriptionEn.trim(), ar: v.descriptionAr.trim() },
    discountValue: Number(v.discountValue) || 0,
    startDate: v.startDate || null,
    endDate: v.endDate || null,
    sortOrder: Number(v.sortOrder) || 0,
    isActive: v.isActive,
    products: v.products,
  };
  if (v.discountType) payload.discountType = v.discountType;
  return payload;
};

const ImageUploader = ({ offerId, currentUrl, onUploaded }) => {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || '');

  useEffect(() => { setPreview(currentUrl || ''); }, [currentUrl]);

  const handleFile = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || !offerId) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post(`/api/offers/${offerId}/image`, fd);
      const url = data?.url || data?.data?.image || '';
      setPreview(url);
      onUploaded?.(url);
    } catch {
      // silent — user sees no change
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, [offerId, onUploaded]);

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" color="text.secondary">Offer image</Typography>
      {preview && (
        <Box
          component="img"
          src={preview}
          alt="offer"
          sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
        />
      )}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      <Button
        variant="outlined"
        size="small"
        disabled={uploading || !offerId}
        onClick={() => inputRef.current?.click()}
        startIcon={uploading ? <CircularProgress size={14} /> : null}
      >
        {uploading ? 'Uploading…' : preview ? 'Change image' : 'Upload image'}
      </Button>
      {!offerId && (
        <Typography variant="caption" color="text.secondary">
          Save the offer first, then upload an image.
        </Typography>
      )}
    </Stack>
  );
};

const ProductPicker = ({ value = [], onChange, productSearch, setProductSearch, allProducts, loadingProducts }) => {
  const filtered = allProducts.filter((p) => {
    const q = productSearch.toLowerCase();
    return !q || (p.name?.en || '').toLowerCase().includes(q) || (p.name?.ar || '').toLowerCase().includes(q);
  });

  const toggle = (id) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };

  const selectedProducts = allProducts.filter((p) => value.includes(p._id));

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" color="text.secondary">Associated products</Typography>

      {selectedProducts.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={0.5}>
          {selectedProducts.map((p) => (
            <Chip
              key={p._id}
              size="small"
              label={p.name?.en || p._id}
              avatar={<Avatar src={p.image} sx={{ width: 20, height: 20 }} />}
              onDelete={() => toggle(p._id)}
            />
          ))}
        </Stack>
      )}

      <TextField
        size="small"
        placeholder="Search products…"
        value={productSearch}
        onChange={(e) => setProductSearch(e.target.value)}
        InputProps={{
          endAdornment: loadingProducts
            ? <InputAdornment position="end"><CircularProgress size={14} /></InputAdornment>
            : null
        }}
      />

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          maxHeight: 220,
          overflowY: 'auto',
        }}
      >
        {filtered.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            No products found
          </Typography>
        )}
        {filtered.map((p) => (
          <Box
            key={p._id}
            onClick={() => toggle(p._id)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.75,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:last-child': { borderBottom: 0 },
            }}
          >
            <Checkbox size="small" checked={value.includes(p._id)} disableRipple sx={{ mr: 1, p: 0 }} />
            <ListItemAvatar sx={{ minWidth: 36 }}>
              <Avatar variant="rounded" src={p.image} sx={{ width: 28, height: 28 }} />
            </ListItemAvatar>
            <ListItemText
              primary={<Typography variant="body2">{p.name?.en || '—'}</Typography>}
              secondary={<Typography variant="caption" color="text.secondary">RM {p.price ?? '—'}</Typography>}
            />
          </Box>
        ))}
      </Box>
    </Stack>
  );
};

export const OfferDialog = ({ open, item, onClose, onSaved }) => {
  const isEdit = Boolean(item?._id);
  const [submitError, setSubmitError] = useState(null);
  const [savedId, setSavedId] = useState(item?._id || null);
  const [imageUrl, setImageUrl] = useState(item?.image || '');
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    setSavedId(item?._id || null);
    setImageUrl(item?.image || '');
    setProductSearch('');
  }, [open, item]);

  useEffect(() => {
    if (!open) return;
    setLoadingProducts(true);
    api.get('/api/products', { params: { limit: 200 } })
      .then(({ data }) => setAllProducts(Array.isArray(data?.data) ? data.data : []))
      .catch(() => setAllProducts([]))
      .finally(() => setLoadingProducts(false));
  }, [open]);

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
        const saved = data?.data;
        setSavedId(saved?._id || null);
        setImageUrl(saved?.image || imageUrl);
        onSaved?.(saved, { created: !isEdit });
        if (!isEdit) {
          // keep dialog open for image upload after first save
          helpers.setSubmitting(false);
        } else {
          handleClose(true);
        }
      } catch (err) {
        setSubmitError(err?.response?.data?.message || 'Save failed');
        helpers.setSubmitting(false);
      }
    }
  });

  const handleClose = (force = false) => {
    if (!force && formik.isSubmitting) return;
    setSubmitError(null);
    setSavedId(null);
    setImageUrl('');
    formik.resetForm();
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={() => handleClose()} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Edit offer' : 'New offer'}</DialogTitle>
      <DialogContent dividers>
        <form id="offer-form" onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={2.5}>
            {/* Image upload */}
            <ImageUploader
              offerId={savedId}
              currentUrl={imageUrl}
              onUploaded={(url) => setImageUrl(url)}
            />

            <Divider />

            {/* Titles */}
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

            {/* Descriptions */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth multiline minRows={2}
                label="Description (English)"
                name="descriptionEn"
                value={formik.values.descriptionEn}
                onChange={formik.handleChange}
              />
              <TextField
                fullWidth multiline minRows={2}
                label="Description (Arabic)"
                name="descriptionAr"
                value={formik.values.descriptionAr}
                onChange={formik.handleChange}
                inputProps={{ dir: 'rtl' }}
              />
            </Stack>

            {/* Discount */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select fullWidth
                label="Discount type"
                name="discountType"
                value={formik.values.discountType}
                onChange={formik.handleChange}
              >
                {discountTypes.map((t) => (
                  <MenuItem key={t.value || 'none'} value={t.value}>{t.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth type="number"
                label="Discount value"
                name="discountValue"
                value={formik.values.discountValue}
                onChange={formik.handleChange}
              />
            </Stack>

            {/* Dates / Sort */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth type="date"
                label="Start date"
                name="startDate"
                InputLabelProps={{ shrink: true }}
                value={formik.values.startDate}
                onChange={formik.handleChange}
              />
              <TextField
                fullWidth type="date"
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

            <Divider />

            {/* Product picker */}
            <ProductPicker
              value={formik.values.products}
              onChange={(ids) => formik.setFieldValue('products', ids)}
              productSearch={productSearch}
              setProductSearch={setProductSearch}
              allProducts={allProducts}
              loadingProducts={loadingProducts}
            />

            {submitError && <Alert severity="error">{submitError}</Alert>}

            {/* Hint shown after first create */}
            {savedId && !isEdit && (
              <Alert severity="info">
                Offer saved! You can now upload an image above, then close.
              </Alert>
            )}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={() => handleClose()} disabled={formik.isSubmitting}>
          {savedId && !isEdit ? 'Done' : 'Cancel'}
        </Button>
        {(!savedId || isEdit) && (
          <Button
            type="submit"
            form="offer-form"
            variant="contained"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
