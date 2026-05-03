import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFormik } from 'formik';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { api } from 'src/lib/api';

/* Reusable inline upload widget for logo / favicon */
const AssetUploader = ({ label, hint, currentUrl, slot, onUploaded }) => {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const preview = file ? URL.createObjectURL(file) : currentUrl || '';

  const handleUpload = async (selected) => {
    setFile(selected);
    setError('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', selected);
      const { data } = await api.post(
        `/api/settings/upload?slot=${slot}`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      onUploaded?.(data?.url || '');
      setFile(null);
    } catch (e) {
      setError(e?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ flex: 1 }}>
      <Typography variant="subtitle2" gutterBottom>{label}</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          src={preview || undefined}
          variant="rounded"
          sx={{
            width: slot === 'favicon' ? 48 : 80,
            height: slot === 'favicon' ? 48 : 80,
            bgcolor: 'neutral.100',
            border: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
            '& img': { objectFit: 'contain' }
          }}
        >
          <PhotoCameraIcon color="disabled" />
        </Avatar>
        <Stack spacing={0.75}>
          <Stack direction="row" spacing={1}>
            <Tooltip title={`Upload ${label}`}>
              <Button
                size="small"
                variant="outlined"
                startIcon={uploading ? <CircularProgress size={14} /> : <PhotoCameraIcon />}
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading…' : preview ? 'Replace' : 'Upload'}
              </Button>
            </Tooltip>
            {preview && !uploading && (
              <Button
                size="small"
                color="inherit"
                startIcon={<DeleteOutlineIcon />}
                onClick={() => onUploaded?.('')}
              >
                Remove
              </Button>
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">{hint}</Typography>
          {error && <Typography variant="caption" color="error.main">{error}</Typography>}
        </Stack>
      </Stack>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUpload(f);
          e.target.value = '';
        }}
      />
    </Box>
  );
};

const emptyValues = {
  siteNameEn: '',
  siteNameAr: '',
  taglineEn: '',
  taglineAr: '',
  logo: '',
  favicon: '',
  contactEmail: '',
  contactPhone: '',
  whatsapp: '',
  addressEn: '',
  addressAr: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  youtube: '',
  twitter: '',
  currency: 'USD',
  currencySymbol: '$',
  freeShippingThreshold: 0,
  flatRate: 0,
  taxRate: 0,
  wholesaleDiscountPercent: 0,
  metaTitleEn: '',
  metaTitleAr: '',
  metaDescriptionEn: '',
  metaDescriptionAr: '',
  keywords: '',
  maintenanceMode: false
};

const toValues = (data) => {
  if (!data) return emptyValues;
  return {
    siteNameEn: data.siteName?.en || '',
    siteNameAr: data.siteName?.ar || '',
    taglineEn: data.tagline?.en || '',
    taglineAr: data.tagline?.ar || '',
    logo: data.logo || '',
    favicon: data.favicon || '',
    contactEmail: data.contactEmail || '',
    contactPhone: data.contactPhone || '',
    whatsapp: data.whatsapp || '',
    addressEn: data.address?.en || '',
    addressAr: data.address?.ar || '',
    instagram: data.social?.instagram || '',
    facebook: data.social?.facebook || '',
    tiktok: data.social?.tiktok || '',
    youtube: data.social?.youtube || '',
    twitter: data.social?.twitter || '',
    currency: data.currency || 'USD',
    currencySymbol: data.currencySymbol || '$',
    freeShippingThreshold: data.shipping?.freeShippingThreshold ?? 0,
    flatRate: data.shipping?.flatRate ?? 0,
    taxRate: data.taxRate ?? 0,
    wholesaleDiscountPercent: data.wholesaleDiscountPercent ?? 0,
    metaTitleEn: data.seo?.metaTitle?.en || '',
    metaTitleAr: data.seo?.metaTitle?.ar || '',
    metaDescriptionEn: data.seo?.metaDescription?.en || '',
    metaDescriptionAr: data.seo?.metaDescription?.ar || '',
    keywords: Array.isArray(data.seo?.keywords)
      ? data.seo.keywords.join(', ')
      : data.seo?.keywords || '',
    maintenanceMode: Boolean(data.maintenanceMode)
  };
};

