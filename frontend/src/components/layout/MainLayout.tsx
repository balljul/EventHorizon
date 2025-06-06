import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Container,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Slide,
  useScrollTrigger,
  Fab,
  Zoom,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Event,
  ConfirmationNumber,
  People,
  Settings,
  Logout,
  KeyboardArrowUp,
  Notifications,
  AccountCircle,
} from '@mui/icons-material';
import { useRouter } from 'next/router';

interface Props {
  children: React.ReactNode;
  window?: () => Window;
}

const drawerWidth = 280;

const navigationItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Events', icon: <Event />, path: '/events' },
  { text: 'Tickets', icon: <ConfirmationNumber />, path: '/tickets' },
  { text: 'Users', icon: <People />, path: '/users' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

function HideOnScroll({ children, window }: Props) {
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

function ScrollTop({ window }: Props) {
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = () => {
    const anchor = document.querySelector('#back-to-top-anchor');
    if (anchor) {
      anchor.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    }
  };

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <Fab size="small" aria-label="scroll back to top">
          <KeyboardArrowUp />
        </Fab>
      </Box>
    </Zoom>
  );
}

export default function MainLayout({ children, window }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
          Event<span style={{ color: theme.palette.primary.main }}>Horizon</span>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Event Management Platform
        </Typography>
      </Box>
      
      <Divider />
      
      <List sx={{ flex: 1, px: 2, py: 1 }}>
        {navigationItems.map((item) => (
          <ListItem
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white',
                transform: 'translateX(8px)',
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
              ...(router.pathname === item.path && {
                backgroundColor: 'primary.main',
                color: 'white',
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              }),
            }}
          >
            <ListItemIcon
              sx={{
                color: router.pathname === item.path ? 'white' : 'text.secondary',
                transition: 'color 0.2s',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: router.pathname === item.path ? 600 : 500,
              }}
            />
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            borderRadius: 2,
            backgroundColor: 'grey.50',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: 'grey.100',
            },
          }}
          onClick={handleProfileMenuOpen}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              mr: 2,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            }}
          >
            <AccountCircle />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              John Doe
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Event Organizer
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <HideOnScroll window={window}>
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            boxShadow: 'none',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              {navigationItems.find(item => item.path === router.pathname)?.text || 'Dashboard'}
            </Typography>
            
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                }}
              >
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar id="back-to-top-anchor" />
        
        <Box sx={{ flex: 1, p: 3, backgroundColor: 'background.default' }}>
          <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
            {children}
          </Container>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleNavigation('/profile')}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => handleNavigation('/settings')}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <ScrollTop window={window} />
    </Box>
  );
}