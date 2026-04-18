import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import {
  Alert,
  Box,
  Card,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  MenuItem,
  Rating,
  Snackbar,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { api } from 'src/lib/api';

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' }
];

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return format(new Date(value), 'dd MMM yyyy HH:mm');
  } catch {
    return '—';
  }
};

const Page = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [statusFilter, setStatusFilter] = useState('all');

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState(null);

  const params = useMemo(() => {
    const p = { page: page + 1, limit: rowsPerPage };
    if (statusFilter === 'approved') p.isApproved = 'true';
    if (statusFilter === 'pending') p.isApproved = 'false';
    return p;
  }, [page, rowsPerPage, statusFilter]);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/reviews', { params });
      setItems(Array.isArray(data?.data) ? data.data : []);
      setTotal(data?.pagination?.total ?? 0);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load reviews');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    setPage(0);
  }, [statusFilter, rowsPerPage]);

  const handleApprove = async (item) => {
    try {
      const { data } = await api.patch(`/api/reviews/${item._id}/approve`);
      const updated = data?.data;
      setItems((prev) =>
        prev.map((r) => (r._id === item._id ? { ...r, ...(updated || { isApproved: true }) } : r))
      );
      setSnack({ severity: 'success', message: 'Review approved' });
    } catch (err) {
      setSnack({
        severity: 'error',
        message: err?.response?.data?.message || 'Approve failed'
      });
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/api/reviews/${item._id}`);
      setItems((prev) => prev.filter((r) => r._id !== item._id));
      setTotal((t) => Math.max(0, t - 1));
      setSnack({ severity: 'success', message: 'Review deleted' });
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
        <title>Reviews</title>
      </Helmet>
      <Box sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h4">Reviews</Typography>
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
                <>
                  <Scrollbar>
                    <Table sx={{ minWidth: 900 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Reviewer</TableCell>
                          <TableCell>Product</TableCell>
                          <TableCell>Rating</TableCell>
                          <TableCell>Comment</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Submitted</TableCell>
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
                                No reviews found.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                        {items.map((r) => {
                          const reviewerName = r.name || r.user?.name || '—';
                          const reviewerEmail = r.email || r.user?.email;
                          const productName = r.product?.name?.en || r.product?.name || '—';
                          return (
                            <TableRow hover key={r._id}>
                              <TableCell>
                                <Stack spacing={0}>
                                  <Typography variant="subtitle2">{reviewerName}</Typography>
                                  {reviewerEmail && (
                                    <Typography variant="caption" color="text.secondary">
                                      {reviewerEmail}
                                    </Typography>
                                  )}
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{productName}</Typography>
                                {r.isVerifiedPurchase && (
                                  <Chip
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    label="Verified"
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                <Rating size="small" value={r.rating || 0} readOnly />
                              </TableCell>
                              <TableCell sx={{ maxWidth: 360 }}>
                                {r.title && (
                                  <Typography variant="subtitle2">{r.title}</Typography>
                                )}
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  {r.comment}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  color={r.isApproved ? 'success' : 'warning'}
                                  label={r.isApproved ? 'Approved' : 'Pending'}
                                />
                              </TableCell>
                              <TableCell>{formatDate(r.createdAt)}</TableCell>
                              <TableCell align="right">
                                {!r.isApproved && (
                                  <Tooltip title="Approve">
                                    <IconButton size="small" onClick={() => handleApprove(r)}>
                                      <SvgIcon fontSize="small">
                                        <CheckCircleIcon />
                                      </SvgIcon>
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="Delete">
                                  <IconButton size="small" onClick={() => handleDelete(r)}>
                                    <SvgIcon fontSize="small">
                                      <TrashIcon />
                                    </SvgIcon>
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Scrollbar>
                  <Divider />
                  <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(_, value) => setPage(value)}
                    onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                    rowsPerPageOptions={[10, 20, 50, 100]}
                  />
                </>
              )}
            </Card>
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
