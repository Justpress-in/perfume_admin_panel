import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
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
  Snackbar,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { api } from 'src/lib/api';
import { OrderStatusDialog } from 'src/sections/order-statuses/order-status-dialog';

const Page = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [snack, setSnack] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/order-statuses');
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load statuses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSaved = (saved, { created }) => {
    if (!saved) return;
    if (created) {
      setItems((prev) => [...prev, saved].sort((a, b) => a.sortOrder - b.sortOrder));
    } else {
      setItems((prev) => prev.map((s) => (s._id === saved._id ? saved : s)));
    }
    setSnack({ severity: 'success', message: created ? 'Status created' : 'Status updated' });
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete status "${item.label}"? Existing orders with this status won't be affected.`)) return;
    try {
      await api.delete(`/api/order-statuses/${item._id}`);
      setItems((prev) => prev.filter((s) => s._id !== item._id));
      setSnack({ severity: 'success', message: 'Status deleted' });
    } catch (err) {
      setSnack({ severity: 'error', message: err?.response?.data?.message || 'Delete failed' });
    }
  };

  return (
    <>
      <Helmet><title>Order Statuses</title></Helmet>
      <Box sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack spacing={0.5}>
                <Typography variant="h4">Order Statuses</Typography>
                <Typography variant="body2" color="text.secondary">
                  Define the statuses that orders can be assigned to.
                </Typography>
              </Stack>
              <Button
                variant="contained"
                startIcon={<SvgIcon fontSize="small"><PlusIcon /></SvgIcon>}
                onClick={() => { setEditing(null); setDialogOpen(true); }}
              >
                New status
              </Button>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            <Card>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Scrollbar>
                  <Table sx={{ minWidth: 500 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell>Value (slug)</TableCell>
                        <TableCell>Colour</TableCell>
                        <TableCell>Sort</TableCell>
                        <TableCell>Default</TableCell>
                        <TableCell align="right" />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                            No statuses yet. Click "New status" to add one.
                          </TableCell>
                        </TableRow>
                      )}
                      {items.map((s) => (
                        <TableRow hover key={s._id}>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: s.color, flexShrink: 0 }} />
                              <Typography variant="subtitle2">{s.label}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 13 }}>{s.value}</Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Box sx={{ width: 20, height: 20, borderRadius: 0.5, bgcolor: s.color, border: '1px solid', borderColor: 'divider' }} />
                              <Typography variant="caption" color="text.secondary">{s.color}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{s.sortOrder}</TableCell>
                          <TableCell>
                            {s.isDefault && <Chip size="small" label="Default" color="primary" />}
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => { setEditing(s); setDialogOpen(true); }}>
                                <SvgIcon fontSize="small"><PencilIcon /></SvgIcon>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => handleDelete(s)}>
                                <SvgIcon fontSize="small"><TrashIcon /></SvgIcon>
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Scrollbar>
              )}
              <Divider />
            </Card>
          </Stack>
        </Container>
      </Box>

      <OrderStatusDialog
        open={dialogOpen}
        item={editing}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSaved={handleSaved}
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