const toPayload = (v) => ({
  siteName: { en: v.siteNameEn.trim(), ar: v.siteNameAr.trim() },
  tagline: { en: v.taglineEn.trim(), ar: v.taglineAr.trim() },
  contactEmail: v.contactEmail.trim(),
  contactPhone: v.contactPhone.trim(),
  whatsapp: v.whatsapp.trim(),
  address: { en: v.addressEn.trim(), ar: v.addressAr.trim() },
  social: {
    instagram: v.instagram.trim(),
    facebook: v.facebook.trim(),
    tiktok: v.tiktok.trim(),
    youtube: v.youtube.trim(),
    twitter: v.twitter.trim()
  },
  currency: v.currency.trim(),
  currencySymbol: v.currencySymbol.trim(),
  shipping: {
    freeShippingThreshold: Number(v.freeShippingThreshold) || 0,
    flatRate: Number(v.flatRate) || 0
  },
  taxRate: Number(v.taxRate) || 0,
  wholesaleDiscountPercent: Number(v.wholesaleDiscountPercent) || 0,
  seo: {
    metaTitle: { en: v.metaTitleEn.trim(), ar: v.metaTitleAr.trim() },
    metaDescription: {
      en: v.metaDescriptionEn.trim(),
      ar: v.metaDescriptionAr.trim()
    },
    keywords: v.keywords
      ? v.keywords.split(',').map((k) => k.trim()).filter(Boolean)
      : []
  },
  maintenanceMode: v.maintenanceMode
});

const Section = ({ title, children }) => (
  <Stack spacing={2}>
    <Typography variant="h6">{title}</Typography>
    <Stack spacing={2}>{children}</Stack>
  </Stack>
);

