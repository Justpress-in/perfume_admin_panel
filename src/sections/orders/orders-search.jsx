import PropTypes from 'prop-types';
import { useState } from 'react';
import AdjustmentsHorizontalIcon from '@heroicons/react/24/outline/AdjustmentsHorizontalIcon';
import ListBulletIcon from '@heroicons/react/24/outline/ListBulletIcon';
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon';
import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  MenuItem,
  Stack,
  SvgIcon,
  TextField,
  ToggleButton,
  toggleButtonClasses,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { QueryField } from 'src/components/query-field';


const CHANNEL_OPTIONS = [
  { value: '', label: 'All channels' },
  { value: 'website', label: 'Website' },
  { value: 'shopee', label: 'Shopee' },
  { value: 'grab', label: 'Grab' },
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'wholesale', label: 'Wholesale' },
];

export const OrdersSearch = ({ mode = 'table', onModeChange, onQueryChange, query, filters, onFiltersChange, statuses = [] }) => {
  const STATUS_OPTIONS = [
    { value: '', label: 'All statuses' },
    ...statuses.map((s) => ({ value: s.value, label: s.label })),
  ];
  const [open, setOpen] = useState(false);

  const activeFilterCount = [filters?.status, filters?.channel, filters?.startDate, filters?.endDate]
    .filter(Boolean).length;

  const handleFilterChange = (key, value) => {
    onFiltersChange?.({ ...filters, [key]: value });
  };

  const handleClear = () => {
    onFiltersChange?.({ status: '', channel: '', startDate: '', endDate: '' });
  };

  return (
    <>
      <Stack alignItems="center" direction="row" flexWrap="wrap" gap={2} sx={{ p: 3 }}>
        <QueryField
          placeholder="Search by order #, customer name or email…"
          onChange={onQueryChange}
          sx={{ flexGrow: 1 }}
          value={query}
        />

        <ToggleButtonGroup
          exclusive
          onChange={(_, value) => { if (value) onModeChange?.(value); }}
          size="small"
          sx={{
            border: (theme) => `1px solid ${theme.palette.divider}`,
            p: 0.5,
            [`& .${toggleButtonClasses.root}`]: {
              border: 0,
              '&:not(:first-of-type)': { borderRadius: 1 },
              '&:first-of-type': { borderRadius: 1, mr: 0.5 }
            }
          }}
          value={mode}
        >
          <ToggleButton value="table">
            <SvgIcon fontSize="small"><ListBulletIcon /></SvgIcon>
          </ToggleButton>
          <ToggleButton value="dnd">
            <SvgIcon fontSize="small"><Squares2X2Icon /></SvgIcon>
          </ToggleButton>
        </ToggleButtonGroup>

        <Button
          size="large"
          onClick={() => setOpen((v) => !v)}
          startIcon={<SvgIcon fontSize="small"><AdjustmentsHorizontalIcon /></SvgIcon>}
          color={activeFilterCount > 0 ? 'primary' : 'inherit'}
          variant={activeFilterCount > 0 ? 'contained' : 'text'}
          endIcon={activeFilterCount > 0
            ? <Chip label={activeFilterCount} size="small" color="default" sx={{ height: 20, fontSize: 11 }} />
            : null}
        >
          Filter
        </Button>
      </Stack>

      <Collapse in={open}>
        <Divider />
        <Box sx={{ px: 3, py: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end">
            <TextField
              select
              label="Status"
              size="small"
              value={filters?.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              sx={{ minWidth: 160 }}
            >
              {STATUS_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Channel"
              size="small"
              value={filters?.channel || ''}
              onChange={(e) => handleFilterChange('channel', e.target.value)}
              sx={{ minWidth: 160 }}
            >
              {CHANNEL_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </TextField>

            <TextField
              type="date"
              label="From date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={filters?.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              sx={{ minWidth: 160 }}
            />

            <TextField
              type="date"
              label="To date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={filters?.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              sx={{ minWidth: 160 }}
            />

            {activeFilterCount > 0 && (
              <Button size="small" color="inherit" onClick={handleClear}>
                Clear filters
              </Button>
            )}
          </Stack>

          {activeFilterCount > 0 && (
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap">
              {filters?.status && (
                <Chip
                  size="small"
                  label={`Status: ${filters.status}`}
                  onDelete={() => handleFilterChange('status', '')}
                />
              )}
              {filters?.channel && (
                <Chip
                  size="small"
                  label={`Channel: ${filters.channel}`}
                  onDelete={() => handleFilterChange('channel', '')}
                />
              )}
              {filters?.startDate && (
                <Chip
                  size="small"
                  label={`From: ${filters.startDate}`}
                  onDelete={() => handleFilterChange('startDate', '')}
                />
              )}
              {filters?.endDate && (
                <Chip
                  size="small"
                  label={`To: ${filters.endDate}`}
                  onDelete={() => handleFilterChange('endDate', '')}
                />
              )}
            </Stack>
          )}
        </Box>
      </Collapse>
    </>
  );
};

OrdersSearch.propTypes = {
  mode: PropTypes.oneOf(['table', 'dnd']),
  onModeChange: PropTypes.func,
  onQueryChange: PropTypes.func,
  query: PropTypes.string,
  filters: PropTypes.object,
  onFiltersChange: PropTypes.func,
  statuses: PropTypes.array,
};
