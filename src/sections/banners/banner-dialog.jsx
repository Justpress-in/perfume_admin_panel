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
  Divider,
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

const sectionOptions = [
  { label: 'Hero',     value: 'hero' },
  { label: 'Promo',    value: 'promo' },
  { label: 'Brand',    value: 'brand' },
  { label: 'Homepage', value: 'homepage' },
  { label: 'Shop',     value: 'shop' },
  { label: 'About',    value: 'about' },
  { label: 'Custom',   value: 'custom' }
];

const emptyValues = {
  section: 'hero',
  titleEn: '', titleAr: '',
  subtitleEn: '', subtitleAr: '',
  descriptionEn: '', descriptionAr: '',
  video: '',
  ctaTextEn: '', ctaTextAr: '',
  ctaLink: '',
  startDate: '',
  endDate: '',
  sortOrder: 0,
  isActive: true
};

const validationSchema = Yup.object({
  section: Yup.string().required('Section is required')
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
        section: item.section || 'hero',
        titleEn: item.title?.en || '',
        titleAr: item.title?.ar || '',
        subtitleEn: item.subtitle?.en || '',
        subtitleAr: item.subtitle?.ar || '',
        descriptionEn: item.description?.en || '',
        descriptionAr: item.description?.ar || '',
        video: item.video || '',
        ctaTextEn: item.ctaText?.en || '',
        ctaTextAr: item.ctaText?.ar || '',
        ctaLink: item.ctaLink || '',
        startDate: isoToInput(item.startDate),
        endDate: isoToInput(item.endDate),
        sortOrder: item.sortOrder ?? 0,
        isActive: item.isActive !== false
      }
    : emptyValues;

const toPayload = (v) => ({
  section: v.section,
  title: { en: v.titleEn.trim(), ar: v.titleAr.trim() },
  subtitle: { en: v.subtitleEn.trim(), ar: v.subtitleAr.trim() },
  description: { en: v.descriptionEn.trim(), ar: v.descriptionAr.trim() },
  video: v.video.trim(),
  ctaText: { en: v.ctaTextEn.trim(), ar: v.ctaTextAr.trim() },
  ctaLink: v.ctaLink.trim(),
  startDate: v.startDate || null,
  endDate: v.endDate || null,
  sortOrder: Number(v.sortOrder) || 0,
  isActive: v.isActive
});

// Reusable image upload slot
const ImageSlot = ({ label, hint, existingUrl, file, onFileChange, onRemove }) => {
  const ref = useRef(null);
  const preview = file ? URL.createObjectURL(file) : existingUrl || '';

  return (
    <Box sx={{ flex: 1 }}>
      <Typography variant="subtitle2" gutterBottom>{label}</Typography>
      {preview ? (
        <Box
          component="img"
          src={preview}
          alt={label}
          sx={{
            width: '100%',
            height: 130,
            objectFit: 'cover',
            borderRadius: 1.5,
            mb: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: 130,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'neutral.100',
            borderRadius: 1.5,
            mb: 1,
            border: '1px dashed',
            borderColor: 'divider'
          }}
        >
          <PhotoCameraIcon color="disabled" fontSize="large" />
        </Box>
      )}
      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<PhotoCameraIcon />}
          onClick={() => ref.current?.click()}
        >
          {preview ? 'Replace' : 'Upload'}
        </Button>
        {file && (
          <Button
            size="small"
            color="inherit"
            startIcon={<DeleteOutlineIcon />}
            onClick={onRemove}
          >
            Remove
          </Button>
        )}
      </Stack>
      {hint && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {hint}
        </Typography>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileChange(f);
          e.target.value = '';
        }}
      />
    </Box>
  );
};

