import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Alert,
  Box,
  Card,
  CircularProgress,
  Container,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { api } from 'src/lib/api';
import { UsersTable } from 'src/sections/users/users-table';
import { UserDialog } from 'src/sections/users/user-dialog';

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
  const [statusFilter, setStatusFilter] = useState('all');

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [dialogUserId, setDialogUserId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const debouncedSearch = useDebounced(search);

  const params = useMemo(() => {
    const p = { page: page + 1, limit: rowsPerPage };
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    if (statusFilter === 'active') p.isActive = 'true';
    if (statusFilter === 'inactive') p.isActive = 'false';
    return p;
  }, [page, rowsPerPage, debouncedSearch, statusFilter]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/users', { params });
      setItems(Array.isArray(data?.data) ? data.data : []);
      setTotal(data?.pagination?.total ?? 0);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, statusFilter, rowsPerPage]);

  const handleOpenUser = (user) => {
    setDialogUserId(user._id);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogUserId(null);
  };

  const handleSaved = (updated) => {
    if (!updated) return;
    setItems((prev) => prev.map((u) => (u._id === updated._id ? { ...u, ...updated } : u)));
  };

  const handleDeactivated = (id) => {
    setItems((prev) =>
      prev.map((u) => (u._id === id ? { ...u, isActive: false } : u))
    );
  };

  return (
    <>
      <Helmet>
        <title>Users</title>
      </Helmet>
      <Box sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h4">Users</Typography>
            <Card>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ p: 3 }}
              >
                <TextField
                  fullWidth
                  label="Search"
                  placeholder="Name, email, or phone"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
                <UsersTable
                  items={items}
                  count={total}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={(_, value) => setPage(value)}
                  onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                  onEdit={handleOpenUser}
                />
              )}
            </Card>
          </Stack>
        </Container>
      </Box>
      <UserDialog
        open={dialogOpen}
        userId={dialogUserId}
        onClose={handleCloseDialog}
        onSaved={handleSaved}
        onDeactivated={handleDeactivated}
      />
    </>
  );
};

export default Page;
