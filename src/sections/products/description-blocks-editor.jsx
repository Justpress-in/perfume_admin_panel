import { Fragment } from 'react';
import {
  Box,
  Button,
  Card,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import ChevronUpIcon from '@heroicons/react/24/outline/ChevronUpIcon';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import { SvgIcon } from '@mui/material';

const BLOCK_TYPES = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'bullets',   label: 'Bullet Points' },
  { value: 'featured',  label: 'Featured Points' },
  { value: 'specs',     label: 'Specs Table' },
];

const createBlock = (type) => {
  const base = { type, heading: { en: '', ar: '' } };
  if (type === 'paragraph') return { ...base, text: { en: '', ar: '' } };
  if (type === 'bullets' || type === 'featured') return { ...base, items: [{ en: '', ar: '' }] };
  if (type === 'specs') return { ...base, rows: [{ label: { en: '', ar: '' }, value: { en: '', ar: '' } }] };
  return base;
};

export const DescriptionBlocksEditor = ({ value = [], onChange }) => {
  const blocks = Array.isArray(value) ? value : [];

  const update = (idx, patch) => {
    const next = blocks.map((b, i) => (i === idx ? { ...b, ...patch } : b));
    onChange(next);
  };

  const remove = (idx) => onChange(blocks.filter((_, i) => i !== idx));

  const move = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const addBlock = (type) => onChange([...blocks, createBlock(type)]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="subtitle2">Rich Description</Typography>
        <Typography variant="caption" color="text.secondary">
          {blocks.length} block{blocks.length !== 1 ? 's' : ''}
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {blocks.map((block, idx) => (
          <Card key={idx} variant="outlined" sx={{ p: 2 }}>
            {/* Block header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{
                  px: 1, py: 0.25, bgcolor: 'primary.light', color: 'primary.dark',
                  fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase',
                  borderRadius: 1,
                }}>
                  {BLOCK_TYPES.find(b => b.value === block.type)?.label || block.type}
                </Box>
              </Stack>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Move up">
                  <span>
                    <IconButton size="small" disabled={idx === 0} onClick={() => move(idx, -1)}>
                      <SvgIcon fontSize="inherit"><ChevronUpIcon /></SvgIcon>
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Move down">
                  <span>
                    <IconButton size="small" disabled={idx === blocks.length - 1} onClick={() => move(idx, 1)}>
                      <SvgIcon fontSize="inherit"><ChevronDownIcon /></SvgIcon>
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Delete block">
                  <IconButton size="small" color="error" onClick={() => remove(idx)}>
                    <SvgIcon fontSize="inherit"><TrashIcon /></SvgIcon>
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            {/* Heading (optional, all types) */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={1.5}>
              <TextField
                fullWidth size="small" label="Heading (English) — optional"
                value={block.heading?.en || ''}
                onChange={(e) => update(idx, { heading: { ...block.heading, en: e.target.value } })}
              />
              <TextField
                fullWidth size="small" label="Heading (Arabic) — optional"
                value={block.heading?.ar || ''}
                onChange={(e) => update(idx, { heading: { ...block.heading, ar: e.target.value } })}
                inputProps={{ dir: 'rtl' }}
              />
            </Stack>

            {/* Paragraph */}
            {block.type === 'paragraph' && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  fullWidth multiline minRows={3} size="small" label="Text (English)"
                  value={block.text?.en || ''}
                  onChange={(e) => update(idx, { text: { ...block.text, en: e.target.value } })}
                />
                <TextField
                  fullWidth multiline minRows={3} size="small" label="Text (Arabic)"
                  value={block.text?.ar || ''}
                  onChange={(e) => update(idx, { text: { ...block.text, ar: e.target.value } })}
                  inputProps={{ dir: 'rtl' }}
                />
              </Stack>
            )}

            {/* Bullets & Featured — items list */}
            {(block.type === 'bullets' || block.type === 'featured') && (
              <Stack spacing={1}>
                {(block.items || []).map((item, i) => (
                  <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                    <Typography variant="caption" sx={{ mt: 1.5, minWidth: 18, color: 'text.secondary' }}>
                      {block.type === 'bullets' ? '•' : `${i + 1}.`}
                    </Typography>
                    <TextField
                      fullWidth size="small" label={`Item ${i + 1} (English)`}
                      value={item.en || ''}
                      onChange={(e) => {
                        const items = block.items.map((it, j) => j === i ? { ...it, en: e.target.value } : it);
                        update(idx, { items });
                      }}
                    />
                    <TextField
                      fullWidth size="small" label={`Item ${i + 1} (Arabic)`}
                      value={item.ar || ''}
                      onChange={(e) => {
                        const items = block.items.map((it, j) => j === i ? { ...it, ar: e.target.value } : it);
                        update(idx, { items });
                      }}
                      inputProps={{ dir: 'rtl' }}
                    />
                    <IconButton size="small" color="error"
                      onClick={() => update(idx, { items: block.items.filter((_, j) => j !== i) })}
                      disabled={block.items.length <= 1}
                    >
                      <SvgIcon fontSize="inherit"><TrashIcon /></SvgIcon>
                    </IconButton>
                  </Stack>
                ))}
                <Button
                  size="small" variant="text"
                  startIcon={<SvgIcon fontSize="small"><PlusIcon /></SvgIcon>}
                  onClick={() => update(idx, { items: [...(block.items || []), { en: '', ar: '' }] })}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add item
                </Button>
              </Stack>
            )}

            {/* Specs Table */}
            {block.type === 'specs' && (
              <Stack spacing={1}>
                {(block.rows || []).map((row, i) => (
                  <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                    <TextField
                      size="small" sx={{ flex: 1 }} label="Label (English)"
                      value={row.label?.en || ''}
                      onChange={(e) => {
                        const rows = block.rows.map((r, j) =>
                          j === i ? { ...r, label: { ...r.label, en: e.target.value } } : r
                        );
                        update(idx, { rows });
                      }}
                    />
                    <TextField
                      size="small" sx={{ flex: 1.5 }} label="Value (English)"
                      value={row.value?.en || ''}
                      onChange={(e) => {
                        const rows = block.rows.map((r, j) =>
                          j === i ? { ...r, value: { ...r.value, en: e.target.value } } : r
                        );
                        update(idx, { rows });
                      }}
                    />
                    <IconButton size="small" color="error"
                      onClick={() => update(idx, { rows: block.rows.filter((_, j) => j !== i) })}
                      disabled={block.rows.length <= 1}
                    >
                      <SvgIcon fontSize="inherit"><TrashIcon /></SvgIcon>
                    </IconButton>
                  </Stack>
                ))}
                <Button
                  size="small" variant="text"
                  startIcon={<SvgIcon fontSize="small"><PlusIcon /></SvgIcon>}
                  onClick={() => update(idx, { rows: [...(block.rows || []), { label: { en: '', ar: '' }, value: { en: '', ar: '' } }] })}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add row
                </Button>
              </Stack>
            )}
          </Card>
        ))}

        {blocks.length === 0 && (
          <Card variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
            <Typography variant="body2" color="text.secondary">
              No description blocks yet. Use the buttons below to add one.
            </Typography>
          </Card>
        )}
      </Stack>

      {/* Add block buttons */}
      <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" useFlexGap>
        {BLOCK_TYPES.map((bt) => (
          <Button
            key={bt.value}
            size="small"
            variant="outlined"
            startIcon={<SvgIcon fontSize="small"><PlusIcon /></SvgIcon>}
            onClick={() => addBlock(bt.value)}
          >
            {bt.label}
          </Button>
        ))}
      </Stack>
    </Box>
  );
};
