import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
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
import { OfferDialog } from 'src/sections/offers/offer-dialog';

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return format(new Date(value), 'dd MMM yyyy');
  } catch {
    return '—';
  }
};

const discountLabel = (offer) => {
  if (!offer?.discountType) return '—';
  if (offer.discountType === 'percent') return `${offer.discountValue || 0}%`;
  if (offer.discountType === 'fixed') return `${offer.discountValue || 0}`;
  return offer.discountType;
};

const Page = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [snack, setSnack] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/offers');
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load offers');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSaved = (saved, { created }) => {
    if (!saved) return;
    if (created) {
      fetchItems();
      setSnack({ severity: 'success', message: 'Offer created' });
      return;
    }
    setItems((prev) => prev.map((o) => (o._id === saved._id ? saved : o)));
    setSnack({ severity: 'success', message: 'Offer updated' });
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete “${item.title?.en || item._id}”?`)) return;
    try {
      await api.delete(`/api/offers/${item._id}`);
      setItems((prev) => prev.filter((o) => o._id !== item._id));
      setSnack({ severity: 'success', message: 'Offer deleted' });
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
        <title>Offers</title>
      </Helmet>
      <Box sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4">Offers</Typography>
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
                New offer
              </Button>
            </Stack>
            <Card>
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
                        <TableCell>Offer</TableCell>
                        <TableCell>Discount</TableCell>
                        <TableCell>Window</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right" />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <Typography
                              color="text.secondary"
                              variant="body2"
                              align="center"
                              sx={{ py: 4 }}
                            >
                              No offers yet.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      {items.map((o) => (
                        <TableRow hover key={o._id}>
                          <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar variant="rounded" src={o.image || undefined} />
                              <Stack spacing={0}>
                                <Typography variant="subtitle2">
                                  {o.title?.en || '—'}
                                </Typography>
                                {o.badge && (
                                  <Chip size="small" color="primary" label={o.badge} />
                                )}
                              </Stack>
                            </Stack>
                          </TableCell>
                          <TableCell>{discountLabel(o)}</TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(o.startDate)} – {formatDate(o.endDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>{o.isActive ? 'Active' : 'Inactive'}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditing(o);
                                  setDialogOpen(true);
                                }}
                              >
                                <SvgIcon fontSize="small">
                                  <PencilIcon />
                                </SvgIcon>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => handleDelete(o)}>
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
              <Divider />
            </Card>
          </Stack>
        </Container>
      </Box>
      <OfferDialog
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
