import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { api } from 'src/lib/api';

/* ── Inline quick-create panel (category or subcategory) ── */
const QuickCreate = ({ label, parentId, onCreated, onCancel }) => {
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const slugify = (s) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSave = async () => {
    if (!nameEn.trim()) { setErr('English name is required'); return; }
    setSaving(true);
    setErr('');
    try {
      const payload = {
        slug: slugify(nameEn),
        name: { en: nameEn.trim(), ar: nameAr.trim() },
        parent: parentId || null,
        isActive: true,
        sortOrder: 0,
      };
      const { data } = await api.post('/api/categories', payload);
      onCreated(data?.data);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to create');
      setSaving(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      <Stack spacing={1.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            size="small" fullWidth
            label="Name (English)"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            autoFocus
          />
          <TextField
            size="small" fullWidth
            label="Name (Arabic)"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            inputProps={{ dir: 'rtl' }}
          />
        </Stack>
        {err && <Alert severity="error" sx={{ py: 0 }}>{err}</Alert>}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button size="small" color="inherit" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button size="small" variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Create'}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

const PREDEFINED_SIZES = ['5 ml', '10 ml', '15 ml', '20 ml', '25 ml', '30 ml', '50 ml',
  '75 ml', '100 ml', '125 ml', '150 ml', '200 ml', '250 ml', '500 ml', '1 L',
  'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Small', 'Medium', 'Large', 'Travel Size', 'Full Size'];

const GENDER_OPTIONS = [
  { value: '',        label: '— None —' },
  { value: 'male',    label: 'Male' },
  { value: 'female',  label: 'Female' },
  { value: 'unisex',  label: 'Unisex' },
];

const emptyValues = {
  nameEn: '',
  nameAr: '',
  descriptionEn: '',
  descriptionAr: '',
  category: '',
  subcategory: '',
  gender: '',
  price: '',
  stock: '',
  features: '',
  isActive: true,
  isFeatured: false,
  shopee: '',
  lojada: '',
  tiktok: '',
  weightValue: '',
  weightUnit: 'g',
  dimLength: '',
  dimWidth: '',
  dimHeight: '',
  dimUnit: 'cm',
  sizeVariants: [],
};

const validationSchema = Yup.object({
  nameEn: Yup.string().trim().required('English name is required'),
  nameAr: Yup.string().trim().required('Arabic name is required'),
  category: Yup.string().trim().required('Category is required'),
  price: Yup.number().typeError('Price must be a number').min(0).required('Price is required'),
  stock: Yup.number().typeError('Stock must be a number').integer().min(0).required('Stock is required'),
  sizeVariants: Yup.array().of(
    Yup.object({
      label: Yup.string().trim().required('Size label is required'),
      price: Yup.number().typeError('Must be a number').min(0, 'Must be ≥ 0').required('Price required'),
    })
  ),
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
    gender: product.gender || '',
    price: product.price ?? '',
    stock: product.stock ?? '',
    features: Array.isArray(product.features) ? product.features.join(', ') : '',
    isActive: product.isActive !== false,
    isFeatured: Boolean(product.isFeatured),
    shopee: product.purchaseLinks?.shopee || '',
    lojada: product.purchaseLinks?.lojada || '',
    tiktok: product.purchaseLinks?.tiktok || '',
    weightValue: product.weight?.value ?? '',
    weightUnit: product.weight?.unit || 'g',
    dimLength: product.dimensions?.length ?? '',
    dimWidth: product.dimensions?.width ?? '',
    dimHeight: product.dimensions?.height ?? '',
    dimUnit: product.dimensions?.unit || 'cm',
    sizeVariants: Array.isArray(product.sizeVariants)
      ? product.sizeVariants.map(v => ({ label: v.label, price: v.price }))
      : [],
  };
};

const valuesToPayload = (values) => ({
  name: { en: values.nameEn.trim(), ar: values.nameAr.trim() },
  description: { en: values.descriptionEn.trim(), ar: values.descriptionAr.trim() },
  category: values.category.trim(),
  subcategory: values.subcategory.trim(),
  gender: values.gender,
  price: Number(values.price),
  stock: Number(values.stock),
  features: values.features
    ? values.features.split(',').map((f) => f.trim()).filter(Boolean)
    : [],
  isActive: values.isActive,
  isFeatured: values.isFeatured,
  purchaseLinks: {
    shopee: values.shopee.trim(),
    lojada: values.lojada.trim(),
    tiktok: values.tiktok.trim(),
  },
  weight: {
    value: values.weightValue !== '' ? Number(values.weightValue) : null,
    unit: values.weightUnit,
  },
  dimensions: {
    length: values.dimLength !== '' ? Number(values.dimLength) : null,
    width:  values.dimWidth  !== '' ? Number(values.dimWidth)  : null,
    height: values.dimHeight !== '' ? Number(values.dimHeight) : null,
    unit: values.dimUnit,
  },
  sizeVariants: values.sizeVariants.map(v => ({
    label: v.label.trim(),
    price: Number(v.price),
  })),
});

export const ProductDialog = ({ open, product, onClose, onSaved }) => {
  const isEdit = Boolean(product?._id);
  const primaryFileRef = useRef(null);
  const extraFilesRef = useRef(null);
  const [submitError, setSubmitError] = useState(null);
  const [primaryFile, setPrimaryFile] = useState(null);
  const [extraFiles, setExtraFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [sizeInput, setSizeInput] = useState('');
  const [sizeCustom, setSizeCustom] = useState(false);
  const [showNewCat, setShowNewCat] = useState(false);
  const [showNewSub, setShowNewSub] = useState(false);

  const reloadCategories = () =>
    api.get('/api/categories', { params: { nested: 'true' } }).then(({ data }) => {
      const list = Array.isArray(data?.data) ? data.data : [];
      setCategories(list.filter((c) => c.isActive !== false));
    }).catch(() => {});

  useEffect(() => { reloadCategories(); }, []);

  const primaryPreview = useMemo(() => {
    if (primaryFile) return URL.createObjectURL(primaryFile);
    return product?.image || '';
  }, [primaryFile, product]);

  useEffect(() => {
    return () => {
      if (primaryFile && primaryPreview?.startsWith('blob:')) URL.revokeObjectURL(primaryPreview);
    };
  }, [primaryFile, primaryPreview]);

  const extraPreviews = useMemo(() =>
    extraFiles.map(f => URL.createObjectURL(f)),
    [extraFiles]
  );

  useEffect(() => {
    return () => extraPreviews.forEach(u => URL.revokeObjectURL(u));
  }, [extraPreviews]);

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

        setUploading(true);

        // Upload primary image (replaces/sets first image)
        if (primaryFile && saved?._id) {
          const form = new FormData();
          form.append('image', primaryFile);
          const { data: upload } = await api.post(
            `/api/products/${saved._id}/image`,
            form,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
          if (upload?.data) saved = upload.data;
        }

        // Upload additional images
        if (extraFiles.length > 0 && saved?._id) {
          const form = new FormData();
          extraFiles.forEach(f => form.append('images', f));
          const { data: upload } = await api.post(
            `/api/products/${saved._id}/images`,
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
    setPrimaryFile(null);
    setExtraFiles([]);
    setSubmitError(null);
    setSizeInput('');
    setSizeCustom(false);
    setShowNewCat(false);
    setShowNewSub(false);
    formik.resetForm();
    onClose?.();
  };

  const handleExtraFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setExtraFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removeExtraFile = (idx) => setExtraFiles(prev => prev.filter((_, i) => i !== idx));

  const addSizeVariant = () => {
    const label = sizeInput.trim();
    if (!label) return;
    formik.setFieldValue('sizeVariants', [
      ...formik.values.sizeVariants,
      { label, price: '' },
    ]);
    setSizeInput('');
    setSizeCustom(false);
  };

  const removeSizeVariant = (idx) => {
    formik.setFieldValue('sizeVariants', formik.values.sizeVariants.filter((_, i) => i !== idx));
  };

  const updateVariantPrice = (idx, val) => {
    const updated = [...formik.values.sizeVariants];
    updated[idx] = { ...updated[idx], price: val };
    formik.setFieldValue('sizeVariants', updated);
  };

  const updateVariantLabel = (idx, val) => {
    const updated = [...formik.values.sizeVariants];
    updated[idx] = { ...updated[idx], label: val };
    formik.setFieldValue('sizeVariants', updated);
  };

  const [existingImages, setExistingImages] = useState(product?.images || []);
  const [deletingIdx, setDeletingIdx] = useState(null);

  // Keep existingImages in sync when product prop changes (dialog re-opens)
  useEffect(() => {
    setExistingImages(product?.images || []);
  }, [product]);

  const handleDeleteSavedImage = async (arrayIdx) => {
    if (!product?._id) return;
    setDeletingIdx(arrayIdx);
    try {
      const { data } = await api.delete(`/api/products/${product._id}/images/${arrayIdx}`);
      setExistingImages(data?.data?.images || []);
    } catch {
      // silently ignore; image stays visible
    } finally {
      setDeletingIdx(null);
    }
  };

  return (
    <Dialog open={open} onClose={() => handleClose()} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Edit product' : 'New product'}</DialogTitle>
      <DialogContent dividers>
        <form id="product-form" onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={3}>

            {/* ── Primary image ── */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
              <Avatar
                src={primaryPreview || undefined}
                variant="rounded"
                sx={{ width: 96, height: 96, bgcolor: 'neutral.100', flexShrink: 0 }}
              >
                <PhotoCameraIcon color="disabled" />
              </Avatar>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Primary image</Typography>
                <Typography color="text.secondary" variant="caption">
                  PNG or JPG. Uploaded after the product is saved.
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PhotoCameraIcon />}
                    onClick={() => primaryFileRef.current?.click()}
                  >
                    {primaryFile ? 'Replace' : 'Choose image'}
                  </Button>
                  {primaryFile && (
                    <Button
                      size="small"
                      color="inherit"
                      startIcon={<DeleteOutlineIcon />}
                      onClick={() => setPrimaryFile(null)}
                    >
                      Remove
                    </Button>
                  )}
                </Stack>
                <input
                  ref={primaryFileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setPrimaryFile(f); e.target.value = ''; }}
                />
              </Stack>
            </Stack>

            {/* ── Additional images ── */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>Additional photos</Typography>

              {/* Existing saved images (edit mode) — all including primary at index 0 */}
              {isEdit && existingImages.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                  {existingImages.map((img, arrayIdx) => (
                    <Box key={arrayIdx} sx={{ position: 'relative' }}>
                      <Avatar
                        src={img.url}
                        variant="rounded"
                        sx={{ width: 72, height: 72, opacity: deletingIdx === arrayIdx ? 0.4 : 1 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', fontSize: 10 }}>
                        {arrayIdx === 0 ? 'primary' : 'saved'}
                      </Typography>
                      <IconButton
                        size="small"
                        disabled={deletingIdx !== null}
                        onClick={() => handleDeleteSavedImage(arrayIdx)}
                        sx={{
                          position: 'absolute', top: -8, right: -8,
                          bgcolor: 'error.main',
                          color: '#fff',
                          border: '1px solid',
                          borderColor: 'error.dark',
                          p: 0.25,
                          '&:hover': { bgcolor: 'error.dark' },
                          '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
                        }}
                      >
                        {deletingIdx === arrayIdx
                          ? <CircularProgress size={12} sx={{ color: '#fff' }} />
                          : <CloseIcon sx={{ fontSize: 14 }} />
                        }
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              )}

              {/* New files staged for upload */}
              {extraPreviews.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                  {extraPreviews.map((url, idx) => (
                    <Box key={idx} sx={{ position: 'relative' }}>
                      <Avatar src={url} variant="rounded" sx={{ width: 72, height: 72 }} />
                      <IconButton
                        size="small"
                        onClick={() => removeExtraFile(idx)}
                        sx={{
                          position: 'absolute', top: -8, right: -8,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                          p: 0.25,
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              )}

              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => extraFilesRef.current?.click()}
              >
                Add photos
              </Button>
              <input
                ref={extraFilesRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleExtraFileChange}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Up to 10 additional images per upload.
              </Typography>
            </Box>

            <Divider />

            {/* ── Names ── */}
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

            {/* ── Descriptions ── */}
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

            {/* ── Category / Subcategory / Gender ── */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {/* Category */}
              <Box sx={{ flex: 1 }}>
                <TextField
                  select fullWidth label="Category" name="category"
                  value={formik.values.category}
                  onChange={(e) => {
                    formik.handleChange(e);
                    formik.setFieldValue('subcategory', '');
                    setShowNewSub(false);
                  }}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.category && formik.errors.category)}
                  helperText={formik.touched.category && formik.errors.category}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end" sx={{ mr: 2 }}>
                        <Tooltip title="Add new category">
                          <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); setShowNewCat((v) => !v); setShowNewSub(false); }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    )
                  }}
                >
                  {categories.length === 0 && <MenuItem value="" disabled>No categories found</MenuItem>}
                  {categories.map((cat) => (
                    <MenuItem key={cat._id || cat.slug} value={cat.slug}>
                      {cat.name?.en || cat.slug}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Subcategory */}
              <Box sx={{ flex: 1 }}>
                <TextField
                  select fullWidth label="Subcategory" name="subcategory"
                  value={formik.values.subcategory}
                  onChange={formik.handleChange}
                  disabled={!formik.values.category}
                  InputProps={{
                    endAdornment: formik.values.category ? (
                      <InputAdornment position="end" sx={{ mr: 2 }}>
                        <Tooltip title="Add new subcategory">
                          <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); setShowNewSub((v) => !v); setShowNewCat(false); }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ) : null
                  }}
                >
                  <MenuItem value="">— None —</MenuItem>
                  {(
                    categories
                      .find((c) => c.slug === formik.values.category)
                      ?.children
                      ?.filter((s) => s.isActive !== false)
                      ?.map((sub) => (
                        <MenuItem key={sub._id || sub.slug} value={sub.slug}>
                          {sub.name?.en || sub.slug}
                        </MenuItem>
                      )) || []
                  )}
                </TextField>
              </Box>

              {/* Gender */}
              <TextField
                select fullWidth label="Gender" name="gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
              >
                {GENDER_OPTIONS.map((g) => (
                  <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
                ))}
              </TextField>
            </Stack>

            {/* Quick-create: new top-level category */}
            {showNewCat && (
              <QuickCreate
                label="New category"
                parentId={null}
                onCreated={async (created) => {
                  await reloadCategories();
                  formik.setFieldValue('category', created.slug);
                  formik.setFieldValue('subcategory', '');
                  setShowNewCat(false);
                }}
                onCancel={() => setShowNewCat(false)}
              />
            )}

            {/* Quick-create: new subcategory under selected category */}
            {showNewSub && formik.values.category && (
              <QuickCreate
                label={`New subcategory under "${categories.find(c => c.slug === formik.values.category)?.name?.en || formik.values.category}"`}
                parentId={categories.find(c => c.slug === formik.values.category)?._id}
                onCreated={async (created) => {
                  await reloadCategories();
                  formik.setFieldValue('subcategory', created.slug);
                  setShowNewSub(false);
                }}
                onCancel={() => setShowNewSub(false)}
              />
            )}

            {/* ── Base Price / Stock ── */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth label="Base Price" name="price" type="number"
                inputProps={{ min: 0, step: '0.01' }}
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.price && formik.errors.price)}
                helperText={(formik.touched.price && formik.errors.price) || 'Used when no size variants are defined'}
              />
              <TextField
                fullWidth label="Stock" name="stock" type="number"
                inputProps={{ min: 0, step: 1 }}
                value={formik.values.stock}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.stock && formik.errors.stock)}
                helperText={formik.touched.stock && formik.errors.stock}
              />
            </Stack>

            {/* ── Size Variants ── */}
            <Divider textAlign="left">
              <Typography variant="caption" color="text.secondary">Size variants & pricing</Typography>
            </Divider>

            {formik.values.sizeVariants.length > 0 && (
              <Stack spacing={1.5}>
                {formik.values.sizeVariants.map((variant, idx) => (
                  <Stack key={idx} direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={`Option ${String.fromCharCode(65 + idx)}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ minWidth: 72 }}
                    />
                    <TextField
                      size="small"
                      label="Size"
                      value={variant.label}
                      onChange={(e) => updateVariantLabel(idx, e.target.value)}
                      sx={{ width: 160 }}
                      error={Boolean(
                        formik.touched.sizeVariants?.[idx]?.label &&
                        formik.errors.sizeVariants?.[idx]?.label
                      )}
                    />
                    <TextField
                      size="small"
                      label="Price"
                      type="number"
                      inputProps={{ min: 0, step: '0.01' }}
                      value={variant.price}
                      onChange={(e) => updateVariantPrice(idx, e.target.value)}
                      sx={{ width: 120 }}
                      error={Boolean(
                        formik.touched.sizeVariants?.[idx]?.price &&
                        formik.errors.sizeVariants?.[idx]?.price
                      )}
                    />
                    <Tooltip title="Remove">
                      <IconButton size="small" onClick={() => removeSizeVariant(idx)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ))}
              </Stack>
            )}

            {/* Add size variant row */}
            <Stack direction="row" spacing={1} alignItems="flex-start">
              {sizeCustom ? (
                <TextField
                  size="small"
                  label="Custom size label"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSizeVariant(); } }}
                  placeholder="e.g. 100 ml, Travel Size…"
                  sx={{ width: 220 }}
                />
              ) : (
                <TextField
                  select size="small" label="Select size"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  sx={{ width: 220 }}
                >
                  {PREDEFINED_SIZES.map(s => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
              )}
              <Button
                size="small"
                variant="text"
                onClick={() => { setSizeCustom(!sizeCustom); setSizeInput(''); }}
              >
                {sizeCustom ? 'Use list' : 'Custom'}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addSizeVariant}
                disabled={!sizeInput.trim()}
              >
                Add size
              </Button>
            </Stack>

            <Typography variant="caption" color="text.secondary">
              If size variants are set, each variant&apos;s price is used instead of the base price.
              Example: Option A: 100 ml – $50 / Option B: 200 ml – $90
            </Typography>

            {/* ── Physical Specs ── */}
            <Divider textAlign="left">
              <Typography variant="caption" color="text.secondary">Physical specifications</Typography>
            </Divider>

            {/* Weight */}
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Weight"
                name="weightValue"
                type="number"
                inputProps={{ min: 0, step: '0.01' }}
                value={formik.values.weightValue}
                onChange={formik.handleChange}
                sx={{ width: 160 }}
                size="small"
              />
              <TextField
                select label="Unit" name="weightUnit"
                value={formik.values.weightUnit}
                onChange={formik.handleChange}
                sx={{ width: 100 }}
                size="small"
              >
                {['g', 'kg', 'oz', 'lb'].map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </TextField>
            </Stack>

            {/* Dimensions */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                label="Length" name="dimLength" type="number"
                inputProps={{ min: 0, step: '0.1' }}
                value={formik.values.dimLength}
                onChange={formik.handleChange}
                size="small" fullWidth
              />
              <TextField
                label="Width" name="dimWidth" type="number"
                inputProps={{ min: 0, step: '0.1' }}
                value={formik.values.dimWidth}
                onChange={formik.handleChange}
                size="small" fullWidth
              />
              <TextField
                label="Height" name="dimHeight" type="number"
                inputProps={{ min: 0, step: '0.1' }}
                value={formik.values.dimHeight}
                onChange={formik.handleChange}
                size="small" fullWidth
              />
              <TextField
                select label="Unit" name="dimUnit"
                value={formik.values.dimUnit}
                onChange={formik.handleChange}
                sx={{ minWidth: 90 }}
                size="small"
              >
                {['cm', 'mm', 'in'].map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </TextField>
            </Stack>

            {/* ── Features ── */}
            <TextField
              fullWidth
              label="Features"
              name="features"
              placeholder="Comma-separated, e.g. Aged 10 Years, Alcohol-free"
              value={formik.values.features}
              onChange={formik.handleChange}
            />

            {/* ── Purchase links ── */}
            <Divider textAlign="left">
              <Typography variant="caption" color="text.secondary">Purchase links</Typography>
            </Divider>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth label="Shopee" name="shopee" value={formik.values.shopee} onChange={formik.handleChange} />
              <TextField fullWidth label="Lojada" name="lojada" value={formik.values.lojada} onChange={formik.handleChange} />
            </Stack>
            <TextField fullWidth label="TikTok Shop" name="tiktok" value={formik.values.tiktok} onChange={formik.handleChange} />

            {/* ── Toggles ── */}
            <Stack direction="row" spacing={3}>
              <FormControlLabel
                control={<Switch name="isActive" checked={formik.values.isActive} onChange={formik.handleChange} />}
                label="Active"
              />
              <FormControlLabel
                control={<Switch name="isFeatured" checked={formik.values.isFeatured} onChange={formik.handleChange} />}
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
              <Typography variant="caption" color="text.secondary">Uploading images…</Typography>
            </Stack>
          )}
        </Box>
        <Button onClick={() => handleClose()} disabled={formik.isSubmitting || uploading}>Cancel</Button>
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
