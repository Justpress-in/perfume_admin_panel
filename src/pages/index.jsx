import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ShoppingBagIcon from '@heroicons/react/24/solid/ShoppingBagIcon';
import ShoppingCartIcon from '@heroicons/react/24/solid/ShoppingCartIcon';
import CurrencyDollarIcon from '@heroicons/react/24/solid/CurrencyDollarIcon';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Unstable_Grid2 as Grid
} from '@mui/material';
import { api } from 'src/lib/api';
import { OverviewKpi } from 'src/sections/overview/overview-kpi';
import { OverviewSummary } from 'src/sections/overview/overview-summary';

const formatCurrency = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
};

const Page = () => {
  const [summary, setSummary] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, timelineRes, productsRes, channelsRes] = await Promise.all([
        api.get('/api/analytics/summary'),
        api.get('/api/analytics/orders/timeline'),
        api.get('/api/analytics/products'),
        api.get('/api/analytics/channels')
      ]);
      setSummary(summaryRes.data?.data || null);
      setTimeline(Array.isArray(timelineRes.data?.data) ? timelineRes.data.data : []);
      setTopProducts(Array.isArray(productsRes.data?.data) ? productsRes.data.data : []);
      setChannels(Array.isArray(channelsRes.data?.data) ? channelsRes.data.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const chartSeries = useMemo(
    () => [
      {
        name: 'Revenue',
        data: timeline.map((entry) => Number(entry.revenue) || 0)
      }
    ],
    [timeline]
  );

  const chartCategories = useMemo(
    () => timeline.map((entry) => entry._id || entry.date || ''),
    [timeline]
  );

  const kpiStats = useMemo(() => {
    if (!summary) return [];
    return [
      { label: 'Revenue (total)', value: formatCurrency(summary.revenue?.total) },
      { label: 'Revenue (this month)', value: formatCurrency(summary.revenue?.thisMonth) },
      { label: 'Revenue (last month)', value: formatCurrency(summary.revenue?.lastMonth) },
      {
        label: 'MoM change',
        value:
          summary.revenue?.deltaPercent != null
            ? `${Number(summary.revenue.deltaPercent).toFixed(1)}%`
            : '—'
      },
      { label: 'Active products', value: `${summary.products?.active ?? 0}` }
    ];
  }, [summary]);

  return (
    <>
      <Helmet>
        <title>Overview</title>
      </Helmet>
      <Box sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h4">Reports</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid xs={12} md={4}>
                  <OverviewSummary
                    icon={
                      <Avatar
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          height: 56,
                          width: 56
                        }}
                      >
                        <SvgIcon>
                          <ShoppingBagIcon />
                        </SvgIcon>
                      </Avatar>
                    }
                    label="Orders"
                    value={`${summary?.orders?.total ?? 0}`}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <OverviewSummary
                    icon={
                      <Avatar
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          height: 56,
                          width: 56
                        }}
                      >
                        <SvgIcon>
                          <ShoppingCartIcon />
                        </SvgIcon>
                      </Avatar>
                    }
                    label="Products"
                    value={`${summary?.products?.total ?? 0}`}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <OverviewSummary
                    icon={
                      <Avatar
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          height: 56,
                          width: 56
                        }}
                      >
                        <SvgIcon>
                          <CurrencyDollarIcon />
                        </SvgIcon>
                      </Avatar>
                    }
                    label="Revenue (total)"
                    value={formatCurrency(summary?.revenue?.total)}
                  />
                </Grid>

                <Grid xs={12}>
                  <OverviewKpi
                    chartSeries={chartSeries}
                    stats={kpiStats}
                    categories={chartCategories}
                  />
                </Grid>

                <Grid xs={12} md={6}>
                  <Card>
                    <CardHeader title="Top products" subheader="By sales count" />
                    <Divider />
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="right">Sold</TableCell>
                          <TableCell align="right">Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topProducts.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                align="center"
                                sx={{ py: 3 }}
                              >
                                No sales yet.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                        {topProducts.map((p) => (
                          <TableRow key={p._id}>
                            <TableCell>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar variant="rounded" src={p.image || undefined} />
                                <Stack spacing={0}>
                                  <Typography variant="subtitle2">
                                    {p.name?.en || p.name || '—'}
                                  </Typography>
                                  {p.category && (
                                    <Typography variant="caption" color="text.secondary">
                                      {p.category}
                                    </Typography>
                                  )}
                                </Stack>
                              </Stack>
                            </TableCell>
                            <TableCell align="right">{p.salesCount ?? 0}</TableCell>
                            <TableCell align="right">{formatCurrency(p.price)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </Grid>

                <Grid xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader
                      title="Orders by status"
                      subheader="Current breakdown"
                    />
                    <Divider />
                    <Box sx={{ p: 3 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {Object.entries(summary?.ordersByStatus || {}).map(([status, count]) => (
                          <Chip
                            key={status}
                            label={`${status}: ${count}`}
                            variant="outlined"
                          />
                        ))}
                        {Object.keys(summary?.ordersByStatus || {}).length === 0 && (
                          <Typography variant="body2" color="text.secondary">
                            No orders yet.
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                    <Divider />
                    <CardHeader
                      title="Channels"
                      subheader="Orders by channel"
                      sx={{ pt: 2 }}
                    />
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Channel</TableCell>
                          <TableCell align="right">Orders</TableCell>
                          <TableCell align="right">Revenue</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {channels.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                align="center"
                                sx={{ py: 3 }}
                              >
                                No channel data.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                        {channels.map((c) => (
                          <TableRow key={c._id || 'unknown'}>
                            <TableCell>{c._id || 'Direct'}</TableCell>
                            <TableCell align="right">{c.orders ?? 0}</TableCell>
                            <TableCell align="right">
                              {formatCurrency(c.revenue)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Page;
