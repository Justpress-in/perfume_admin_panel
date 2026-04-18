import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { Logo } from 'src/components/logo';
import { useAuth } from 'src/contexts/auth-context';

const TOP_NAV_HEIGHT = 64;

export const TopNav = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/login', { replace: true });
  };

  const initials = (admin?.name || 'A')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Box
      component="header"
      sx={{
        backgroundColor: 'neutral.900',
        color: 'common.white',
        position: 'fixed',
        width: '100%',
        zIndex: (theme) => theme.zIndex.appBar
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{
          minHeight: TOP_NAV_HEIGHT,
          px: 3
        }}
      >
        <Stack alignItems="center" direction="row" spacing={3}>
          <Box
            component={RouterLink}
            to="/"
            sx={{ display: 'inline-flex', height: 24, width: 24 }}
          >
            <Logo />
          </Box>
        </Stack>
        <Stack alignItems="center" direction="row" spacing={2}>
          {admin && (
            <Stack alignItems="flex-end" spacing={0} sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Typography variant="body2">{admin.name}</Typography>
              <Typography variant="caption" sx={{ color: 'neutral.400' }}>
                {admin.role}
              </Typography>
            </Stack>
          )}
          <IconButton onClick={handleOpen} size="small" sx={{ p: 0 }}>
            <Avatar variant="rounded" sx={{ bgcolor: 'primary.main' }}>
              {initials}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { minWidth: 200 } } }}
          >
            {admin && (
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2">{admin.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {admin.email}
                </Typography>
              </Box>
            )}
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>
    </Box>
  );
};
