import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import {
  Alert,
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
import { CouponDialog } from 'src/sections/coupons/coupon-dialog';

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
];

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return format(new Date(value), 'dd MMM yyyy');
  } catch {
    return '—';
  }
};

const discountLabel = (c) => {
  if (!c) return '—';
  if (c.discountType === 'percentage') return `${c.discountValue || 0}%`;
  if (c.discountType === 'fixed') return `${c.discountValue || 0}`;
  return c.discountType;
};

const useDebounced = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);
  return debounced;
};

const Page = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [snack, setSnack] = useState(null);

  const debouncedSearch = useDebounced(search);

  const params = useMemo(() => {
    const p = {};
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    if (statusFilter === 'active') p.isActive = 'true';
    if (statusFilter === 'inactive') p.isActive = 'false';
    return p;
  }, [debouncedSearch, statusFilter]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/coupons', { params });
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load coupons');
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
      setSnack({ severity: 'success', message: 'Coupon created' });
      return;
    }
    setItems((prev) => prev.map((c) => (c._id === saved._id ? saved : c)));
    setSnack({ severity: 'success', message: 'Coupon updated' });
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete coupon ${item.code}?`)) return;
    try {
      await api.delete(`/api/coupons/${item._id}`);
      setItems((prev) => prev.filter((c) => c._id !== item._id));
      setSnack({ severity: 'success', message: 'Coupon deleted' });
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
        <title>Coupons</title>
      </Helmet>
      <Box sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4">Coupons</Typography>
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
                New coupon
              </Button>
            </Stack>
            <Card>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 3 }}>
                <TextField
                  fullWidth
                  label="Search"
                  placeholder="Filter by code"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <TextField
                  select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  {statusOptions.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
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
                        <TableCell>Code</TableCell>
                        <TableCell>Discount</TableCell>
                        <TableCell>Min order</TableCell>
                        <TableCell>Usage</TableCell>
                        <TableCell>Window</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right" />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7}>
                            <Typography
                              color="text.secondary"
                              variant="body2"
                              align="center"
                              sx={{ py: 4 }}
                            >
                              No coupons found.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      {items.map((c) => (
                        <TableRow hover key={c._id}>
                          <TableCell>
                            <Stack spacing={0}>
                              <Typography variant="subtitle2">{c.code}</Typography>
                              {c.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {c.description}
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{discountLabel(c)}</Typography>
                            {c.maxDiscount > 0 && (
                              <Typography variant="caption" color="text.secondary">
                                cap {c.maxDiscount}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{c.minOrderAmount || 0}</TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {c.usedCount || 0} / {c.usageLimit ? c.usageLimit : '∞'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              per user: {c.perUserLimit ?? 1}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(c.startDate)} – {formatDate(c.endDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={c.isActive ? 'success' : 'default'}
                              label={c.isActive ? 'Active' : 'Inactive'}
                              variant={c.isActive ? 'filled' : 'outlined'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditing(c);
                                  setDialogOpen(true);
                                }}
                              >
                                <SvgIcon fontSize="small">
                                  <PencilIcon />
                                </SvgIcon>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => handleDelete(c)}>
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
      <CouponDialog
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
