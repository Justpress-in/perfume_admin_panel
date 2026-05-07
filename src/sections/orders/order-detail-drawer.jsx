import { useEffect, useRef, useState } from 'react';
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
import PrinterIcon from '@heroicons/react/24/outline/PrinterIcon';
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
  const printRef = useRef(null);

  const handlePrint = () => {
    if (!order || !printRef.current) return;
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=420,height=700');
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt – ${order.orderId || orderId}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Courier New', monospace; font-size: 12px; color: #111; background: #fff; padding: 24px 20px; width: 380px; }
            .receipt-header { text-align: center; margin-bottom: 16px; }
            .receipt-header .brand { font-size: 18px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; }
            .receipt-header .sub { font-size: 10px; color: #555; margin-top: 2px; letter-spacing: 1px; }
            .receipt-header .order-id { font-size: 13px; font-weight: 700; margin-top: 10px; }
            .receipt-header .date { font-size: 10px; color: #555; margin-top: 2px; }
            .divider { border: none; border-top: 1px dashed #aaa; margin: 12px 0; }
            .divider-solid { border: none; border-top: 1px solid #111; margin: 12px 0; }
            .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #555; margin-bottom: 6px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; }
            .row .label { color: #555; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
            .items-table th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #555; padding: 4px 0; border-bottom: 1px dashed #aaa; text-align: left; }
            .items-table th:last-child, .items-table td:last-child { text-align: right; }
            .items-table th:nth-child(2), .items-table td:nth-child(2) { text-align: center; }
            .items-table td { padding: 5px 0; font-size: 12px; border-bottom: 1px dashed #eee; }
            .total-row { display: flex; justify-content: space-between; font-weight: 700; font-size: 14px; margin-top: 6px; }
            .status-badge { display: inline-block; padding: 2px 10px; border: 1px solid #111; border-radius: 20px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #555; line-height: 1.6; }
            @media print {
              body { padding: 0; }
              @page { margin: 10mm; size: 80mm auto; }
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

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
        <Stack direction="row" spacing={1.5}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<SvgIcon fontSize="small"><PrinterIcon /></SvgIcon>}
            onClick={handlePrint}
            disabled={!order || loading}
          >
            Print Receipt
          </Button>
          <Button fullWidth variant="outlined" onClick={onClose}>Close</Button>
        </Stack>
      </Box>

      {/* ── Hidden printable receipt ── */}
      {order && (
        <Box ref={printRef} sx={{ display: 'none' }}>
          {/* Header */}
          <div className="receipt-header">
            <div className="brand">OUD AL-ANOOD</div>
            <div className="sub">Luxury Fragrance Boutique</div>
            <div className="sub">Bukit Bintang Kiosk K15, Kuala Lumpur</div>
            <div className="sub">+60 13-268 8779 | Sales@oudalanood.com</div>
            <hr className="divider" />
            <div className="order-id">{order.orderId || `#${orderId?.slice(-6).toUpperCase()}`}</div>
            <div className="date">{order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm') : ''}</div>
            <div><span className="status-badge">{statuses.find(s => s.value === order.status)?.label || order.status}</span></div>
          </div>

          <hr className="divider" />

          {/* Customer */}
          <div className="section-title">Customer</div>
          <div className="row"><span className="label">Name</span><span>{order.customer?.name || '—'}</span></div>
          {order.customer?.email && <div className="row"><span className="label">Email</span><span>{order.customer.email}</span></div>}
          {order.customer?.phone && <div className="row"><span className="label">Phone</span><span>{order.customer.phone}</span></div>}
          {order.notes && <div className="row"><span className="label">Address</span><span style={{ maxWidth: '200px', textAlign: 'right' }}>{order.notes}</span></div>}

          <hr className="divider" />

          {/* Items */}
          <div className="section-title">Items</div>
          <table className="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, idx) => {
                const name = item.productSnapshot?.name?.en || item.product?.name?.en || 'Product';
                return (
                  <tr key={idx}>
                    <td>{name}</td>
                    <td>{item.quantity}</td>
                    <td>RM {(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <hr className="divider" />

          {/* Totals */}
          <div className="row"><span className="label">Subtotal</span><span>RM {Number(order.subtotal ?? order.total).toFixed(2)}</span></div>
          {order.discount > 0 && (
            <div className="row"><span className="label">Discount {order.couponCode ? `(${order.couponCode})` : ''}</span><span>− RM {Number(order.discount).toFixed(2)}</span></div>
          )}
          <div className="row"><span className="label">Shipping</span><span>Free</span></div>
          <hr className="divider-solid" />
          <div className="total-row"><span>TOTAL</span><span>RM {Number(order.total).toFixed(2)}</span></div>

          <hr className="divider" />

          {/* Footer */}
          <div className="footer">
            <div>Channel: {order.channel} {order.isWholesale ? '· Wholesale' : ''}</div>
            <div style={{ marginTop: '12px' }}>Thank you for your purchase!</div>
            <div>www.oud-al-anood.com</div>
          </div>
        </Box>
      )}
    </Drawer>
  );
};
