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
import { StoreDialog } from 'src/sections/stores/store-dialog';

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
];

const Page = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [snack, setSnack] = useState(null);

  const params = useMemo(() => {
    const p = {};
    if (statusFilter === 'active') p.isActive = 'true';
    if (statusFilter === 'inactive') p.isActive = 'false';
    return p;
  }, [statusFilter]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/stores', { params });
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load stores');
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
      setSnack({ severity: 'success', message: 'Store created' });
      return;
    }
    setItems((prev) => prev.map((s) => (s._id === saved._id ? saved : s)));
    setSnack({ severity: 'success', message: 'Store updated' });
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete “${item.name?.en || item.slug}”?`)) return;
    try {
      await api.delete(`/api/stores/${item._id}`);
      setItems((prev) => prev.filter((s) => s._id !== item._id));
      setSnack({ severity: 'success', message: 'Store deleted' });
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
        <title>Stores</title>
      </Helmet>
      <Box sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4">Stores</Typography>
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
                New store
              </Button>
            </Stack>
            <Card>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 3 }}>
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
                        <TableCell>Store</TableCell>
                        <TableCell>Slug</TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell>Hours</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Sort</TableCell>
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
                              No stores yet.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      {items.map((s) => (
                        <TableRow hover key={s._id}>
                          <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar variant="rounded" src={s.image || undefined} />
                              <Stack spacing={0}>
                                <Typography variant="subtitle2">
                                  {s.name?.en || s.slug}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {s.address?.en}
                                </Typography>
                              </Stack>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" variant="outlined" label={s.slug} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{s.phone || '—'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {s.email}
                            </Typography>
                          </TableCell>
                          <TableCell>{s.hours?.en || '—'}</TableCell>
                          <TableCell>{s.isActive ? 'Active' : 'Inactive'}</TableCell>
                          <TableCell>{s.sortOrder ?? 0}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditing(s);
                                  setDialogOpen(true);
                                }}
                              >
                                <SvgIcon fontSize="small">
                                  <PencilIcon />
                                </SvgIcon>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => handleDelete(s)}>
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
      <StoreDialog
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
