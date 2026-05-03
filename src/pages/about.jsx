import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Snackbar,
  Stack,
  Switch,
  SvgIcon,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { api } from 'src/lib/api';

/* ─── Section Dialog ─────────────────────────────────────────── */
const emptySec = { titleEn: '', titleAr: '', bodyEn: '', bodyAr: '', sortOrder: 0, isActive: true };

const SectionDialog = ({ open, section, aboutId, onClose, onSaved }) => {
  const isEdit = Boolean(section?._id);
  const [form, setForm] = useState(emptySec);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(section
        ? {
            titleEn: section.title?.en || '',
            titleAr: section.title?.ar || '',
            bodyEn: section.body?.en || '',
            bodyAr: section.body?.ar || '',
            sortOrder: section.sortOrder ?? 0,
            isActive: section.isActive !== false
          }
        : emptySec
      );
      setImageFile(null);
      setError(null);
    }
  }, [open, section]);

  const imagePreview = imageFile ? URL.createObjectURL(imageFile) : section?.image || '';

  const handleSave = async () => {
    if (!form.titleEn.trim()) { setError('English title is required'); return; }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: { en: form.titleEn.trim(), ar: form.titleAr.trim() },
        body:  { en: form.bodyEn.trim(),  ar: form.bodyAr.trim() },
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive
      };
      let { data } = isEdit
        ? await api.put(`/api/about/sections/${section._id}`, payload)
        : await api.post('/api/about/sections', payload);

      // upload image if selected
      if (imageFile) {
        const secId = isEdit ? section._id : data.data.sections[data.data.sections.length - 1]._id;
        setUploading(true);
        try {
          const fd = new FormData();
          fd.append('image', imageFile);
          const up = await api.post(`/api/about/sections/${secId}/image`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          data = up.data;
        } finally { setUploading(false); }
      }

      onSaved(data.data);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Edit section' : 'New section'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {/* image */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={imagePreview || undefined}
              variant="rounded"
              sx={{ width: 80, height: 80, bgcolor: 'neutral.100', flexShrink: 0 }}
            >
              <PhotoCameraIcon color="disabled" />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" gutterBottom>Section image</Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" startIcon={<PhotoCameraIcon />}
                  onClick={() => fileRef.current?.click()}>
                  {imageFile ? 'Replace' : imagePreview ? 'Change' : 'Upload'}
                </Button>
                {imageFile && (
                  <Button size="small" color="inherit" startIcon={<DeleteOutlineIcon />}
                    onClick={() => setImageFile(null)}>
                    Remove
                  </Button>
                )}
              </Stack>
              <input ref={fileRef} type="file" accept="image/*" hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setImageFile(f); e.target.value = ''; }} />
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth label="Title (English)" value={form.titleEn}
              onChange={(e) => setForm(p => ({ ...p, titleEn: e.target.value }))} />
            <TextField fullWidth label="Title (Arabic)" value={form.titleAr}
              onChange={(e) => setForm(p => ({ ...p, titleAr: e.target.value }))}
              inputProps={{ dir: 'rtl' }} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth multiline minRows={4} label="Body (English)" value={form.bodyEn}
              onChange={(e) => setForm(p => ({ ...p, bodyEn: e.target.value }))} />
            <TextField fullWidth multiline minRows={4} label="Body (Arabic)" value={form.bodyAr}
              onChange={(e) => setForm(p => ({ ...p, bodyAr: e.target.value }))}
              inputProps={{ dir: 'rtl' }} />
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField label="Sort order" type="number" value={form.sortOrder}
              onChange={(e) => setForm(p => ({ ...p, sortOrder: e.target.value }))}
              inputProps={{ min: 0 }} sx={{ width: 140 }} />
            <FormControlLabel
              control={<Switch checked={form.isActive}
                onChange={(e) => setForm(p => ({ ...p, isActive: e.target.checked }))} />}
              label="Active" />
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Box sx={{ flex: 1 }}>
          {uploading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">Uploading…</Typography>
            </Stack>
          )}
        </Box>
        <Button onClick={onClose} disabled={saving || uploading}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving || uploading}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ─── Page Title Dialog ──────────────────────────────────────── */
