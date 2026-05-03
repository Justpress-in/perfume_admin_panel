import { useState } from 'react';
import { Link as RouterLink, matchPath, useLocation } from 'react-router-dom';
import { Collapse, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { items } from './config';

const SIDE_NAV_WIDTH = 100;
const TOP_NAV_HEIGHT = 64;

const NavItem = ({ item, location }) => {
  const isGroup = Boolean(item.children);
  const childActive = isGroup && item.children.some(
    (c) => matchPath({ path: c.href, end: true }, location.pathname)
  );
  const [open, setOpen] = useState(childActive);
  const active = !isGroup && matchPath({ path: item.href, end: true }, location.pathname);

  const itemSx = {
    flexDirection: 'column',
    px: 1,
    py: 1,
    borderRadius: 1,
    mb: 0.25,
    cursor: 'pointer',
    '&:hover': { backgroundColor: 'action.hover' },
  };

  if (isGroup) {
    return (
      <>
        <ListItem
          disablePadding
          onClick={() => setOpen((v) => !v)}
          sx={itemSx}
        >
          <ListItemIcon sx={{ minWidth: 'auto', color: childActive ? 'primary.main' : 'neutral.400' }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              variant: 'caption',
              sx: {
                color: childActive ? 'primary.main' : 'text.secondary',
                fontSize: '0.65rem',
                lineHeight: 1.2,
                mt: 0.25,
                textAlign: 'center',
              }
            }}
          />
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List disablePadding sx={{ pl: 0.5 }}>
            {item.children.map((child) => {
              const childIsActive = matchPath({ path: child.href, end: true }, location.pathname);
              return (
                <ListItem
                  disablePadding
                  component={RouterLink}
                  key={child.href}
                  to={child.href}
                  sx={{
                    ...itemSx,
                    py: 0.75,
                    bgcolor: childIsActive ? 'action.selected' : 'transparent',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 'auto', color: childIsActive ? 'primary.main' : 'neutral.400' }}>
                    {child.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={child.label}
                    primaryTypographyProps={{
                      variant: 'caption',
                      sx: {
                        color: childIsActive ? 'primary.main' : 'text.secondary',
                        fontSize: '0.6rem',
                        lineHeight: 1.2,
                        mt: 0.25,
                        textAlign: 'center',
                      }
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Collapse>
      </>
    );
  }

  return (
    <ListItem
      disablePadding
      component={RouterLink}
      key={item.href}
      to={item.href}
      sx={{ ...itemSx, bgcolor: active ? 'action.selected' : 'transparent' }}
    >
      <ListItemIcon sx={{ minWidth: 'auto', color: active ? 'primary.main' : 'neutral.400' }}>
        {item.icon}
      </ListItemIcon>
      <ListItemText
        primary={item.label}
        primaryTypographyProps={{
          variant: 'caption',
          sx: {
            color: active ? 'primary.main' : 'text.secondary',
            fontSize: '0.65rem',
            lineHeight: 1.2,
            mt: 0.25,
            textAlign: 'center',
          }
        }}
      />
    </ListItem>
  );
};

export const SideNav = () => {
  const location = useLocation();

  return (
    <Drawer
      open
      variant="permanent"
      PaperProps={{
        sx: {
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          height: `calc(100% - ${TOP_NAV_HEIGHT}px)`,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          p: 0.5,
          top: TOP_NAV_HEIGHT,
          width: SIDE_NAV_WIDTH,
          zIndex: (theme) => theme.zIndex.appBar - 100
        }
      }}
    >
      <List sx={{ width: '100%', py: 0.5 }}>
        {items.map((item, idx) => (
          <NavItem key={item.href || item.label || idx} item={item} location={location} />
        ))}
      </List>
    </Drawer>
  );
};
