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
  useTheme,
  alpha,
  Fade,
  Zoom,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Container,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Assignment,
  Event,
  LocationOn,
  CalendarToday,
  AccessTime,
  People,
  CheckCircle,
  Cancel,
  Schedule,
  PersonAdd,
  Email,
  Phone,
  Download,
  Print,
  QrCode,
  EventSeat,
  Visibility,
  Close,
  ConfirmationNumber,
  EventAvailable,
  EventBusy,
  History,
} from '@mui/icons-material';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { useThemeMode } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Attendee, Event as EventType } from '../../../lib/dashboard';
import { api } from '../../../lib/api';
import MainLayout from '../../../components/layout/MainLayout';

interface MyTicket extends Attendee {
  event: EventType;
  ticketNumber?: string;
  qrCode?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MyTicketsPage() {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const { user } = useAuth();
  
  const [tickets, setTickets] = useState<MyTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<MyTicket | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (user) {
      fetchMyTickets();
    }
  }, [user]);

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let attendeeData = [];
      
      try {
        // Try the user-specific endpoint first (requires admin or self-access)
        const response = await api.get(`/attendees/user/${user?.id}`);
        attendeeData = response.data;
      } catch (userEndpointError) {
        console.warn('User-specific endpoint failed, trying alternative approach:', userEndpointError);
        
        try {
          // Fallback: Get all attendees and filter for current user
          const allAttendeesResponse = await api.get('/attendees');
          attendeeData = allAttendeesResponse.data.filter((attendee: any) => 
            attendee.user?.id === user?.id || attendee.userId === user?.id
          );
        } catch (allAttendeesError) {
          console.warn('All attendees endpoint failed:', allAttendeesError);
          
          // If both endpoints fail, it might be a permission issue or no registrations exist
          // Show empty state rather than throwing an error
          attendeeData = [];
          
          // Only show error if it's not a 403/404 (which would indicate no permissions/no data)
          if (allAttendeesError.response?.status !== 403 && allAttendeesError.response?.status !== 404) {
            throw allAttendeesError;
          }
        }
      }

      // Fetch all events to get event details
      const eventsResponse = await api.get('/events');
      const events = eventsResponse.data;

      // Combine attendee data with event details
      const myTickets: MyTicket[] = attendeeData.map((attendee: Attendee) => {
        const event = events.find((e: EventType) => e.id === (attendee.event?.id || attendee.eventId));
        if (!event) return null;
        
        return {
          ...attendee,
          event,
          ticketNumber: `TKT-${attendee.id.slice(-8).toUpperCase()}`,
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TKT-${attendee.id}`,
        };
      }).filter(Boolean) as MyTicket[];

      setTickets(myTickets);
    } catch (error) {
      console.error('Error fetching my tickets:', error);
      setError('Failed to load your tickets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { 
          label: 'Confirmed', 
          color: 'success' as const, 
          icon: <CheckCircle />,
          description: 'Your registration is confirmed'
        };
      case 'attended':
        return { 
          label: 'Attended', 
          color: 'info' as const, 
          icon: <EventSeat />,
          description: 'You attended this event'
        };
      case 'cancelled':
        return { 
          label: 'Cancelled', 
          color: 'error' as const, 
          icon: <Cancel />,
          description: 'Registration has been cancelled'
        };
      case 'no_show':
        return { 
          label: 'No Show', 
          color: 'warning' as const, 
          icon: <EventBusy />,
          description: 'Marked as no-show for this event'
        };
      case 'registered':
      default:
        return { 
          label: 'Registered', 
          color: 'primary' as const, 
          icon: <Schedule />,
          description: 'Successfully registered for this event'
        };
    }
  };

  const getEventStatus = (event: EventType) => {
    const now = new Date();
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    
    if (!event.isActive) return { label: 'Cancelled', color: '#9e9e9e', status: 'cancelled' };
    if (isBefore(now, eventStart)) return { label: 'Upcoming', color: '#4caf50', status: 'upcoming' };
    if (isAfter(now, eventStart) && isBefore(now, eventEnd)) return { label: 'Live Now', color: '#ff9800', status: 'live' };
    return { label: 'Completed', color: '#2196f3', status: 'completed' };
  };

  const filterTicketsByTab = (tabIndex: number) => {
    const now = new Date();
    
    switch (tabIndex) {
      case 0: // All tickets
        return tickets;
      case 1: // Upcoming
        return tickets.filter(ticket => {
          const eventStart = new Date(ticket.event.startDate);
          return isBefore(now, eventStart) && ticket.event.isActive;
        });
      case 2: // Past
        return tickets.filter(ticket => {
          const eventEnd = new Date(ticket.event.endDate);
          return isAfter(now, eventEnd) || !ticket.event.isActive;
        });
      default:
        return tickets;
    }
  };

  const handleViewDetails = (ticket: MyTicket) => {
    setSelectedTicket(ticket);
    setDetailsOpen(true);
  };

  const handleCancelTicket = async (ticketId: string) => {
    try {
      await api.put(`/attendees/${ticketId}/status`, { status: 'cancelled' });
      await fetchMyTickets(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling ticket:', error);
      setError('Failed to cancel ticket');
    }
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

  const filteredTickets = filterTicketsByTab(tabValue);

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
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Header */}
          <Fade in timeout={800}>
            <Box sx={{ mb: 4 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Assignment 
                  sx={{ 
                    fontSize: 40, 
                    color: theme.palette.primary.main, 
                    mr: 2 
                  }} 
                />
                <Typography variant="h3" fontWeight="bold">
                  My Tickets
                </Typography>
              </Box>
              <Typography variant="h6" color="text.secondary" mb={3}>
                Manage your event registrations and tickets
              </Typography>
            </Box>
          </Fade>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Tabs */}
          <Paper sx={{ mb: 4, borderRadius: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={(_, newValue) => setTabValue(newValue)}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                }
              }}
            >
              <Tab 
                label={`All Tickets (${tickets.length})`} 
                icon={<ConfirmationNumber />} 
                iconPosition="start"
              />
              <Tab 
                label={`Upcoming (${filterTicketsByTab(1).length})`} 
                icon={<EventAvailable />} 
                iconPosition="start"
              />
              <Tab 
                label={`Past (${filterTicketsByTab(2).length})`} 
                icon={<History />} 
                iconPosition="start"
              />
            </Tabs>
          </Paper>

          {/* Tickets Grid */}
          <TabPanel value={tabValue} index={tabValue}>
            {filteredTickets.length === 0 ? (
              <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                minHeight="40vh"
              >
                <Assignment sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" mb={1}>
                  {tabValue === 1 ? 'No upcoming events' : 
                   tabValue === 2 ? 'No past events' : 'No tickets found'}
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  {tabValue === 0 ? 'You haven\'t registered for any events yet. Visit the Events or Tickets page to get started!' : 
                   tabValue === 1 ? 'No upcoming events found. Register for events to see them here.' :
                   'Your attended events will appear here after you attend them.'}
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredTickets.map((ticket, index) => {
                  const statusInfo = getStatusInfo(ticket.status);
                  const eventStatus = getEventStatus(ticket.event);
                  
                  return (
                    <Grid item xs={12} md={6} lg={4} key={ticket.id}>
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
                          {/* Ticket Header */}
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
                            <ConfirmationNumber sx={{ fontSize: 48, opacity: 0.8 }} />
                            <Chip
                              label={statusInfo.label}
                              color={statusInfo.color}
                              sx={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                fontWeight: 600,
                              }}
                            />
                            <Chip
                              label={eventStatus.label}
                              sx={{
                                position: 'absolute',
                                bottom: 16,
                                left: 16,
                                bgcolor: eventStatus.color,
                                color: 'white',
                                fontWeight: 600,
                              }}
                            />
                          </Box>

                          <CardContent sx={{ flex: 1, p: 3 }}>
                            {/* Event Title */}
                            <Typography variant="h6" fontWeight="bold" mb={1} noWrap>
                              {ticket.event.title}
                            </Typography>
                            
                            {/* Ticket Number */}
                            <Typography variant="body2" color="text.secondary" mb={2}>
                              Ticket: {ticket.ticketNumber}
                            </Typography>

                            {/* Event Details */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {format(new Date(ticket.event.startDate), 'MMM dd, yyyy')}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {format(new Date(ticket.event.startDate), 'hh:mm a')}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {ticket.event.location}
                              </Typography>
                            </Box>

                            {/* Payment Status */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                Payment: {ticket.isPaid ? (
                                  <Chip 
                                    label={`Paid €${Number(ticket.paymentAmount || 0).toFixed(2)}`}
                                    color="success" 
                                    size="small"
                                  />
                                ) : (
                                  <Chip 
                                    label="Pending"
                                    color="warning" 
                                    size="small"
                                  />
                                )}
                              </Typography>
                            </Box>

                            {/* Registration Date */}
                            <Typography variant="caption" color="text.secondary">
                              Registered: {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                            </Typography>
                          </CardContent>

                          <CardActions sx={{ p: 3, pt: 0 }}>
                            <Button
                              fullWidth
                              variant="outlined"
                              startIcon={<Visibility />}
                              onClick={() => handleViewDetails(ticket)}
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
                  );
                })}
              </Grid>
            )}
          </TabPanel>

          {/* Ticket Details Modal */}
          <Dialog
            open={detailsOpen}
            onClose={() => setDetailsOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: { borderRadius: 3 }
            }}
          >
            {selectedTicket && (
              <>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h5" fontWeight="bold">
                    Ticket Details
                  </Typography>
                  <IconButton onClick={() => setDetailsOpen(false)}>
                    <Close />
                  </IconButton>
                </DialogTitle>
                
                <DialogContent>
                  <Grid container spacing={3}>
                    {/* Left Column - Event Info */}
                    <Grid item xs={12} md={8}>
                      <Box mb={3}>
                        <Typography variant="h6" fontWeight="bold" mb={1}>
                          {selectedTicket.event.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" mb={2}>
                          {selectedTicket.event.description}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="h6" fontWeight="bold" mb={2}>
                        Event Information
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CalendarToday color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Date"
                            secondary={format(new Date(selectedTicket.event.startDate), 'EEEE, MMMM dd, yyyy')}
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon>
                            <AccessTime color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Time"
                            secondary={`${format(new Date(selectedTicket.event.startDate), 'hh:mm a')} - ${format(new Date(selectedTicket.event.endDate), 'hh:mm a')}`}
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon>
                            <LocationOn color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Location"
                            secondary={selectedTicket.event.location}
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon>
                            <People color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Capacity"
                            secondary={`${selectedTicket.event.attendeeCount || 0} / ${selectedTicket.event.capacity || 'Unlimited'} attendees`}
                          />
                        </ListItem>
                      </List>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="h6" fontWeight="bold" mb={2}>
                        Registration Details
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <ConfirmationNumber color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Ticket Number"
                            secondary={selectedTicket.ticketNumber}
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon>
                            {getStatusInfo(selectedTicket.status).icon}
                          </ListItemIcon>
                          <ListItemText
                            primary="Status"
                            secondary={getStatusInfo(selectedTicket.status).description}
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon>
                            <CalendarToday color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Registration Date"
                            secondary={format(new Date(selectedTicket.createdAt), 'MMMM dd, yyyy - hh:mm a')}
                          />
                        </ListItem>

                        {selectedTicket.notes && (
                          <ListItem>
                            <ListItemIcon>
                              <Assignment color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Notes"
                              secondary={selectedTicket.notes}
                            />
                          </ListItem>
                        )}
                      </List>
                    </Grid>

                    {/* Right Column - QR Code & Actions */}
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                          Digital Ticket
                        </Typography>
                        
                        <Box
                          component="img"
                          src={selectedTicket.qrCode}
                          alt="QR Code"
                          sx={{
                            width: 200,
                            height: 200,
                            border: '2px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            mb: 2,
                          }}
                        />
                        
                        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                          Show this QR code at the event entrance
                        </Typography>

                        <Box display="flex" flexDirection="column" gap={1}>
                          <Button
                            variant="outlined"
                            startIcon={<Download />}
                            fullWidth
                            sx={{ textTransform: 'none' }}
                          >
                            Download Ticket
                          </Button>
                          
                          <Button
                            variant="outlined"
                            startIcon={<Print />}
                            fullWidth
                            sx={{ textTransform: 'none' }}
                          >
                            Print Ticket
                          </Button>
                          
                          <Button
                            variant="outlined"
                            startIcon={<Email />}
                            fullWidth
                            sx={{ textTransform: 'none' }}
                          >
                            Email Ticket
                          </Button>
                        </Box>

                        {/* Cancel button for upcoming events */}
                        {getEventStatus(selectedTicket.event).status === 'upcoming' && 
                         selectedTicket.status !== 'cancelled' && (
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Cancel />}
                            fullWidth
                            sx={{ mt: 2, textTransform: 'none' }}
                            onClick={() => handleCancelTicket(selectedTicket.id)}
                          >
                            Cancel Registration
                          </Button>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                </DialogContent>
              </>
            )}
          </Dialog>
        </Container>
      </Box>
    </MainLayout>
  );
}