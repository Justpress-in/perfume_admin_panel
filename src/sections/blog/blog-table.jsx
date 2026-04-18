import { format } from 'date-fns';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import EyeSlashIcon from '@heroicons/react/24/outline/EyeSlashIcon';
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

const authorName = (author) => {
  if (!author) return '—';
  if (typeof author === 'string') return author;
  return author.name || '—';
};

export const BlogTable = ({
  items = [],
  count = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onTogglePublish,
  onDelete
}) => (
  <div>
    <Scrollbar>
      <Table sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow>
            <TableCell>Post</TableCell>
            <TableCell>Tags</TableCell>
            <TableCell>Author</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>
                <Typography color="text.secondary" variant="body2" align="center" sx={{ py: 4 }}>
                  No posts found.
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {items.map((post) => {
            const title = post.title?.en || post.title?.ar || '—';
            const titleAr = post.title?.ar;
            return (
              <TableRow hover key={post._id}>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      variant="rounded"
                      src={post.image || undefined}
                      sx={{ width: 56, height: 44, bgcolor: 'neutral.100' }}
                    />
                    <Stack spacing={0}>
                      <Typography variant="subtitle2">{title}</Typography>
                      {titleAr && (
                        <Typography variant="caption" color="text.secondary">
                          {titleAr}
                        </Typography>
                      )}
                      {post.slug && (
                        <Typography variant="caption" color="text.secondary">
                          /{post.slug}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {(post.tags || []).slice(0, 4).map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                    {(post.tags?.length || 0) > 4 && (
                      <Chip size="small" label={`+${post.tags.length - 4}`} />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>{authorName(post.author)}</TableCell>
                <TableCell>
                  <Stack alignItems="center" direction="row" spacing={1}>
                    <Box
                      sx={{
                        backgroundColor: post.published ? 'success.main' : 'neutral.400',
                        borderRadius: '50%',
                        height: 8,
                        width: 8
                      }}
                    />
                    <Typography variant="body2">
                      {post.published ? 'Published' : 'Draft'}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>{formatDate(post.createdAt)}</TableCell>
                <TableCell align="right">
                  <Tooltip title={post.published ? 'Unpublish' : 'Publish'}>
                    <IconButton size="small" onClick={() => onTogglePublish?.(post)}>
                      <SvgIcon fontSize="small">
                        {post.published ? <EyeSlashIcon /> : <EyeIcon />}
                      </SvgIcon>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => onEdit?.(post)}>
                      <SvgIcon fontSize="small">
                        <PencilIcon />
                      </SvgIcon>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => onDelete?.(post)}>
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
      rowsPerPageOptions={[10, 20, 50]}
    />
  </div>
);
