import PropTypes from 'prop-types';
import { useState } from 'react';
import { format } from 'date-fns';
import EllipsisVerticalIcon from '@heroicons/react/24/solid/EllipsisVerticalIcon';
import {
  Box,
  Divider,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

const statusMap = {
  pending: { color: 'neutral.500', label: 'Pending' },
  processing: { color: 'info.main', label: 'Processing' },
  delivered: { color: 'success.main', label: 'Delivered' },
  cancelled: { color: 'error.main', label: 'Cancelled' },
  complete: { color: 'success.main', label: 'Complete' },
  created: { color: 'neutral.500', label: 'Created' },
  placed: { color: 'info.main', label: 'Placed' },
  processed: { color: 'warning.main', label: 'Processed' }
};

const STATUS_OPTIONS = ['pending', 'processing', 'delivered', 'cancelled'];

const OrderRowMenu = ({ orderId, onStatusChange }) => {
  const [anchor, setAnchor] = useState(null);

  return (
    <>
      <IconButton onClick={(e) => setAnchor(e.currentTarget)}>
        <SvgIcon fontSize="small">
          <EllipsisVerticalIcon />
        </SvgIcon>
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {STATUS_OPTIONS.map((s) => (
          <MenuItem
            key={s}
            onClick={() => { onStatusChange(orderId, s); setAnchor(null); }}
            sx={{ textTransform: 'capitalize' }}
          >
            Mark as {s}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export const OrdersTable = (props) => {
  const {
    count = 0,
    items = [],
    onPageChange = () => {},
    page = 0,
    rowsPerPage = 0,
    onRowsPerPageChange,
    onStatusChange = () => {}
  } = props;

  return (
    <div>
      <Scrollbar>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Channel</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total (RM)</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              items.map((order) => {
                const id = order._id || order.id;
                const statusInfo = statusMap[order.status] || { color: 'neutral.500', label: order.status || '—' };
                const createdAt = order.createdAt ? new Date(order.createdAt) : null;
                const createdDate = createdAt ? format(createdAt, 'dd MMM yyyy') : '—';
                const createdTime = createdAt ? format(createdAt, 'HH:mm') : '';
                const totalAmount = typeof order.total === 'number' ? order.total.toFixed(2) : '—';
                const orderNum = order.orderNumber || id?.slice(-6)?.toUpperCase() || '—';

                return (
                  <TableRow key={id} hover>
                    <TableCell>
                      <Link color="inherit" href="#" underline="none" variant="subtitle2">
                        #{orderNum}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Typography color="inherit" variant="inherit">{createdDate}</Typography>
                      <Typography color="text.secondary" variant="inherit">{createdTime}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{order.customer?.name || '—'}</Typography>
                      <Typography variant="caption" color="text.secondary">{order.customer?.email || ''}</Typography>
                    </TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>
                      {order.channel || 'website'}
                      {order.isWholesale && (
                        <Typography variant="caption" color="warning.main" display="block">Wholesale</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack alignItems="center" direction="row" spacing={1}>
                        <Box
                          sx={{
                            backgroundColor: statusInfo.color,
                            borderRadius: '50%',
                            height: 8,
                            width: 8,
                            flexShrink: 0
                          }}
                        />
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {statusInfo.label}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{totalAmount}</TableCell>
                    <TableCell align="right">
                      <OrderRowMenu orderId={id} onStatusChange={onStatusChange} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Scrollbar>
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
    </div>
  );
};

OrdersTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  onStatusChange: PropTypes.func
};
