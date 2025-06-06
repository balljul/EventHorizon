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
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Pagination,
  useTheme,
  alpha,
  Fade,
  Zoom,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Search,
  FilterList,
  Event,
  LocationOn,
  Schedule,
  People,
  AttachMoney,
  Visibility,
  PersonAdd,
  Category,
  CalendarToday,
  AccessTime,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  EventNote,
  ConfirmationNumber,
} from '@mui/icons-material';
import { format, isAfter, isBefore } from 'date-fns';
import { useThemeMode } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Event as EventType, Attendee, dashboardApi } from '../../../lib/dashboard';
import EventDetailsModal from '../../../components/dashboard/EventDetailsModal';
import MainLayout from '../../../components/layout/MainLayout';

export default function MyEventsPage() {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const { user } = useAuth();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [filteredAttendees, setFilteredAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const attendeesPerPage = 6;

  useEffect(() => {
    if (user?.id) {
      fetchMyEvents();
    }
  }, [user]);

  useEffect(() => {
    filterAttendees();
  }, [attendees, searchTerm, statusFilter, timeFilter]);

  const fetchMyEvents = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      // Try to get user's attendees using the dashboard API
      const userData = await dashboardApi.getUserDashboardData(user.id);
      setAttendees(userData.attendingEvents);
    } catch (error) {
      console.error('Error fetching my events:', error);
      setError('Failed to load your events');
    } finally {
      setLoading(false);
    }
  };

  const filterAttendees = () => {
    let filtered = attendees;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(attendee =>
        attendee.event?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.event?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.event?.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(attendee => attendee.status === statusFilter);
    }

    // Time filter
    if (timeFilter !== 'all') {
      filtered = filtered.filter(attendee => {
        if (!attendee.event) return false;
        const now = new Date();
        const eventStart = new Date(attendee.event.startDate);
        
        switch (timeFilter) {
          case 'upcoming':
            return isAfter(eventStart, now);
          case 'past':
            return isBefore(eventStart, now);
          case 'today':
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return eventStart >= today && eventStart < tomorrow;
          default:
            return true;
        }
      });
    }

    setFilteredAttendees(filtered);
    setPage(1); // Reset to first page when filters change
  };

  const handleEventClick = (event: EventType) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleRegistrationSuccess = () => {
    // Refresh my events to update status
    fetchMyEvents();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return '#2196f3';
      case 'confirmed': return '#4caf50';
      case 'attended': return '#8bc34a';
      case 'cancelled': return '#f44336';
      case 'no_show': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'registered': return <HourglassEmpty />;
      case 'confirmed': return <CheckCircle />;
      case 'attended': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      case 'no_show': return <Cancel />;
      default: return <HourglassEmpty />;
    }
  };

  const getEventTimeStatus = (event: EventType) => {
    const now = new Date();
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    
    if (isBefore(eventEnd, now)) return 'Past';
    if (isAfter(eventStart, now)) return 'Upcoming';
    return 'Ongoing';
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
  const totalPages = Math.ceil(filteredAttendees.length / attendeesPerPage);
  const paginatedAttendees = filteredAttendees.slice(
    (page - 1) * attendeesPerPage,
    page * attendeesPerPage
  );

  // Stats
  const stats = {
    total: attendees.length,
    upcoming: attendees.filter(a => a.event && isAfter(new Date(a.event.startDate), new Date())).length,
    attended: attendees.filter(a => a.status === 'attended').length,
    registered: attendees.filter(a => a.status === 'registered').length,
    confirmed: attendees.filter(a => a.status === 'confirmed').length,
  };

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
                <EventNote 
                  sx={{ 
                    fontSize: 40, 
                    color: theme.palette.primary.main, 
                    mr: 2 
                  }} 
                />
                <Typography variant="h3" fontWeight="bold">
                  My Events
                </Typography>
              </Box>
              <Typography variant="h6" color="text.secondary" mb={3}>
                Manage your event registrations and track your attendance
              </Typography>
            </Box>
          </Fade>

          {/* Stats Cards */}
          <Fade in timeout={1000}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Events
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {stats.upcoming}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {stats.registered}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Registered
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {stats.confirmed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Confirmed
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" fontWeight="bold" color="success.dark">
                    {stats.attended}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Attended
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Fade>

          {/* Filters */}
          <Fade in timeout={1200}>
            <Card sx={{ mb: 4, p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search my events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Registration Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Registration Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Statuses</MenuItem>
                      <MenuItem value="registered">Registered</MenuItem>
                      <MenuItem value="confirmed">Confirmed</MenuItem>
                      <MenuItem value="attended">Attended</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                      <MenuItem value="no_show">No Show</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Time Period</InputLabel>
                    <Select
                      value={timeFilter}
                      label="Time Period"
                      onChange={(e) => setTimeFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Time</MenuItem>
                      <MenuItem value="upcoming">Upcoming</MenuItem>
                      <MenuItem value="today">Today</MenuItem>
                      <MenuItem value="past">Past</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FilterList />}
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setTimeFilter('all');
                    }}
                  >
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Fade>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Events Grid */}
          <Grid container spacing={3}>
            {paginatedAttendees.map((attendee, index) => {
              const event = attendee.event;
              if (!event) return null;

              return (
                <Grid item xs={12} sm={6} lg={4} key={attendee.id}>
                  <Zoom in timeout={200 + index * 100}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        border: `2px solid ${getStatusColor(attendee.status)}20`,
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 12px 40px ${alpha(getStatusColor(attendee.status), 0.3)}`,
                          borderColor: getStatusColor(attendee.status),
                        },
                      }}
                    >
                      {/* Event Header */}
                      <Box
                        sx={{
                          height: 120,
                          background: `linear-gradient(45deg, ${getStatusColor(attendee.status)}, ${alpha(getStatusColor(attendee.status), 0.7)})`,
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        {getStatusIcon(attendee.status)}
                        <Chip
                          label={attendee.status.replace('_', ' ').toUpperCase()}
                          sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            fontWeight: 600,
                            backdropFilter: 'blur(10px)',
                          }}
                        />
                        <Chip
                          label={getEventTimeStatus(event)}
                          sx={{
                            position: 'absolute',
                            bottom: 16,
                            left: 16,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            fontWeight: 600,
                            backdropFilter: 'blur(10px)',
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
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
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

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {event.location}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Registration Details */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Registered: {format(new Date(attendee.createdAt), 'MMM dd, yyyy')}
                          </Typography>
                          {attendee.paymentAmount && attendee.paymentAmount > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <AttachMoney sx={{ fontSize: 16, mr: 1, color: 'success.main' }} />
                              <Typography variant="body2" color="success.main" fontWeight={600}>
                                ${attendee.paymentAmount.toFixed(2)} {attendee.isPaid ? '(Paid)' : '(Pending)'}
                              </Typography>
                            </Box>
                          )}
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
                            borderColor: getStatusColor(attendee.status),
                            color: getStatusColor(attendee.status),
                            '&:hover': {
                              borderColor: getStatusColor(attendee.status),
                              bgcolor: alpha(getStatusColor(attendee.status), 0.1),
                            },
                          }}
                        >
                          View Event
                        </Button>
                      </CardActions>
                    </Card>
                  </Zoom>
                </Grid>
              );
            })}
          </Grid>

          {/* No Events Message */}
          {filteredAttendees.length === 0 && !loading && (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              minHeight="40vh"
            >
              <EventNote sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" mb={1}>
                No events found
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                {attendees.length === 0 
                  ? "You haven't registered for any events yet. Check out our All Events page to discover exciting events!"
                  : "Try adjusting your filters to see more events"
                }
              </Typography>
              {attendees.length === 0 && (
                <Button
                  variant="contained"
                  sx={{ mt: 3 }}
                  onClick={() => window.location.href = '/events'}
                >
                  Browse Events
                </Button>
              )}
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
          isUserDashboard={false} // Don't show registration button since user is already registered
          onRegistrationSuccess={handleRegistrationSuccess}
        />
      </Box>
    </MainLayout>
  );
}