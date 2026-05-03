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
  TextField,
  Typography
} from '@mui/material';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { SvgIcon } from '@mui/material';
import { api } from 'src/lib/api';
import { ProductsTable } from 'src/sections/products/products-table';
import { ProductDialog } from 'src/sections/products/product-dialog';

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
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
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [snack, setSnack] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    api.get('/api/categories', { params: { nested: 'true' } }).then(({ data }) => {
      const list = Array.isArray(data?.data) ? data.data : [];
      setCategoryOptions(list.filter((c) => c.isActive !== false));
    }).catch(() => {});
  }, []);

  const debouncedSearch = useDebounced(search);
  const debouncedCategory = useDebounced(category);

  const params = useMemo(() => {
    const p = { page: page + 1, limit: rowsPerPage };
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    if (debouncedCategory.trim()) p.category = debouncedCategory.trim();
    if (statusFilter === 'active') p.isActive = 'true';
    if (statusFilter === 'inactive') p.isActive = 'false';
    return p;
  }, [page, rowsPerPage, debouncedSearch, debouncedCategory, statusFilter]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/products', { params });
      setItems(Array.isArray(data?.data) ? data.data : []);
      setTotal(data?.pagination?.total ?? 0);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load products');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, debouncedCategory, statusFilter, rowsPerPage]);

  const handleOpenCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditing(product);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const handleSaved = (saved, { created }) => {
    if (!saved) return;
    if (created) {
      setSnack({ severity: 'success', message: 'Product created' });
      fetchProducts();
      return;
    }
    setItems((prev) => prev.map((p) => (p._id === saved._id ? { ...p, ...saved } : p)));
    setSnack({ severity: 'success', message: 'Product updated' });
  };

  const handleDelete = async (product) => {
    if (!product?._id) return;
    const confirmed = window.confirm(`Delete “${product.name?.en || product._id}”?`);
    if (!confirmed) return;
    try {
      await api.delete(`/api/products/${product._id}`);
      setItems((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, isActive: false } : p))
      );
      setSnack({ severity: 'success', message: 'Product deactivated' });
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
        <title>Products</title>
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
              <Typography variant="h4">Products</Typography>
              <Button
                variant="contained"
                startIcon={
                  <SvgIcon fontSize="small">
                    <PlusIcon />
                  </SvgIcon>
                }
                onClick={handleOpenCreate}
              >
                Add product
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
                  label="Search"
                  placeholder="Name, description"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <TextField
                  select
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="">All</MenuItem>
                  {categoryOptions.map((cat) => (
                    <MenuItem key={cat._id || cat.slug} value={cat.slug || cat.name?.en?.toLowerCase()}>
                      {cat.name?.en || cat.slug}
                    </MenuItem>
                  ))}
                </TextField>
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
                <ProductsTable
                  items={items}
                  count={total}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={(_, value) => setPage(value)}
                  onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                />
              )}
            </Card>
          </Stack>
        </Container>
      </Box>
      <ProductDialog
        open={dialogOpen}
        product={editing}
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
