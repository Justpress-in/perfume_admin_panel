import { alpha } from '@mui/material/styles';

const withAlphas = (color) => {
  return {
    ...color,
    alpha4: alpha(color.main, 0.04),
    alpha8: alpha(color.main, 0.08),
    alpha12: alpha(color.main, 0.12),
    alpha30: alpha(color.main, 0.30),
    alpha50: alpha(color.main, 0.50)
  };
};

export const neutral = {
  50: '#FBF9F6',
  100: '#F5F1EA',
  200: '#E5E1DA',
  300: '#C8C1B3',
  400: '#999999',
  500: '#666666',
  600: '#44433F',
  700: '#2E2D2A',
  800: '#1F1E1C',
  900: '#1A1A2E'
};

export const blue = withAlphas({
  light: '#EBEFFF',
  main: '#2970FF',
  dark: '#004EEB',
  contrastText: '#FFFFFF'
});

export const green = withAlphas({
  light: '#6CE9A6',
  main: '#12B76A',
  dark: '#027A48',
  contrastText: '#FFFFFF'
});

export const indigo = withAlphas({
  light: '#EBEEFE',
  main: '#635dff',
  dark: '#4338CA',
  contrastText: '#FFFFFF'
});

export const purple = withAlphas({
  light: '#F4EBFF',
  main: '#9E77ED',
  dark: '#6941C6',
  contrastText: '#FFFFFF'
});

// Brand palette mirroring the storefront (oudalnood.com design system)
export const gold = withAlphas({
  light: '#E2C7A3',
  main: '#C69C6D',
  dark: '#B88A44',
  contrastText: '#FFFFFF'
});

export const burgundy = withAlphas({
  light: '#D97575',
  main: '#8B1F1F',
  dark: '#611212',
  contrastText: '#FFFFFF'
});

export const success = withAlphas({
  light: '#3FC79A',
  main: '#10B981',
  dark: '#0B815A',
  contrastText: '#FFFFFF'
});

export const info = withAlphas({
  light: '#CFF9FE',
  main: '#06AED4',
  dark: '#0E7090',
  contrastText: '#FFFFFF'
});

export const warning = withAlphas({
  light: '#FEF0C7',
  main: '#F79009',
  dark: '#B54708',
  contrastText: '#FFFFFF'
});

export const error = withAlphas({
  light: '#F9D6D6',
  main: '#8B1F1F',
  dark: '#611212',
  contrastText: '#FFFFFF'
});
