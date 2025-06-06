'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  useTheme,
  alpha,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Event,
  LocationOn,
  People,
  Visibility,
  CalendarToday,
  AccessTime,
  EventAvailable,
} from '@mui/icons-material';
import { format, isAfter } from 'date-fns';
import { useThemeMode } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Event as EventType, dashboardApi } from '../../lib/dashboard';
import EventDetailsModal from '../../components/dashboard/EventDetailsModal';
import MainLayout from '../../components/layout/MainLayout';

export default function AllEventsPage() {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const { user } = useAuth();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const eventsPerPage = 9;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getAllEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: EventType) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleRegistrationSuccess = () => {
    // Refresh events to update attendee counts
    fetchEvents();
  };

  const getStatusColor = (event: EventType) => {
    const now = new Date();
    const eventStart = new Date(event.startDate);
    
    if (!event.isActive) return '#9e9e9e';
    if (isAfter(eventStart, now)) return '#4caf50';
    return '#ff9800';
  };

  const getStatusLabel = (event: EventType) => {
    const now = new Date();
    const eventStart = new Date(event.startDate);
    
    if (!event.isActive) return 'Inactive';
    if (isAfter(eventStart, now)) return 'Upcoming';
    return 'Past';
  };

  const getBackgroundStyle = () => {
    switch (mode) {
      case 'cosmic':
        return {
          background: 'linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(15, 15, 35, 0.95) 100%)',
          minHeight: '100vh',
        };
      case 'dark':
        return {
          background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 40, 0.95) 100%)',
          minHeight: '100vh',
        };
      default:
        return {
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          minHeight: '100vh',
        };
    }
  };

  // Pagination
  const totalPages = Math.ceil(events.length / eventsPerPage);
  const paginatedEvents = events.slice(
    (page - 1) * eventsPerPage,
    page * eventsPerPage
  );

  if (loading) {
    return (
      <MainLayout>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="60vh"
          sx={getBackgroundStyle()}
        >
          <CircularProgress size={60} />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={getBackgroundStyle()}>
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Fade in timeout={800}>
            <Box sx={{ mb: 4 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <EventAvailable 
                  sx={{ 
                    fontSize: 40, 
                    color: theme.palette.primary.main, 
                    mr: 2 
                  }} 
                />
                <Typography variant="h3" fontWeight="bold">
                  All Events
                </Typography>
              </Box>
              <Typography variant="h6" color="text.secondary" mb={3}>
                Discover and register for exciting events happening around you
              </Typography>
            </Box>
          </Fade>


          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Events Grid */}
          <Grid container spacing={3}>
            {paginatedEvents.map((event, index) => (
              <Grid item xs={12} sm={6} lg={4} key={event.id}>
                <Zoom in timeout={200 + index * 100}>
                  <Card
                    sx={{
                      height: 480,
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
                      },
                    }}
                  >
                    {/* Event Header */}
                    <Box
                      sx={{
                        height: 120,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      <Event sx={{ fontSize: 48, opacity: 0.8 }} />
                      <Chip
                        label={getStatusLabel(event)}
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          bgcolor: getStatusColor(event),
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    <CardContent sx={{ flex: 1, p: 3 }}>
                      <Typography variant="h6" fontWeight="bold" mb={1} noWrap>
                        {event.title}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        mb={2}
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          height: '4.5rem',
                          lineHeight: 1.5,
                        }}
                      >
                        {event.description || 'No description available'}
                      </Typography>

                      {/* Event Details */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(event.startDate), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(event.startDate), 'hh:mm a')}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {event.location}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <People sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {event.attendeeCount || 0} / {event.capacity || event.maxCapacity || 'Unlimited'} attendees
                        </Typography>
                      </Box>

                      {event.category && (
                        <Chip
                          label={event.category.name}
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </CardContent>

                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => handleEventClick(event)}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>

          {/* No Events Message */}
          {events.length === 0 && !loading && (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              minHeight="40vh"
            >
              <EventAvailable sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" mb={1}>
                No events available
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Check back later for new events
              </Typography>
            </Box>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}
        </Box>

        {/* Event Details Modal */}
        <EventDetailsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          event={selectedEvent}
          isUserDashboard={true}
          onRegistrationSuccess={handleRegistrationSuccess}
        />
      </Box>
    </MainLayout>
  );
}