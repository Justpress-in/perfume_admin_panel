import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import { InputBase, SvgIcon } from '@mui/material';
import { styled } from '@mui/material/styles';

const QueryFieldRoot = styled('div')(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: 'background.paper',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  height: 42,
  padding: '0 16px'
}));

export const QueryField = ({ disabled, onChange, placeholder, value: initialValue = '', debounce = 350, ...other }) => {
  const [value, setValue] = useState(initialValue);
  const timerRef = useRef(null);

  // Sync if parent resets the value
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = useCallback((e) => {
    const v = e.target.value;
    setValue(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange?.(v), debounce);
  }, [onChange, debounce]);

  // Fire immediately on Enter too
  const handleKeyUp = useCallback((e) => {
    if (e.key === 'Enter') {
      clearTimeout(timerRef.current);
      onChange?.(value);
    }
  }, [onChange, value]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <QueryFieldRoot {...other}>
      <SvgIcon fontSize="small" sx={{ mr: 1 }}>
        <MagnifyingGlassIcon />
      </SvgIcon>
      <InputBase
        disabled={disabled}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        placeholder={placeholder}
        sx={{ flexGrow: 1 }}
        value={value}
      />
    </QueryFieldRoot>
  );
};

QueryField.propTypes = {
  debounce: PropTypes.number,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.string
};
