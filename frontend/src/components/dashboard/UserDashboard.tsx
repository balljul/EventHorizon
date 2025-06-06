'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  useTheme,
  alpha,
  keyframes,
  CardActions,
  Divider,
  LinearProgress,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Event,
  Schedule,
  LocationOn,
  People,
  Star,
  CalendarToday,
  Notifications,
  TrendingUp,
  AccessTime,
  AutoAwesome,
  RocketLaunch,
} from '@mui/icons-material';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { useThemeMode } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardApi, UserDashboardData, Event as EventType } from '../../lib/dashboard';
import EventDetailsModal from './EventDetailsModal';

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
  50% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.6); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// Real data will be loaded from API

interface EventCardProps {
  event: EventType;
  onViewDetails: (event: EventType) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onViewDetails }) => {
  const { mode } = useThemeMode();
  const theme = useTheme();

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM dd');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4caf50';
      case 'pending': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  return (
    <Card
      sx={{
        background: mode === 'cosmic' 
          ? 'linear-gradient(145deg, rgba(25, 25, 25, 0.9) 0%, rgba(15, 15, 35, 0.9) 100%)'
          : mode === 'dark'
          ? 'linear-gradient(145deg, rgba(30, 30, 30, 0.9) 0%, rgba(20, 20, 40, 0.9) 100%)'
          : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
          animation: `${glow} 2s ease-in-out infinite`,
        },
      }}
    >
      <Box
        sx={{
          height: 160,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1))',
          },
        }}
      >
        <AutoAwesome sx={{ fontSize: 48, color: 'white', animation: `${float} 3s ease-in-out infinite` }} />
        <Chip
          label={getDateLabel(event.startDate)}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            color: 'rgba(0, 0, 0, 0.8)',
            fontWeight: 600,
          }}
        />
      </Box>
      
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Chip
            label={event.category?.name || 'General'}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.2),
              color: theme.palette.primary.main,
              fontWeight: 600,
            }}
          />
          <Chip
            label={event.status || 'active'}
            size="small"
            sx={{
              bgcolor: getStatusColor(event.status || 'active'),
              color: 'white',
              fontWeight: 600,
            }}
          />
        </Box>
        
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {event.title}
        </Typography>
        
        <Box display="flex" alignItems="center" mb={1}>
          <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {format(new Date(event.startDate), 'hh:mm a')}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" mb={1}>
          <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {event.location}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" mb={2}>
          <People sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {event.attendeeCount || 0} attendees
          </Typography>
        </Box>
        
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Capacity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(((event.attendeeCount || 0) / (event.capacity || event.maxCapacity || 1)) * 100)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.round(((event.attendeeCount || 0) / (event.capacity || event.maxCapacity || 1)) * 100)}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.2),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              },
            }}
          />
        </Box>
      </CardContent>
      
      <CardActions sx={{ p: 3, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => onViewDetails(event)}
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            borderRadius: 2,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
          }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