const TitleDialog = ({ open, pageTitle, onClose, onSaved }) => {
  const [en, setEn] = useState('');
  const [ar, setAr] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) { setEn(pageTitle?.en || ''); setAr(pageTitle?.ar || ''); setError(null); }
  }, [open, pageTitle]);

  const handleSave = async () => {
    if (!en.trim()) { setError('English title is required'); return; }
    setSaving(true);
    try {
      const { data } = await api.put('/api/about', { pageTitle: { en: en.trim(), ar: ar.trim() } });
      onSaved(data.data);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Edit page title</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField fullWidth label="Title (English)" value={en} onChange={(e) => setEn(e.target.value)} />
          <TextField fullWidth label="Title (Arabic)" value={ar} onChange={(e) => setAr(e.target.value)}
            inputProps={{ dir: 'rtl' }} />
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ─── Main Page ──────────────────────────────────────────────── */
const Page = () => {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState(null);

  const [titleDialogOpen, setTitleDialogOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

  const fetchAbout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/about');
      setAbout(data.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAbout(); }, [fetchAbout]);

  const handleDeleteSection = async (sec) => {
    if (!window.confirm(`Delete section "${sec.title?.en || 'Untitled'}"?`)) return;
    try {
      const { data } = await api.delete(`/api/about/sections/${sec._id}`);
      setAbout(data.data);
      setSnack({ severity: 'success', message: 'Section deleted' });
    } catch (err) {
      setSnack({ severity: 'error', message: err?.response?.data?.message || 'Delete failed' });
    }
  };

  const sections = about?.sections?.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) || [];

  return (
    <>
      <Helmet><title>About Page</title></Helmet>
      <Box sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack spacing={0.5}>
                <Typography variant="h4">About Page</Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage the content shown on the About page of your storefront.
                </Typography>
              </Stack>
              <Button
                variant="contained"
                startIcon={<SvgIcon fontSize="small"><PlusIcon /></SvgIcon>}
                onClick={() => { setEditingSection(null); setSectionDialogOpen(true); }}
              >
                Add section
              </Button>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Page title card */}
                <Card>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack spacing={0.5}>
                        <Typography variant="overline" color="text.secondary">Page title</Typography>
                        <Typography variant="h6">{about?.pageTitle?.en || 'About'}</Typography>
                        {about?.pageTitle?.ar && (
                          <Typography variant="body2" color="text.secondary" dir="rtl">
                            {about.pageTitle.ar}
                          </Typography>
                        )}
                      </Stack>
                      <Tooltip title="Edit title">
                        <IconButton onClick={() => setTitleDialogOpen(true)}>
                          <SvgIcon fontSize="small"><PencilIcon /></SvgIcon>
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Sections */}
                <Typography variant="h6">
                  Sections ({sections.length})
                </Typography>
                {sections.length === 0 && (
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                        No sections yet. Click "Add section" to create one.
                      </Typography>
                    </CardContent>
                  </Card>
                )}
                <Stack spacing={2}>
                  {sections.map((sec) => (
                    <Card key={sec._id}>
                      <CardContent>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Avatar
                            src={sec.image || undefined}
                            variant="rounded"
                            sx={{ width: 72, height: 72, flexShrink: 0 }}
                          />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {sec.title?.en || '(No title)'}
                              </Typography>
                              {sec.title?.ar && (
                                <Typography variant="caption" color="text.secondary" dir="rtl">
                                  {sec.title.ar}
                                </Typography>
                              )}
                              <Chip
                                size="small"
                                label={sec.isActive ? 'Active' : 'Inactive'}
                                color={sec.isActive ? 'success' : 'default'}
                                variant="outlined"
                              />
                              <Chip size="small" variant="outlined" label={`Sort: ${sec.sortOrder ?? 0}`} />
                            </Stack>
                            {sec.body?.en && (
                              <Typography variant="body2" color="text.secondary"
                                sx={{ overflow: 'hidden', display: '-webkit-box',
                                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {sec.body.en}
                              </Typography>
                            )}
                          </Box>
                          <Stack direction="row" spacing={0.5} flexShrink={0}>
                            <Tooltip title="Edit">
                              <IconButton size="small"
                                onClick={() => { setEditingSection(sec); setSectionDialogOpen(true); }}>
                                <SvgIcon fontSize="small"><PencilIcon /></SvgIcon>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => handleDeleteSection(sec)}>
                                <SvgIcon fontSize="small"><TrashIcon /></SvgIcon>
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </CardContent>
                      <Divider />
                    </Card>
                  ))}
                </Stack>
              </>
            )}
          </Stack>
        </Container>
      </Box>

      <TitleDialog
        open={titleDialogOpen}
        pageTitle={about?.pageTitle}
        onClose={() => setTitleDialogOpen(false)}
        onSaved={(updated) => { setAbout(updated); setSnack({ severity: 'success', message: 'Title updated' }); }}
      />
      <SectionDialog
        open={sectionDialogOpen}
        section={editingSection}
        onClose={() => { setSectionDialogOpen(false); setEditingSection(null); }}
        onSaved={(updated) => {
          setAbout(updated);
          setSnack({ severity: 'success', message: editingSection ? 'Section updated' : 'Section created' });
        }}
      />

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={3500}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {snack ? (
          <Alert severity={snack.severity} onClose={() => setSnack(null)}>{snack.message}</Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
};

export default Page;
