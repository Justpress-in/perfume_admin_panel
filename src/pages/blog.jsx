import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Divider,
  MenuItem,
  Snackbar,
  Stack,
  SvgIcon,
  TextField,
  Typography
} from '@mui/material';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { api } from 'src/lib/api';
import { BlogTable } from 'src/sections/blog/blog-table';
import { BlogDialog } from 'src/sections/blog/blog-dialog';

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Drafts', value: 'drafts' }
];

const useDebounced = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);
  return debounced;
};

const Page = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tag, setTag] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [snack, setSnack] = useState(null);

  const debouncedTag = useDebounced(tag);

  const params = useMemo(() => {
    const p = { page: page + 1, limit: rowsPerPage };
    if (debouncedTag.trim()) p.tag = debouncedTag.trim();
    if (statusFilter === 'published') p.published = 'true';
    if (statusFilter === 'drafts') p.published = 'false';
    return p;
  }, [page, rowsPerPage, debouncedTag, statusFilter]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/blog', { params });
      setItems(Array.isArray(data?.data) ? data.data : []);
      setTotal(data?.pagination?.total ?? 0);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load posts');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    setPage(0);
  }, [debouncedTag, statusFilter, rowsPerPage]);

  const handleOpenCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (post) => {
    setEditing(post);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const handleSaved = (saved, { created }) => {
    if (!saved) return;
    if (created) {
      setSnack({ severity: 'success', message: 'Post created' });
      fetchPosts();
      return;
    }
    setItems((prev) => prev.map((p) => (p._id === saved._id ? { ...p, ...saved } : p)));
    setSnack({ severity: 'success', message: 'Post updated' });
  };

  const handleTogglePublish = async (post) => {
    if (!post?._id) return;
    try {
      const { data } = await api.patch(`/api/blog/${post._id}/publish`);
      const updated = data?.data;
      setItems((prev) =>
        prev.map((p) =>
          p._id === post._id
            ? { ...p, ...(updated || { published: data?.published }) }
            : p
        )
      );
      setSnack({
        severity: 'success',
        message: (updated?.published ?? data?.published) ? 'Post published' : 'Post unpublished'
      });
    } catch (err) {
      setSnack({
        severity: 'error',
        message: err?.response?.data?.message || 'Toggle failed'
      });
    }
  };

  const handleDelete = async (post) => {
    if (!post?._id) return;
    const confirmed = window.confirm(`Delete “${post.title?.en || post._id}”?`);
    if (!confirmed) return;
    try {
      await api.delete(`/api/blog/${post._id}`);
      setItems((prev) => prev.filter((p) => p._id !== post._id));
      setTotal((t) => Math.max(0, t - 1));
      setSnack({ severity: 'success', message: 'Post deleted' });
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
        <title>Blog</title>
      </Helmet>
      <Box sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={3}
            >
              <Typography variant="h4">Blog</Typography>
              <Button
                variant="contained"
                startIcon={
                  <SvgIcon fontSize="small">
                    <PlusIcon />
                  </SvgIcon>
                }
                onClick={handleOpenCreate}
              >
                New post
              </Button>
            </Stack>
            <Card>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ p: 3 }}
              >
                <TextField
                  fullWidth
                  label="Tag"
                  placeholder="Filter by tag"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                />
                <TextField
                  select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ minWidth: 180 }}
                >
                  {statusOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
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
                <BlogTable
                  items={items}
                  count={total}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={(_, value) => setPage(value)}
                  onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                  onEdit={handleOpenEdit}
                  onTogglePublish={handleTogglePublish}
                  onDelete={handleDelete}
                />
              )}
            </Card>
          </Stack>
        </Container>
      </Box>
      <BlogDialog
        open={dialogOpen}
        post={editing}
        onClose={handleDialogClose}
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