const UserDashboard: React.FC = () => {
  const { mode } = useThemeMode();
  const theme = useTheme();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardApi.getUserDashboardData(user!.id);
      setDashboardData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      console.error('User dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (event: EventType) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const getBackgroundStyle = () => {
    switch (mode) {
      case 'cosmic':
        return {
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1a1a2e 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.2) 0%, transparent 50%)',
            zIndex: 0,
          },
        };
      case 'dark':
        return {
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        };
      default:
        return {
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        };
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        ...getBackgroundStyle(),
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="between" mb={4}>
          <Box display="flex" alignItems="center">
            <RocketLaunch sx={{ fontSize: 32, mr: 2, color: theme.palette.primary.main }} />
            <Box>
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                Welcome Back, {user?.firstName}!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Ready for your next learning adventure?
              </Typography>
            </Box>
          </Box>
          <Chip
            label={loading ? "Loading..." : "Live Data"}
            sx={{
              background: loading 
                ? 'linear-gradient(45deg, #ff9800, #ffb74d)' 
                : 'linear-gradient(45deg, #4caf50, #81c784)',
              color: 'white',
              fontWeight: 600,
              animation: loading ? `${pulse} 1s ease-in-out infinite` : `${pulse} 2s ease-in-out infinite`,
            }}
          />
        </Box>

        {/* Error State */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={loadDashboardData}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress size={60} sx={{ color: 'primary.main' }} />
          </Box>
        )}

        {/* Dashboard Content */}
        {!loading && dashboardData && (
          <>

          {/* Stats Overview */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
            {[
              { label: 'Events Attended', value: dashboardData.userStats.eventsAttended, icon: <Event />, color: '#667eea' },
              { label: 'Upcoming Events', value: dashboardData.userStats.upcomingEvents, icon: <Schedule />, color: '#764ba2' },
              { label: 'Total Spent', value: `$${dashboardData.userStats.totalSpent.toFixed(0)}`, icon: <Star />, color: '#f093fb' },
              { label: 'Certificates', value: dashboardData.userStats.certificates, icon: <People />, color: '#4facfe' },
            ].map((stat, index) => (
              <Box key={index}>
                <Card
                  sx={{
                    background: mode === 'cosmic' 
                      ? 'linear-gradient(145deg, rgba(25, 25, 25, 0.9) 0%, rgba(15, 15, 35, 0.9) 100%)'
                      : mode === 'dark'
                      ? 'linear-gradient(145deg, rgba(30, 30, 30, 0.9) 0%, rgba(20, 20, 40, 0.9) 100%)'
                      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha(stat.color, 0.3)}`,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(stat.color, 0.4)}`,
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(stat.color, 0.2),
                        color: stat.color,
                        width: 48,
                        height: 48,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
          {/* Upcoming Events */}
          <Box>
            <Paper
              sx={{
                p: 3,
                background: mode === 'cosmic' 
                  ? 'linear-gradient(145deg, rgba(25, 25, 25, 0.9) 0%, rgba(15, 15, 35, 0.9) 100%)'
                  : mode === 'dark'
                  ? 'linear-gradient(145deg, rgba(30, 30, 30, 0.9) 0%, rgba(20, 20, 40, 0.9) 100%)'
                  : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Typography variant="h5" fontWeight="bold" mb={3}>
                Your Upcoming Events ({dashboardData.upcomingEvents.length})
              </Typography>
              {dashboardData.upcomingEvents.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <AutoAwesome sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" mb={1}>
                    No upcoming events
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Browse our events to find something exciting!
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  {dashboardData.upcomingEvents.map((event) => (
                    <Box key={event.id}>
                      <EventCard event={event} onViewDetails={handleViewDetails} />
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>

          {/* Recent Activity */}
          <Box>
            <Paper
              sx={{
                p: 3,
                background: mode === 'cosmic' 
                  ? 'linear-gradient(145deg, rgba(25, 25, 25, 0.9) 0%, rgba(15, 15, 35, 0.9) 100%)'
                  : mode === 'dark'
                  ? 'linear-gradient(145deg, rgba(30, 30, 30, 0.9) 0%, rgba(20, 20, 40, 0.9) 100%)'
                  : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                height: 'fit-content',
              }}
            >
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Recent Activity
              </Typography>
              {dashboardData.recentActivity.map((activity, index) => (
                <Box key={index}>
                  <Box display="flex" alignItems="center" py={2}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                        color: theme.palette.primary.main,
                        width: 32,
                        height: 32,
                        mr: 2,
                      }}
                    >
                      <TrendingUp sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="500">
                        {activity.action}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                  {index < dashboardData.recentActivity.length - 1 && <Divider />}
                </Box>
              ))}
            </Paper>
          </Box>
        </Box>
        </>
        )}

        {/* Event Details Modal */}
        <EventDetailsModal
          open={modalOpen}
          onClose={handleCloseModal}
          event={selectedEvent}
          isUserDashboard={true}
        />
      </Box>
    </Box>
  );
};

export default UserDashboard;