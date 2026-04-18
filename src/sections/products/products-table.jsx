import { format } from 'date-fns';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import {
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return format(new Date(value), 'dd MMM yyyy');
  } catch {
    return '—';
  }
};

const formatPrice = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
};

export const ProductsTable = ({
  items = [],
  count = 0,
  page = 0,
  rowsPerPage = 20,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete
}) => (
  <div>
    <Scrollbar>
      <Table sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography color="text.secondary" variant="body2" align="center" sx={{ py: 4 }}>
                  No products found.
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {items.map((product) => {
            const name = product.name?.en || product.name?.ar || '—';
            const nameAr = product.name?.ar;
            return (
              <TableRow hover key={product._id}>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      variant="rounded"
                      src={product.image || undefined}
                      sx={{ width: 44, height: 44, bgcolor: 'neutral.100' }}
                    />
                    <Stack spacing={0}>
                      <Typography variant="subtitle2">{name}</Typography>
                      {nameAr && (
                        <Typography variant="caption" color="text.secondary">
                          {nameAr}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{product.category || '—'}</Typography>
                  {product.subcategory && (
                    <Typography variant="caption" color="text.secondary">
                      {product.subcategory}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{formatPrice(product.price)}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={product.stock ?? 0}
                    color={(product.stock ?? 0) > 0 ? 'default' : 'error'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Stack alignItems="center" direction="row" spacing={1}>
                    <Box
                      sx={{
                        backgroundColor: product.isActive ? 'success.main' : 'error.main',
                        borderRadius: '50%',
                        height: 8,
                        width: 8
                      }}
                    />
                    <Typography variant="body2">
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Typography>
                    {product.isFeatured && (
                      <Chip size="small" color="primary" label="Featured" sx={{ ml: 1 }} />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>{formatDate(product.createdAt)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => onEdit?.(product)}>
                      <SvgIcon fontSize="small">
                        <PencilIcon />
                      </SvgIcon>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => onDelete?.(product)}>
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
      count={count}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      rowsPerPageOptions={[10, 20, 50, 100]}
    />
  </div>
);
