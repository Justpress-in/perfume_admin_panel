import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Alert, Box, Button, Card, CircularProgress, Container, Divider, Snackbar, Stack, Typography } from '@mui/material';
import { OrdersSearch } from 'src/sections/orders/orders-search';
import { OrdersTable } from 'src/sections/orders/orders-table';
import { api } from 'src/lib/api';

const EMPTY_FILTERS = { status: '', channel: '', startDate: '', endDate: '' };

const Page = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState(null);

  const params = useMemo(() => {
    const p = { page: page + 1, limit: rowsPerPage };
    if (query.trim()) p.search = query.trim();
    if (filters.status) p.status = filters.status;
    if (filters.channel) p.channel = filters.channel;
    if (filters.startDate) p.startDate = filters.startDate;
    if (filters.endDate) p.endDate = filters.endDate;
    return p;
  }, [page, rowsPerPage, query, filters]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/orders', { params });
      setItems(Array.isArray(data?.data) ? data.data : []);
      setTotal(data?.pagination?.total ?? 0);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset to page 0 when query or filters change
  useEffect(() => {
    setPage(0);
  }, [query, filters]);

  const handleQueryChange = useCallback((value) => setQuery(value), []);

  const handleFiltersChange = useCallback((next) => setFilters(next), []);

  const handleChangePage = useCallback((_, value) => setPage(value), []);

  const handleChangeRowsPerPage = useCallback((e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }, []);

  const handleStatusChange = useCallback(async (orderId, status) => {
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status });
      setItems((prev) =>
        prev.map((o) => (o._id === orderId || o.id === orderId ? { ...o, status } : o))
      );
      setSnack({ severity: 'success', message: `Order marked as ${status}` });
    } catch (err) {
      setSnack({ severity: 'error', message: err?.response?.data?.message || 'Status update failed' });
    }
  }, []);

  const handleExport = useCallback(async () => {
    try {
      const exportParams = {};
      if (filters.status) exportParams.status = filters.status;
      if (filters.startDate) exportParams.startDate = filters.startDate;
      if (filters.endDate) exportParams.endDate = filters.endDate;

      const { data } = await api.get('/api/orders/export', {
        params: exportParams,
        responseType: 'blob'
      });
      const url = URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setSnack({ severity: 'error', message: 'Export failed' });
    }
  }, [filters]);

  return (
    <>
      <Helmet>
        <title>Orders</title>
      </Helmet>
      <Box sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={3}>
              <Typography variant="h4">Orders</Typography>
              <Button color="primary" size="large" variant="outlined" onClick={handleExport}>
                Export CSV
              </Button>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            <Card>
              <OrdersSearch
                query={query}
                onQueryChange={handleQueryChange}
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
              <Divider />
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <OrdersTable
                  count={total}
                  items={items}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  onStatusChange={handleStatusChange}
                />
              )}
            </Card>
          </Stack>
        </Container>
      </Box>

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={3000}
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
