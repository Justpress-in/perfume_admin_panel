import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { api } from 'src/lib/api';
import { BannerDialog } from 'src/sections/banners/banner-dialog';

const sectionFilterOptions = [
  { label: 'All', value: '' },
  { label: 'Hero', value: 'hero' },
  { label: 'Promo', value: 'promo' },
  { label: 'Brand', value: 'brand' },
  { label: 'Homepage', value: 'homepage' },
  { label: 'Shop', value: 'shop' },
  { label: 'About', value: 'about' },
  { label: 'Custom', value: 'custom' }
];

const Page = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sectionFilter, setSectionFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [snack, setSnack] = useState(null);

  const params = useMemo(() => {
    const p = {};
    if (sectionFilter) p.section = sectionFilter;
    return p;
  }, [sectionFilter]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/banners', { params });
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load banners');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSaved = (saved, { created }) => {
    if (!saved) return;
    if (created) {
      fetchItems();
      setSnack({ severity: 'success', message: 'Banner created' });
      return;
    }
    setItems((prev) => prev.map((b) => (b._id === saved._id ? saved : b)));
    setSnack({ severity: 'success', message: 'Banner updated' });
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete this ${item.section} banner?`)) return;
    try {
      await api.delete(`/api/banners/${item._id}`);
      setItems((prev) => prev.filter((b) => b._id !== item._id));
      setSnack({ severity: 'success', message: 'Banner deleted' });
    } catch (err) {
      setSnack({
        severity: 'error',
        message: err?.response?.data?.message || 'Delete failed'
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Banners</title>
      </Helmet>
      <Box sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4">Banners / Homepage CMS</Typography>
              <Button
                variant="contained"
                startIcon={
                  <SvgIcon fontSize="small">
                    <PlusIcon />
                  </SvgIcon>
                }
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
              >
                New banner
              </Button>
            </Stack>
            <Card>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 3 }}>
                <TextField
                  select
                  label="Section"
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  {sectionFilterOptions.map((opt) => (
                    <MenuItem key={opt.value || 'all'} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <Divider />
              {error && (
                <Alert severity="error" sx={{ m: 3 }}>
                  {error}
                </Alert>
              )}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Scrollbar>
                  <Table sx={{ minWidth: 900 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Banner</TableCell>
                        <TableCell>Section</TableCell>
                        <TableCell>CTA</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Sort</TableCell>
                        <TableCell align="right" />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <Typography
                              color="text.secondary"
                              variant="body2"
                              align="center"
                              sx={{ py: 4 }}
                            >
                              No banners found.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      {items.map((b) => (
                        <TableRow hover key={b._id}>
                          <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar
                                variant="rounded"
                                src={b.image || undefined}
                                sx={{ width: 56, height: 36 }}
                              />
                              <Stack spacing={0}>
                                <Typography variant="subtitle2">
                                  {b.title?.en || '—'}
                                </Typography>
                                {b.subtitle?.en && (
                                  <Typography variant="caption" color="text.secondary">
                                    {b.subtitle.en}
                                  </Typography>
                                )}
                              </Stack>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={b.section} variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {b.ctaText?.en || '—'}
                            </Typography>
                            {b.ctaLink && (
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {b.ctaLink}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{b.isActive ? 'Active' : 'Inactive'}</TableCell>
                          <TableCell>{b.sortOrder ?? 0}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditing(b);
                                  setDialogOpen(true);
                                }}
                              >
                                <SvgIcon fontSize="small">
                                  <PencilIcon />
                                </SvgIcon>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => handleDelete(b)}>
                                <SvgIcon fontSize="small">
                                  <TrashIcon />
                                </SvgIcon>
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Scrollbar>
              )}
            </Card>
          </Stack>
        </Container>
      </Box>
      <BannerDialog
        open={dialogOpen}
        item={editing}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
      />
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
