import { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Button, Card, Container, Divider, Stack, Typography } from '@mui/material';
import { OrdersSearch } from 'src/sections/orders/orders-search';
import { OrdersTable } from 'src/sections/orders/orders-table';

const orders = [];

const Page = () => {
  const [mode, setMode] = useState('table');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleModeChange = useCallback(
    (event, value) => {
      if (value) {
        setMode(value);
      }
    },
    []
  );

  const handleQueryChange = useCallback(
    (value) => {
      setQuery(value);
    },
    []
  );

  const handleChangePage = useCallback(
    (event, value) => {
      setPage(value);
    },
    []
  );

  const handleChangeRowsPerPage = useCallback(
    (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    []
  );

  return (
    <>
      <Helmet>
        <title>
          Orders
        </title>
      </Helmet>
      <Box
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack
              alignItems="flex-start"
              direction="row"
              justifyContent="space-between"
              spacing={3}
            >
              <Typography variant="h4">
                Orders
              </Typography>
              <Button
                color="primary"
                size="large"
                variant="contained"
              >
                Add
              </Button>
            </Stack>
            <div>
              <Card>
                <OrdersSearch
                  mode={mode}
                  onModeChange={handleModeChange}
                  onQueryChange={handleQueryChange}
                  query={query}
                />
                <Divider />
                <OrdersTable
                  count={orders.length}
                  items={orders}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Card>
            </div>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Page;
