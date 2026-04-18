import { format } from 'date-fns';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import {
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
  Typography
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return format(new Date(value), 'dd MMM yyyy HH:mm');
  } catch {
    return '—';
  }
};

export const UsersTable = ({
  items = [],
  count = 0,
  page = 0,
  rowsPerPage = 20,
  onPageChange,
  onRowsPerPageChange,
  onEdit
}) => (
  <div>
    <Scrollbar>
      <Table sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Last login</TableCell>
            <TableCell align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography color="text.secondary" variant="body2" align="center" sx={{ py: 4 }}>
                  No users found.
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {items.map((user) => (
            <TableRow hover key={user._id}>
              <TableCell>
                <Typography variant="subtitle2">{user.name || '—'}</Typography>
                <Typography color="text.secondary" variant="caption">
                  {user.language?.toUpperCase() || 'EN'}
                </Typography>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone || '—'}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={user.isWholesale ? 'Wholesale' : 'Retail'}
                  color={user.isWholesale ? 'primary' : 'default'}
                  variant={user.isWholesale ? 'filled' : 'outlined'}
                />
              </TableCell>
              <TableCell>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Box
                    sx={{
                      backgroundColor: user.isActive ? 'success.main' : 'error.main',
                      borderRadius: '50%',
                      height: 8,
                      width: 8
                    }}
                  />
                  <Typography variant="body2">
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>{formatDate(user.lastLogin)}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => onEdit?.(user)} size="small">
                  <SvgIcon fontSize="small">
                    <PencilIcon />
                  </SvgIcon>
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
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