export const BannerDialog = ({ open, item, onClose, onSaved }) => {
  const isEdit = Boolean(item?._id);
  const [submitError, setSubmitError] = useState(null);
  const [desktopFile, setDesktopFile] = useState(null);
  const [mobileFile, setMobileFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: toValues(item),
    validationSchema,
    onSubmit: async (values, helpers) => {
      setSubmitError(null);
      try {
        const payload = toPayload(values);
        const { data } = isEdit
          ? await api.put(`/api/banners/${item._id}`, payload)
          : await api.post('/api/banners', payload);

        let saved = data?.data;

        // Upload desktop and/or mobile images after save
        if ((desktopFile || mobileFile) && saved?._id) {
          setUploading(true);
          try {
            if (desktopFile) {
              const form = new FormData();
              form.append('image', desktopFile);
              const { data: up } = await api.post(
                `/api/banners/${saved._id}/image?slot=desktop`,
                form,
                { headers: { 'Content-Type': 'multipart/form-data' } }
              );
              if (up?.data) saved = up.data;
            }
            if (mobileFile) {
              const form = new FormData();
              form.append('image', mobileFile);
              const { data: up } = await api.post(
                `/api/banners/${saved._id}/image?slot=mobile`,
                form,
                { headers: { 'Content-Type': 'multipart/form-data' } }
              );
              if (up?.data) saved = up.data;
            }
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
    setDesktopFile(null);
    setMobileFile(null);
    formik.resetForm();
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={() => handleClose()} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Edit banner' : 'New banner'}</DialogTitle>
      <DialogContent dividers>
        <form id="banner-form" onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={2}>

            <TextField
              select label="Section" name="section"
              value={formik.values.section}
              onChange={formik.handleChange}
              sx={{ maxWidth: 240 }}
            >
              {sectionOptions.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </TextField>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth label="Title (English)" name="titleEn"
                value={formik.values.titleEn} onChange={formik.handleChange} />
              <TextField fullWidth label="Title (Arabic)" name="titleAr"
                value={formik.values.titleAr} onChange={formik.handleChange}
                inputProps={{ dir: 'rtl' }} />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth label="Subtitle (English)" name="subtitleEn"
                value={formik.values.subtitleEn} onChange={formik.handleChange} />
              <TextField fullWidth label="Subtitle (Arabic)" name="subtitleAr"
                value={formik.values.subtitleAr} onChange={formik.handleChange}
                inputProps={{ dir: 'rtl' }} />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth multiline minRows={2} label="Description (English)" name="descriptionEn"
                value={formik.values.descriptionEn} onChange={formik.handleChange} />
              <TextField fullWidth multiline minRows={2} label="Description (Arabic)" name="descriptionAr"
                value={formik.values.descriptionAr} onChange={formik.handleChange}
                inputProps={{ dir: 'rtl' }} />
            </Stack>

            {/* ── Images ── */}
            <Divider textAlign="left">
              <Typography variant="caption" color="text.secondary">Images</Typography>
            </Divider>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <ImageSlot
                label="Desktop image"
                hint="Recommended: 1440×600 px. Uploaded after saving."
                existingUrl={item?.image}
                file={desktopFile}
                onFileChange={setDesktopFile}
                onRemove={() => setDesktopFile(null)}
              />
              <ImageSlot
                label="Mobile image"
                hint="Recommended: 768×500 px. Uploaded after saving."
                existingUrl={item?.mobileImage}
                file={mobileFile}
                onFileChange={setMobileFile}
                onRemove={() => setMobileFile(null)}
              />
            </Stack>

            <TextField fullWidth label="Video URL" name="video"
              value={formik.values.video} onChange={formik.handleChange} />

            {/* ── CTA ── */}
            <Divider textAlign="left">
              <Typography variant="caption" color="text.secondary">Call to action</Typography>
            </Divider>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth label="CTA text (English)" name="ctaTextEn"
                value={formik.values.ctaTextEn} onChange={formik.handleChange} />
              <TextField fullWidth label="CTA text (Arabic)" name="ctaTextAr"
                value={formik.values.ctaTextAr} onChange={formik.handleChange}
                inputProps={{ dir: 'rtl' }} />
              <TextField fullWidth label="CTA link" name="ctaLink"
                value={formik.values.ctaLink} onChange={formik.handleChange} />
            </Stack>

            {/* ── Schedule ── */}
            <Divider textAlign="left">
              <Typography variant="caption" color="text.secondary">Schedule & order</Typography>
            </Divider>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth type="date" label="Start date" name="startDate"
                InputLabelProps={{ shrink: true }}
                value={formik.values.startDate} onChange={formik.handleChange} />
              <TextField fullWidth type="date" label="End date" name="endDate"
                InputLabelProps={{ shrink: true }}
                value={formik.values.endDate} onChange={formik.handleChange} />
              <TextField label="Sort order" name="sortOrder" type="number"
                value={formik.values.sortOrder} onChange={formik.handleChange}
                sx={{ minWidth: 140 }} />
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
              <Typography variant="caption" color="text.secondary">Uploading images…</Typography>
            </Stack>
          )}
        </Box>
        <Button onClick={() => handleClose()} disabled={formik.isSubmitting || uploading}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="banner-form"
          variant="contained"
          disabled={formik.isSubmitting || uploading}
        >
          {formik.isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
