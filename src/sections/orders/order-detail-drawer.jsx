import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import XMarkIcon from '@heroicons/react/24/solid/XMarkIcon';
import { SvgIcon } from '@mui/material';
import { api } from 'src/lib/api';

const Field = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={500} sx={{ mt: 0.25 }}>
      {value || '—'}
    </Typography>
  </Box>
);

export const OrderDetailDrawer = ({ orderId, open, onClose, statuses = [], onStatusChange }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [changingStatus, setChangingStatus] = useState(false);

  useEffect(() => {
    if (!open || !orderId) return;
    setOrder(null);
    setError(null);
    setLoading(true);
    api.get(`/api/orders/${orderId}`)
      .then(({ data }) => setOrder(data?.data))
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load order'))
      .finally(() => setLoading(false));
  }, [open, orderId]);

  const handleStatusChange = async (newStatus) => {
    if (!order || newStatus === order.status) return;
    setChangingStatus(true);
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      setOrder((prev) => ({ ...prev, status: newStatus }));
      onStatusChange?.(orderId, newStatus);
    } catch (err) {
      setError(err?.response?.data?.message || 'Status update failed');
    } finally {
      setChangingStatus(false);
    }
  };

  const statusDef = statuses.find((s) => s.value === order?.status);
  const statusColor = statusDef?.color || '#9e9e9e';
  const statusLabel = statusDef?.label || order?.status || '—';

  const createdAt = order?.createdAt ? new Date(order.createdAt) : null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 520 }, display: 'flex', flexDirection: 'column' } }}
    >
      {/* ── Header ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={0.25}>
          <Typography variant="h6">Order Details</Typography>
          {order?.orderId && (
            <Typography variant="caption" color="text.secondary">{order.orderId}</Typography>
          )}
        </Stack>
        <IconButton onClick={onClose} size="small">
          <SvgIcon fontSize="small"><XMarkIcon /></SvgIcon>
        </IconButton>
      </Stack>

      {/* ── Body ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}

        {order && !loading && (
          <Stack spacing={3}>

            {/* Status + Date */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Status
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: statusColor, flexShrink: 0 }} />
                  <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                    {statusLabel}
                  </Typography>
                </Stack>
              </Stack>
              <Stack spacing={0.5} alignItems="flex-end">
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Date
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {createdAt ? format(createdAt, 'dd MMM yyyy, HH:mm') : '—'}
                </Typography>
              </Stack>
            </Stack>

            {/* Change status */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.75 }}>
                Change Status
              </Typography>
              <Select
                size="small"
                value={order.status || ''}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={changingStatus || statuses.length === 0}
                sx={{ minWidth: 200 }}
              >
                {statuses.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: s.color, flexShrink: 0 }} />
                      <span>{s.label}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Divider />

            {/* Customer */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>Customer</Typography>
              <Stack spacing={1.5}>
                <Field label="Name" value={order.customer?.name} />
                <Field label="Email" value={order.customer?.email} />
                <Field label="Phone" value={order.customer?.phone} />
                {order.customer?.address && <Field label="Address" value={order.customer.address} />}
              </Stack>
            </Box>

            <Divider />

            {/* Order info */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>Order Info</Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={3}>
                  <Field label="Channel" value={order.channel} />
                  <Field label="Type" value={order.isWholesale ? 'Wholesale' : 'Retail'} />
                </Stack>
                {order.notes && <Field label="Notes / Delivery Address" value={order.notes} />}
                {order.couponCode && <Field label="Coupon Code" value={order.couponCode} />}
              </Stack>
            </Box>

            <Divider />

            {/* Items */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Items ({order.items?.length || 0})
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ pl: 0 }}>Product</TableCell>
                    <TableCell align="center">Qty</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right" sx={{ pr: 0 }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(order.items || []).map((item, idx) => {
                    const name = item.productSnapshot?.name?.en || item.product?.name?.en || 'Product';
                    const image = item.productSnapshot?.image || item.product?.images?.[0]?.url || '';
                    const itemTotal = (item.price * item.quantity).toFixed(2);
                    return (
                      <TableRow key={idx}>
                        <TableCell sx={{ pl: 0 }}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                              src={image}
                              variant="rounded"
                              sx={{ width: 40, height: 40, bgcolor: 'neutral.100', flexShrink: 0 }}
                            />
                            <Typography variant="body2" sx={{
                              maxWidth: 160,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">{item.quantity}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">RM {Number(item.price).toFixed(2)}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ pr: 0 }}>
                          <Typography variant="body2" fontWeight={600}>RM {itemTotal}</Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>

            <Divider />

            {/* Totals */}
            <Box>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2">RM {Number(order.subtotal ?? order.total).toFixed(2)}</Typography>
                </Stack>
                {order.discount > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Discount</Typography>
                    <Typography variant="body2" color="success.main">− RM {Number(order.discount).toFixed(2)}</Typography>
                  </Stack>
                )}
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Shipping</Typography>
                  <Typography variant="body2" color="success.main">Free</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle2">Total</Typography>
                  <Typography variant="subtitle2">RM {Number(order.total).toFixed(2)}</Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Status history */}
            {Array.isArray(order.statusHistory) && order.statusHistory.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Status History</Typography>
                  <Stack spacing={1}>
                    {order.statusHistory.map((h, idx) => {
                      const hDef = statuses.find((s) => s.value === h.status);
                      return (
                        <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: hDef?.color || '#9e9e9e', flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {hDef?.label || h.status}
                            </Typography>
                            {h.changedBy?.name && (
                              <Typography variant="caption" color="text.secondary">
                                by {h.changedBy.name}
                              </Typography>
                            )}
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {h.changedAt ? format(new Date(h.changedAt), 'dd MMM yyyy, HH:mm') : ''}
                          </Typography>
                        </Stack>
                      );
                    })}
                  </Stack>
                </Box>
              </>
            )}

          </Stack>
        )}
      </Box>

      {/* ── Footer ── */}
      <Box sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button fullWidth variant="outlined" onClick={onClose}>Close</Button>
      </Box>
    </Drawer>
  );
};
