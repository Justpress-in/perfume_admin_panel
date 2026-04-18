import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
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
import { CategoryDialog } from 'src/sections/categories/category-dialog';

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
      const { data } = await api.get('/api/categories');
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load categories');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (item) => {
    setEditing(item);
    setDialogOpen(true);
  };

  const handleSaved = (saved, { created }) => {
    if (!saved) return;
    if (created) {
      fetchItems();
      setSnack({ severity: 'success', message: 'Category created' });
      return;
    }
    fetchItems();
    setSnack({ severity: 'success', message: 'Category updated' });
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete “${item.name?.en || item.slug}”?`)) return;
    try {
      await api.delete(`/api/categories/${item._id}`);
      setItems((prev) => prev.filter((c) => c._id !== item._id));
      setSnack({ severity: 'success', message: 'Category deleted' });
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
        <title>Categories</title>
      </Helmet>
      <Box sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4">Categories</Typography>
              <Button
                variant="contained"
                startIcon={
                  <SvgIcon fontSize="small">
                    <PlusIcon />
                  </SvgIcon>
                }
                onClick={handleCreate}
              >
                New category
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
                  <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell>Slug</TableCell>
                        <TableCell>Parent</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Sort</TableCell>
                        <TableCell align="right" />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <Typography
                              color="text.secondary"
                              variant="body2"
                              align="center"
                              sx={{ py: 4 }}
                            >
                              No categories yet.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      {items.map((c) => (
                        <TableRow hover key={c._id}>
                          <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar variant="rounded" src={c.image || undefined} />
                              <Stack spacing={0}>
                                <Typography variant="subtitle2">
                                  {c.name?.en || c.slug}
                                </Typography>
                                {c.name?.ar && (
                                  <Typography variant="caption" color="text.secondary">
                                    {c.name.ar}
                                  </Typography>
                                )}
                              </Stack>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" variant="outlined" label={c.slug} />
                          </TableCell>
                          <TableCell>{c.parent?.name?.en || c.parent?.slug || '—'}</TableCell>
                          <TableCell>{c.isActive ? 'Active' : 'Inactive'}</TableCell>
                          <TableCell>{c.sortOrder ?? 0}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => handleEdit(c)}>
                                <SvgIcon fontSize="small">
                                  <PencilIcon />
                                </SvgIcon>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => handleDelete(c)}>
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
      <CategoryDialog
        open={dialogOpen}
        item={editing}
        parents={items}
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
