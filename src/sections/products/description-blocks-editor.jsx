import { useEffect, useRef } from 'react';
import { Box, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatClearIcon from '@mui/icons-material/FormatClear';

const ToolbarButton = ({ title, icon, onMouseDown }) => (
  <Tooltip title={title}>
    <IconButton
      size="small"
      onMouseDown={onMouseDown}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 0.5,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      {icon}
    </IconButton>
  </Tooltip>
);

const Toolbar = ({ onExec }) => (
  <Stack
    direction="row"
    spacing={0.5}
    flexWrap="wrap"
    useFlexGap
    alignItems="center"
    sx={{ px: 1, py: 0.75, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}
  >
    <ToolbarButton title="Bold (Ctrl+B)"        icon={<FormatBoldIcon fontSize="small" />}          onMouseDown={(e) => onExec(e, 'bold')} />
    <ToolbarButton title="Italic (Ctrl+I)"       icon={<FormatItalicIcon fontSize="small" />}        onMouseDown={(e) => onExec(e, 'italic')} />
    <ToolbarButton title="Underline (Ctrl+U)"    icon={<FormatUnderlinedIcon fontSize="small" />}    onMouseDown={(e) => onExec(e, 'underline')} />

    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

    <ToolbarButton title="Bullet list"           icon={<FormatListBulletedIcon fontSize="small" />}  onMouseDown={(e) => onExec(e, 'insertUnorderedList')} />
    <ToolbarButton title="Numbered list"         icon={<FormatListNumberedIcon fontSize="small" />}  onMouseDown={(e) => onExec(e, 'insertOrderedList')} />

    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

    <ToolbarButton title="Align left"            icon={<FormatAlignLeftIcon fontSize="small" />}     onMouseDown={(e) => onExec(e, 'justifyLeft')} />
    <ToolbarButton title="Align center"          icon={<FormatAlignCenterIcon fontSize="small" />}   onMouseDown={(e) => onExec(e, 'justifyCenter')} />
    <ToolbarButton title="Align right"           icon={<FormatAlignRightIcon fontSize="small" />}    onMouseDown={(e) => onExec(e, 'justifyRight')} />

    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

    <ToolbarButton title="Clear formatting"      icon={<FormatClearIcon fontSize="small" />}         onMouseDown={(e) => onExec(e, 'removeFormat')} />
  </Stack>
);

const RichTextEditor = ({ label, value, onChange, dir = 'ltr' }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (e, command, arg) => {
    e.preventDefault();
    ref.current?.focus();
    // eslint-disable-next-line no-restricted-properties
    document.execCommand(command, false, arg ?? null);
  };

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        '&:focus-within': { borderColor: 'primary.main', borderWidth: 2, m: '-1px' },
      }}
    >
      <Typography
        variant="caption"
        sx={{ display: 'block', px: 1.5, pt: 0.75, pb: 0.25, color: 'text.secondary', lineHeight: 1 }}
      >
        {label}
      </Typography>

      <Toolbar onExec={exec} />

      <Box
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        dir={dir}
        onInput={() => onChange(ref.current?.innerHTML || '')}
        sx={{
          minHeight: 140,
          px: 1.5,
          py: 1,
          outline: 'none',
          fontSize: 14,
          lineHeight: 1.6,
          color: 'text.primary',
          '& ul, & ol': { pl: 2.5, my: 0.5 },
          '& li': { mb: 0.25 },
          '&:empty:before': {
            content: '"Start typing…"',
            color: 'text.disabled',
            pointerEvents: 'none',
          },
        }}
      />
    </Box>
  );
};

export const DescriptionBlocksEditor = ({ value = {}, onChange }) => {
  const htmlEn = typeof value === 'object' && !Array.isArray(value) ? (value.en || '') : '';
  const htmlAr = typeof value === 'object' && !Array.isArray(value) ? (value.ar || '') : '';

  return (
    <Stack spacing={2}>
      <RichTextEditor
        label="Rich Description (English)"
        value={htmlEn}
        onChange={(html) => onChange({ en: html, ar: htmlAr })}
        dir="ltr"
      />
      <RichTextEditor
        label="Rich Description (Arabic)"
        value={htmlAr}
        onChange={(html) => onChange({ en: htmlEn, ar: html })}
        dir="rtl"
      />
    </Stack>
  );
};
