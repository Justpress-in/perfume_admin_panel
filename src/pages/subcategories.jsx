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
  const [allCategories, setAllCategories] = useState([]);
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
      setAllCategories(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load categories');
      setAllCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Only items that have a parent = subcategories
  const subcategories = allCategories.filter((c) => c.parent);
  // Only top-level items = valid parents
  const topLevel = allCategories.filter((c) => !c.parent);

  const handleSaved = () => {
    fetchItems();
    setSnack({ severity: 'success', message: editing ? 'Subcategory updated' : 'Subcategory created' });
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete subcategory "${item.name?.en || item.slug}"?`)) return;
    try {
      await api.delete(`/api/categories/${item._id}`);
      setAllCategories((prev) => prev.filter((c) => c._id !== item._id));
      setSnack({ severity: 'success', message: 'Subcategory deleted' });
    } catch (err) {
      setSnack({ severity: 'error', message: err?.response?.data?.message || 'Delete failed' });
    }
  };

  return (
    <>
      <Helmet><title>Subcategories</title></Helmet>
      <Box sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack spacing={0.5}>
                <Typography variant="h4">Subcategories</Typography>
                <Typography variant="body2" color="text.secondary">
                  Categories that belong under a parent category.
                </Typography>
              </Stack>
              <Button
                variant="contained"
                startIcon={<SvgIcon fontSize="small"><PlusIcon /></SvgIcon>}
                onClick={() => { setEditing(null); setDialogOpen(true); }}
              >
                New subcategory
              </Button>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            <Card>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Scrollbar>
                  <Table sx={{ minWidth: 700 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Subcategory</TableCell>
                        <TableCell>Slug</TableCell>
                        <TableCell>Parent category</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Sort</TableCell>
                        <TableCell align="right" />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {subcategories.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                            No subcategories yet. Click "New subcategory" to add one.
                          </TableCell>
                        </TableRow>
                      )}
                      {subcategories.map((c) => (
                        <TableRow hover key={c._id}>
                          <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar variant="rounded" src={c.image || undefined} />
                              <Stack spacing={0}>
                                <Typography variant="subtitle2">{c.name?.en || c.slug}</Typography>
                                {c.name?.ar && (
                                  <Typography variant="caption" color="text.secondary">{c.name.ar}</Typography>
                                )}
                              </Stack>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" variant="outlined" label={c.slug} />
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color="primary"
                              variant="outlined"
                              label={c.parent?.name?.en || c.parent?.slug || '—'}
                            />
                          </TableCell>
                          <TableCell>{c.isActive ? 'Active' : 'Inactive'}</TableCell>
                          <TableCell>{c.sortOrder ?? 0}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => { setEditing(c); setDialogOpen(true); }}>
                                <SvgIcon fontSize="small"><PencilIcon /></SvgIcon>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => handleDelete(c)}>
                                <SvgIcon fontSize="small"><TrashIcon /></SvgIcon>
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
        parents={topLevel}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSaved={handleSaved}
      />

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={3500}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {snack ? (
          <Alert severity={snack.severity} onClose={() => setSnack(null)}>{snack.message}</Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
};

export default Page;