const Page = () => {
  const [initial, setInitial] = useState(emptyValues);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/settings');
      setInitial(toValues(data?.data));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initial,
    onSubmit: async (values, helpers) => {
      try {
        const { data } = await api.put('/api/settings', toPayload(values));
        setInitial(toValues(data?.data));
        setSnack({ severity: 'success', message: 'Settings saved' });
      } catch (err) {
        setSnack({
          severity: 'error',
          message: err?.response?.data?.message || 'Save failed'
        });
      } finally {
        helpers.setSubmitting(false);
      }
    }
  });

  return (
    <>
      <Helmet>
        <title>Settings</title>
      </Helmet>
      <Box sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Typography variant="h4">Settings</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : (
              <form onSubmit={formik.handleSubmit} noValidate>
                <Card sx={{ p: 3 }}>
                  <Stack spacing={4} divider={<Divider flexItem />}>
                    <Section title="Branding">
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          fullWidth
                          label="Site name (English)"
                          name="siteNameEn"
                          value={formik.values.siteNameEn}
                          onChange={formik.handleChange}
                        />
                        <TextField
                          fullWidth
                          label="Site name (Arabic)"
                          name="siteNameAr"
                          value={formik.values.siteNameAr}
                          onChange={formik.handleChange}
                          inputProps={{ dir: 'rtl' }}
                        />
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          fullWidth
                          label="Tagline (English)"
                          name="taglineEn"
                          value={formik.values.taglineEn}
                          onChange={formik.handleChange}
                        />
                        <TextField
                          fullWidth
                          label="Tagline (Arabic)"
                          name="taglineAr"
                          value={formik.values.taglineAr}
                          onChange={formik.handleChange}
                          inputProps={{ dir: 'rtl' }}
                        />
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                        <AssetUploader
                          label="Logo"
                          hint="PNG or SVG recommended. Shown in the header and emails."
                          slot="logo"
                          currentUrl={formik.values.logo}
                          onUploaded={(url) => formik.setFieldValue('logo', url)}
                        />
                        <AssetUploader
                          label="Favicon"
                          hint="ICO, PNG 32×32 or 64×64. Shown in browser tabs."
                          slot="favicon"
                          currentUrl={formik.values.favicon}
                          onUploaded={(url) => formik.setFieldValue('favicon', url)}
                        />
                      </Stack>
                    </Section>

                    <Section title="Contact">
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          fullWidth
                          label="Contact email"
                          name="contactEmail"
                          value={formik.values.contactEmail}
                          onChange={formik.handleChange}
                        />
                        <TextField
                          fullWidth
                          label="Contact phone"
                          name="contactPhone"
                          value={formik.values.contactPhone}
                          onChange={formik.handleChange}
                        />
                        <TextField
                          fullWidth
                          label="WhatsApp"
                          name="whatsapp"
                          value={formik.values.whatsapp}
                          onChange={formik.handleChange}
                        />
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          label="Address (English)"
                          name="addressEn"
                          value={formik.values.addressEn}
                          onChange={formik.handleChange}
                        />
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          label="Address (Arabic)"
                          name="addressAr"
                          value={formik.values.addressAr}
                          onChange={formik.handleChange}
                          inputProps={{ dir: 'rtl' }}
                        />
                      </Stack>
                    </Section>

                    <Section title="Social">
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          fullWidth
                          label="Instagram"
                          name="instagram"
                          value={formik.values.instagram}
                          onChange={formik.handleChange}
                        />
                        <TextField
                          fullWidth
                          label="Facebook"
                          name="facebook"
                          value={formik.values.facebook}
                          onChange={formik.handleChange}
                        />
                        <TextField
                          fullWidth
                          label="TikTok"
                          name="tiktok"
                          value={formik.values.tiktok}
                          onChange={formik.handleChange}
                        />
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          fullWidth
                          label="YouTube"
                          name="youtube"
                          value={formik.values.youtube}
                          onChange={formik.handleChange}
                        />
                        <TextField
                          fullWidth
                          label="Twitter / X"
                          name="twitter"
                          value={formik.values.twitter}
                          onChange={formik.handleChange}
                        />
                      </Stack>
                    </Section>

                    <Section title="Commerce">
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          fullWidth
                          label="Currency"
                          name="currency"
                          value={formik.values.currency}
                          onChange={formik.handleChange}
                        />
                        <TextField
                          fullWidth
                          label="Currency symbol"
                          name="currencySymbol"
                          value={formik.values.currencySymbol}
                          onChange={formik.handleChange}
                        />
                        <TextField
                          fullWidth
                          type="number"
                          label="Tax rate (%)"
                          name="taxRate"
                          value={formik.values.taxRate}
                          onChange={formik.handleChange}
                        />
                        <TextField
                          fullWidth
                          type="number"
                          label="Wholesale discount (%)"
                          name="wholesaleDiscountPercent"
                          value={formik.values.wholesaleDiscountPercent}
                          onChange={formik.handleChange}
                        />
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Free shipping threshold"
                          name="freeShippingThreshold"
                          value={formik.values.freeShippingThreshold}
                          onChange={formik.handleChange}
                        />
                        <TextField
                          fullWidth
                          type="number"
                          label="Flat shipping rate"
                          name="flatRate"
                          value={formik.values.flatRate}
                          onChange={formik.handleChange}
                        />
                      </Stack>
                    </Section>

                    <Section title="SEO">
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          fullWidth
                          label="Meta title (English)"
                          name="metaTitleEn"
                          value={formik.values.metaTitleEn}
                          onChange={formik.handleChange}
                        />
                        <TextField
                          fullWidth
                          label="Meta title (Arabic)"
                          name="metaTitleAr"
                          value={formik.values.metaTitleAr}
                          onChange={formik.handleChange}
                          inputProps={{ dir: 'rtl' }}
                        />
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          label="Meta description (English)"
                          name="metaDescriptionEn"
                          value={formik.values.metaDescriptionEn}
                          onChange={formik.handleChange}
                        />
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          label="Meta description (Arabic)"
                          name="metaDescriptionAr"
                          value={formik.values.metaDescriptionAr}
                          onChange={formik.handleChange}
                          inputProps={{ dir: 'rtl' }}
                        />
                      </Stack>
                      <TextField
                        fullWidth
                        label="Keywords"
                        name="keywords"
                        placeholder="Comma-separated"
                        value={formik.values.keywords}
                        onChange={formik.handleChange}
                      />
                    </Section>

                    <Section title="System">
                      <FormControlLabel
                        control={
                          <Switch
                            name="maintenanceMode"
                            checked={formik.values.maintenanceMode}
                            onChange={formik.handleChange}
                          />
                        }
                        label="Maintenance mode"
                      />
                    </Section>
                  </Stack>
                  <Box sx={{ mt: 3 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={formik.isSubmitting}
                    >
                      {formik.isSubmitting ? 'Saving…' : 'Save settings'}
                    </Button>
                  </Box>
                </Card>
              </form>
            )}
          </Stack>
        </Container>
      </Box>
      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={3500}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {snack ? (
          <Alert severity={snack.severity} onClose={() => setSnack(null)}>
            {snack.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
};

export default Page;
