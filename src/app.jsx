import { useRoutes } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { routes } from './routes';
import { createTheme } from './theme';
import { AuthProvider } from './contexts/auth-context';
import 'simplebar-react/dist/simplebar.min.css';

export const App = () => {
  const element = useRoutes(routes);
  const theme = createTheme({
    colorPreset: 'gold',
    contrast: 'high'
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>{element}</AuthProvider>
    </ThemeProvider>
  );
};
