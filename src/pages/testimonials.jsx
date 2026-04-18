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
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Rating,
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
import { TestimonialDialog } from 'src/sections/testimonials/testimonial-dialog';

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
      const { data } = await api.get('/api/testimonials');
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load testimonials');
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
      setSnack({ severity: 'success', message: 'Testimonial created' });
      return;
    }
    setItems((prev) => prev.map((t) => (t._id === saved._id ? saved : t)));
    setSnack({ severity: 'success', message: 'Testimonial updated' });
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete testimonial from ${item.name}?`)) return;
    try {
      await api.delete(`/api/testimonials/${item._id}`);
      setItems((prev) => prev.filter((t) => t._id !== item._id));
      setSnack({ severity: 'success', message: 'Testimonial deleted' });
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
        <title>Testimonials</title>
      </Helmet>
      <Box sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4">Testimonials</Typography>
              <Button
                variant="contained"
                startIcon={
                  <SvgIcon fontSize="small">
                    <PlusIcon />
                  </SvgIcon>
                }
                onClick={handleCreate}
              >
                New testimonial
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
                        <TableCell>Person</TableCell>
                        <TableCell>Quote</TableCell>
                        <TableCell>Rating</TableCell>
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
                              No testimonials yet.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      {items.map((t) => (
                        <TableRow hover key={t._id}>
                          <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar src={t.avatar || undefined}>
                                {(t.name || '?').charAt(0)}
                              </Avatar>
                              <Stack spacing={0}>
                                <Typography variant="subtitle2">{t.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {t.location}
                                </Typography>
                              </Stack>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 360 }}>
                            <Typography variant="body2" noWrap>
                              {t.text?.en}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Rating value={t.rating || 0} readOnly size="small" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {t.isPublished ? 'Published' : 'Hidden'}
                            </Typography>
                          </TableCell>
                          <TableCell>{t.sortOrder ?? 0}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => handleEdit(t)}>
                                <SvgIcon fontSize="small">
                                  <PencilIcon />
                                </SvgIcon>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => handleDelete(t)}>
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
      <TestimonialDialog
        open={dialogOpen}
        item={editing}
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
