import PropTypes from 'prop-types';
import { useState } from 'react';
import { format } from 'date-fns';
import EllipsisVerticalIcon from '@heroicons/react/24/solid/EllipsisVerticalIcon';
import {
  Box,
  Card,
  Chip,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  SvgIcon,
  TablePagination,
  Typography
} from '@mui/material';

const statusMap = {
  pending: { color: 'default', dotColor: 'neutral.500', label: 'Pending' },
  processing: { color: 'info', dotColor: 'info.main', label: 'Processing' },
  shipped: { color: 'warning', dotColor: 'warning.main', label: 'Shipped' },
  delivered: { color: 'success', dotColor: 'success.main', label: 'Delivered' },
  cancelled: { color: 'error', dotColor: 'error.main', label: 'Cancelled' },
};

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const OrderCard = ({ order, onStatusChange }) => {
  const [anchor, setAnchor] = useState(null);
  const id = order._id || order.id;
  const statusInfo = statusMap[order.status] || { color: 'default', label: order.status || '—' };
  const createdAt = order.createdAt ? new Date(order.createdAt) : null;
  const createdDate = createdAt ? format(createdAt, 'dd MMM yyyy') : '—';
  const totalAmount = typeof order.total === 'number' ? order.total.toFixed(2) : '—';
  const orderNum = order.orderNumber || id?.slice(-6)?.toUpperCase() || '—';

  return (
    <Card variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Typography variant="subtitle2" fontWeight={700}>#{orderNum}</Typography>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Chip
            label={statusInfo.label}
            color={statusInfo.color}
            size="small"
            sx={{ textTransform: 'capitalize', fontSize: 11 }}
          />
          <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
            <SvgIcon fontSize="small"><EllipsisVerticalIcon /></SvgIcon>
          </IconButton>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
            {STATUS_OPTIONS.map((s) => (
              <MenuItem
                key={s}
                onClick={() => { onStatusChange(id, s); setAnchor(null); }}
                sx={{ textTransform: 'capitalize' }}
              >
                Mark as {s}
              </MenuItem>
            ))}
          </Menu>
        </Stack>
      </Stack>

      <Box>
        <Typography variant="body2" fontWeight={600}>{order.customer?.name || '—'}</Typography>
        <Typography variant="caption" color="text.secondary">{order.customer?.email || ''}</Typography>
        {order.customer?.phone && (
          <Typography variant="caption" color="text.secondary" display="block">{order.customer.phone}</Typography>
        )}
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">{createdDate}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
          {order.channel || 'website'}
          {order.isWholesale ? ' · Wholesale' : ''}
        </Typography>
      </Stack>

      <Divider />

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">
          {Array.isArray(order.items) ? `${order.items.length} item${order.items.length !== 1 ? 's' : ''}` : ''}
        </Typography>
        <Typography variant="subtitle2" fontWeight={700}>RM {totalAmount}</Typography>
      </Stack>
    </Card>
  );
};

export const OrdersGrid = ({
  count = 0,
  items = [],
  page = 0,
  rowsPerPage = 10,
  onPageChange = () => {},
  onRowsPerPageChange,
  onStatusChange = () => {},
}) => {
  return (
    <Box>
      {items.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="body2">No orders found</Typography>
        </Box>
      ) : (
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {items.map((order) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={order._id || order.id}>
                <OrderCard order={order} onStatusChange={onStatusChange} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      <Divider />
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={count}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </Box>
  );
};

OrdersGrid.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  onStatusChange: PropTypes.func,
};

OrderCard.propTypes = {
  order: PropTypes.object.isRequired,
  onStatusChange: PropTypes.func.isRequired,
};
