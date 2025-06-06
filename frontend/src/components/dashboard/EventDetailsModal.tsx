'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
  Divider,
  useTheme,
  alpha,
  keyframes,
  LinearProgress,
  Card,
  CardContent,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Close,
  Event,
  LocationOn,
  Schedule,
  People,
  AttachMoney,
  Category,
  PersonAdd,
  Share,
  Favorite,
  FavoriteBorder,
  CalendarToday,
  AccessTime,
  Info,
  CheckCircle,
  AutoAwesome,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useThemeMode } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Event as EventType, dashboardApi } from '../../lib/dashboard';

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

interface EventDetailsModalProps {
  open: boolean;
  onClose: () => void;
  event: EventType | null;
  isUserDashboard?: boolean;
  onRegistrationSuccess?: () => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  open,
  onClose,
  event,
  isUserDashboard = false,
  onRegistrationSuccess,
}) => {
  const { mode } = useThemeMode();
  const theme = useTheme();
  const { user } = useAuth();
  const [registering, setRegistering] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const [saved, setSaved] = React.useState(false);

  if (!event) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'inactive': return '#ff9800';
      case 'cancelled': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const capacity = event.capacity || event.maxCapacity || 0;
  const attendeeCount = event.attendeeCount || 0;
  const capacityPercentage = capacity > 0 ? Math.round((attendeeCount / capacity) * 100) : 0;

  const handleRegister = async () => {
    if (!user?.id || !event?.id) return;

    try {
      setRegistering(true);
      await dashboardApi.registerForEvent(event.id, user.id);
      setSnackbar({
        open: true,
        message: 'Successfully registered for the event!',
        severity: 'success',
      });
      onRegistrationSuccess?.();
      // Close modal after successful registration
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to register for event',
        severity: 'error',
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: event.title,
        text: `Join me at ${event.title} on ${format(new Date(event.startDate), 'MMM dd, yyyy')} at ${event.location}`,
        url: window.location.href,
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setSnackbar({
          open: true,
          message: 'Event shared successfully!',
          severity: 'success',
        });
      } else {
        // Fallback: copy to clipboard
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        setSnackbar({
          open: true,
          message: 'Event details copied to clipboard!',
          severity: 'success',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      setSnackbar({
        open: true,
        message: 'Failed to share event',
        severity: 'error',
      });
    }
  };

  const handleSave = () => {
    setSaved(!saved);
    setSnackbar({
      open: true,
      message: saved ? 'Event removed from saved' : 'Event saved successfully!',
      severity: 'success',
    });
  };

  const getBackgroundStyle = () => {
    switch (mode) {
      case 'cosmic':
        return {
          background: 'linear-gradient(145deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 35, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
        };
      case 'dark':
        return {
          background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 40, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
        };
      default:
        return {
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
        };
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          ...getBackgroundStyle(),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      {/* Header with Gradient Background */}
      <Box
        sx={{
          height: 200,
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
        <AutoAwesome 
          sx={{ 
            fontSize: 64, 
            color: 'white', 
            animation: `${float} 3s ease-in-out infinite`,
            zIndex: 1,
          }} 
        />
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white',
            bgcolor: 'rgba(0, 0, 0, 0.3)',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.5)',
            },
            zIndex: 2,
          }}
        >
          <Close />
        </IconButton>
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 24,
            zIndex: 1,
          }}
        >
          <Typography variant="h4" fontWeight="bold" color="white" mb={1}>
            {event.title}
          </Typography>
          <Box display="flex" gap={1}>
            <Chip
              label={event.category?.name || 'General'}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
              }}
            />
            <Chip
              label={event.status || 'active'}
              sx={{
                bgcolor: getStatusColor(event.status || 'active'),
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Quick Info Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
            <Card
              sx={{
                background: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <CalendarToday sx={{ color: theme.palette.primary.main, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold">
                  {format(new Date(event.startDate), 'MMM dd, yyyy')}
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                background: alpha(theme.palette.secondary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <AccessTime sx={{ color: theme.palette.secondary.main, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Time
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold">
                  {format(new Date(event.startDate), 'hh:mm a')}
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                background: alpha('#4caf50', 0.1),
                border: `1px solid ${alpha('#4caf50', 0.2)}`,
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <People sx={{ color: '#4caf50', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Attendees
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold">
                  {attendeeCount} / {capacity}
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                background: alpha('#ff9800', 0.1),
                border: `1px solid ${alpha('#ff9800', 0.2)}`,
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <AttachMoney sx={{ color: '#ff9800', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Revenue
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold">
                  ${(event.revenue || 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Event Details */}
          <Box mb={3}>
            <Typography variant="h6" fontWeight="bold" mb={2} display="flex" alignItems="center">
              <Info sx={{ mr: 1, color: theme.palette.primary.main }} />
              Event Details
            </Typography>
            
            <Box display="flex" alignItems="center" mb={2}>
              <LocationOn sx={{ mr: 2, color: 'text.secondary' }} />
              <Typography variant="body1">
                {event.location}
              </Typography>
            </Box>

            <Box display="flex" alignItems="flex-start" mb={2}>
              <Schedule sx={{ mr: 2, mt: 0.5, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body1" mb={0.5}>
                  {format(new Date(event.startDate), 'EEEE, MMMM dd, yyyy')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {format(new Date(event.startDate), 'hh:mm a')} - {format(new Date(event.endDate), 'hh:mm a')}
                </Typography>
              </Box>
            </Box>

            {event.description && (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, lineHeight: 1.6 }}>
                {event.description}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Capacity Progress */}
          <Box mb={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Registration Status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {capacityPercentage}% Full
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={capacityPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: capacityPercentage > 80 
                    ? 'linear-gradient(45deg, #ff9800, #ff5722)'
                    : capacityPercentage > 60
                    ? 'linear-gradient(45deg, #ff9800, #ffb74d)'
                    : 'linear-gradient(45deg, #4caf50, #81c784)',
                },
              }}
            />
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="caption" color="text.secondary">
                {attendeeCount} registered
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {capacity - attendeeCount} spots remaining
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Box display="flex" gap={2} width="100%">
          {isUserDashboard && (
            <>
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={handleShare}
                sx={{
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                Share
              </Button>
              <Button
                variant="outlined"
                startIcon={saved ? <Favorite /> : <FavoriteBorder />}
                onClick={handleSave}
                sx={{
                  borderColor: alpha('#e91e63', 0.5),
                  color: '#e91e63',
                  '&:hover': {
                    borderColor: '#e91e63',
                    bgcolor: alpha('#e91e63', 0.1),
                  },
                }}
              >
                {saved ? 'Saved' : 'Save'}
              </Button>
            </>
          )}
          
          <Button
            variant="contained"
            startIcon={isUserDashboard ? <PersonAdd /> : <CheckCircle />}
            onClick={isUserDashboard ? handleRegister : undefined}
            disabled={capacityPercentage >= 100 || registering}
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              flex: 1,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                animation: `${glow} 2s ease-in-out infinite`,
              },
            }}
          >
            {registering 
              ? 'Registering...'
              : capacityPercentage >= 100 
                ? 'Event Full' 
                : isUserDashboard 
                  ? 'Register Now' 
                  : 'View Attendees'
            }
          </Button>
        </Box>
      </DialogActions>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default EventDetailsModal;