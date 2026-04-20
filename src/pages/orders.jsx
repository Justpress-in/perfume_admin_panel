import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Button, Card, Container, Divider, Stack, Typography, Alert, CircularProgress } from '@mui/material';
import { OrdersSearch } from 'src/sections/orders/orders-search';
import { OrdersTable } from 'src/sections/orders/orders-table';
import { api } from 'src/lib/api';

const Page = () => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/orders', {
        params: { page: page + 1, limit: rowsPerPage, search: query || undefined }
      });
      setItems(Array.isArray(data?.data) ? data.data : []);
      setTotal(data?.pagination?.total ?? 0);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, query]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleQueryChange = useCallback((value) => {
    setQuery(value);
    setPage(0);
  }, []);

  const handleChangePage = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleExport = useCallback(async () => {
    try {
      const { data } = await api.get('/api/orders/export', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently fail — export is optional
    }
  }, []);

  const handleStatusChange = useCallback(async (orderId, status) => {
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch {
      // ignore
    }
  }, [fetchOrders]);

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

            <div>
              <Card>
                <OrdersSearch
                  onQueryChange={handleQueryChange}
                  query={query}
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
            </div>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Page;
