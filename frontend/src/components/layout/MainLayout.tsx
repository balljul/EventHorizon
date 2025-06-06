'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
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
  Collapse,
  ListItemButton,
  Chip,
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
  Category,
  PersonAdd,
  EventSeat,
  Analytics,
  AdminPanelSettings,
  GroupAdd,
  EventAvailable,
  Payment,
  ExpandLess,
  ExpandMore,
  LocationOn,
  CalendarToday,
  Assignment,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  children?: React.ReactNode;
  window?: () => Window;
}

const drawerWidth = 280;

interface NavigationItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  adminOnly?: boolean;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { 
    text: 'Events', 
    icon: <Event />, 
    path: '/events',
    children: [
      { text: 'All Events', icon: <EventAvailable />, path: '/events' },
      { text: 'My Events', icon: <CalendarToday />, path: '/events/my' },
      { text: 'Create Event', icon: <Event />, path: '/events/create' },
    ]
  },
  { 
    text: 'Tickets', 
    icon: <ConfirmationNumber />, 
    path: '/tickets',
    children: [
      { text: 'All Tickets', icon: <ConfirmationNumber />, path: '/tickets' },
      { text: 'My Tickets', icon: <Assignment />, path: '/tickets/my' },
      { text: 'Manage Tickets', icon: <EventSeat />, path: '/tickets/manage', adminOnly: true },
    ]
  },
  { 
    text: 'Attendees', 
    icon: <People />, 
    path: '/attendees',
    children: [
      { text: 'All Attendees', icon: <People />, path: '/attendees', adminOnly: true },
      { text: 'Event Attendees', icon: <GroupAdd />, path: '/attendees/events', adminOnly: true },
      { text: 'Registration', icon: <PersonAdd />, path: '/attendees/register' },
    ]
  },
  { text: 'Categories', icon: <Category />, path: '/categories', adminOnly: true },
  { text: 'Venues', icon: <LocationOn />, path: '/venues', adminOnly: true },
  { 
    text: 'Users', 
    icon: <People />, 
    path: '/users', 
    adminOnly: true,
    children: [
      { text: 'All Users', icon: <People />, path: '/users' },
      { text: 'User Roles', icon: <AdminPanelSettings />, path: '/users/roles' },
      { text: 'Create User', icon: <PersonAdd />, path: '/users/create' },
    ]
  },
  { 
    text: 'Analytics', 
    icon: <Analytics />, 
    path: '/analytics', 
    adminOnly: true,
    children: [
      { text: 'Event Analytics', icon: <Analytics />, path: '/analytics/events' },
      { text: 'Revenue', icon: <Payment />, path: '/analytics/revenue' },
      { text: 'Attendance', icon: <EventSeat />, path: '/analytics/attendance' },
    ]
  },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

function HideOnScroll({ children, window }: Props) {
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      <div>{children}</div>
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
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Check if user is admin
  const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('administrator') || false;

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

  const handleExpandClick = (itemText: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemText]: !prev[itemText]
    }));
  };

  const renderNavigationItems = (items: NavigationItem[], level = 0) => {
    return items
      .filter(item => !item.adminOnly || isAdmin)
      .map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems[item.text];
        const isActive = pathname === item.path;
        const hasActiveChild = item.children?.some(child => pathname === child.path);

        return (
          <React.Fragment key={item.text}>
            <ListItemButton
              onClick={() => {
                if (hasChildren) {
                  handleExpandClick(item.text);
                } else {
                  handleNavigation(item.path);
                }
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                ml: level * 2,
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  transform: 'translateX(8px)',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                ...(isActive || hasActiveChild ? {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                } : {}),
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive || hasActiveChild ? 'white' : 'text.secondary',
                  transition: 'color 0.2s',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: isActive || hasActiveChild ? 600 : 500,
                    fontSize: level > 0 ? '0.875rem' : '1rem',
                  }
                }}
              />
              {hasChildren && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {item.adminOnly && (
                    <Chip 
                      label="Admin" 
                      size="small" 
                      sx={{ 
                        mr: 1, 
                        height: 20,
                        fontSize: '0.625rem',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white'
                      }} 
                    />
                  )}
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </Box>
              )}
              {!hasChildren && item.adminOnly && (
                <Chip 
                  label="Admin" 
                  size="small" 
                  sx={{ 
                    height: 20,
                    fontSize: '0.625rem',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white'
                  }} 
                />
              )}
            </ListItemButton>
            {hasChildren && (
              <Collapse in={isExpanded || hasActiveChild} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {renderNavigationItems(item.children, level + 1)}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        );
      });
  };

  const getCurrentPageTitle = () => {
    for (const item of navigationItems) {
      if (item.path === pathname) return item.text;
      if (item.children) {
        for (const child of item.children) {
          if (child.path === pathname) return child.text;
        }
      }
    }
    return 'Dashboard';
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
        {renderNavigationItems(navigationItems)}
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
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isAdmin ? 'Administrator' : 'User'}
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
              {getCurrentPageTitle()}
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
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 200,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1.5,
              },
            },
          }
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
        <MenuItem onClick={logout}>
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