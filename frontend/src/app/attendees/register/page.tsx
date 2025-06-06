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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel,
  Paper,
  Divider,
  useTheme,
  alpha,
  Fade,
  Zoom,
  LinearProgress,
} from '@mui/material';
import {
  PersonAdd,
  Event,
  LocationOn,
  CalendarToday,
  AccessTime,
  CheckCircle,
  EventAvailable,
  People,
  AttachMoney,
  Info,
  Payment,
  ConfirmationNumber,
} from '@mui/icons-material';
import { format, isAfter } from 'date-fns';
import { useThemeMode } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Event as EventType, dashboardApi } from '../../../lib/dashboard';
import MainLayout from '../../../components/layout/MainLayout';

interface RegistrationForm {
  eventId: string;
  notes: string;
  agreeToTerms: boolean;
  emergencyContact: string;
  dietaryRestrictions: string;
}

export default function RegisterPage() {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const { user } = useAuth();
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<RegistrationForm>({
    eventId: '',
    notes: '',
    agreeToTerms: false,
    emergencyContact: '',
    dietaryRestrictions: '',
  });

  const steps = ['Select Event', 'Registration Details', 'Confirmation'];

  useEffect(() => {
    fetchAvailableEvents();
  }, []);

  const fetchAvailableEvents = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getAllEvents();
      // Filter to only show upcoming, active events
      const availableEvents = data.filter(event => {
        const now = new Date();
        const eventStart = new Date(event.startDate);
        return event.isActive && isAfter(eventStart, now);
      });
      setEvents(availableEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load available events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelect = (event: EventType) => {
    setSelectedEvent(event);
    setForm(prev => ({ ...prev, eventId: event.id }));
    setActiveStep(1);
  };

  const handleFormChange = (field: keyof RegistrationForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (activeStep === 1 && form.agreeToTerms) {
      setActiveStep(2);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmitRegistration = async () => {
    if (!user?.id || !selectedEvent?.id) return;

    try {
      setRegistering(true);
      setError(null);
      
      await dashboardApi.registerForEvent(selectedEvent.id, user.id);
      
      setSuccess(`Successfully registered for ${selectedEvent.title}!`);
      setActiveStep(0);
      setSelectedEvent(null);
      setForm({
        eventId: '',
        notes: '',
        agreeToTerms: false,
        emergencyContact: '',
        dietaryRestrictions: '',
      });
      
      // Refresh events to update capacity
      await fetchAvailableEvents();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const getStatusColor = (event: EventType) => {
    const capacity = event.capacity || event.maxCapacity || 0;
    const attendeeCount = event.attendeeCount || 0;
    const percentFull = capacity > 0 ? (attendeeCount / capacity) * 100 : 0;
    
    if (percentFull >= 90) return '#f44336';
    if (percentFull >= 70) return '#ff9800';
    return '#4caf50';
  };

  const getAvailabilityText = (event: EventType) => {
    const capacity = event.capacity || event.maxCapacity || 0;
    const attendeeCount = event.attendeeCount || 0;
    
    if (capacity === 0) return 'Unlimited spots';
    const spotsLeft = capacity - attendeeCount;
    if (spotsLeft <= 0) return 'Event Full';
    if (spotsLeft <= 5) return `Only ${spotsLeft} spots left`;
    return `${spotsLeft} spots available`;
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
                <PersonAdd 
                  sx={{ 
                    fontSize: 40, 
                    color: theme.palette.primary.main, 
                    mr: 2 
                  }} 
                />
                <Typography variant="h3" fontWeight="bold">
                  Event Registration
                </Typography>
              </Box>
              <Typography variant="h6" color="text.secondary" mb={3}>
                Register for upcoming events and join the community
              </Typography>
            </Box>
          </Fade>

          {/* Success Message */}
          {success && (
            <Fade in timeout={500}>
              <Alert 
                severity="success" 
                sx={{ mb: 4 }}
                onClose={() => setSuccess(null)}
              >
                {success}
              </Alert>
            </Fade>
          )}

          {/* Error Message */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 4 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Main Registration Card */}
          <Card sx={{ maxWidth: 1200, mx: 'auto', borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              {/* Stepper */}
              <Stepper activeStep={activeStep} orientation="vertical">
                {/* Step 1: Select Event */}
                <Step>
                  <StepLabel>Select Event</StepLabel>
                  <StepContent>
                    <Typography variant="body1" color="text.secondary" mb={3}>
                      Choose an event you would like to register for
                    </Typography>
                    
                    {events.length === 0 ? (
                      <Box 
                        display="flex" 
                        flexDirection="column" 
                        alignItems="center" 
                        py={4}
                      >
                        <EventAvailable sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" mb={1}>
                          No upcoming events available
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Check back later for new events to register for
                        </Typography>
                      </Box>
                    ) : (
                      <Grid container spacing={3}>
                        {events.map((event) => {
                          const capacity = event.capacity || event.maxCapacity || 0;
                          const attendeeCount = event.attendeeCount || 0;
                          const isFull = capacity > 0 && attendeeCount >= capacity;
                          
                          return (
                            <Grid item xs={12} md={6} key={event.id}>
                              <Card
                                sx={{
                                  cursor: isFull ? 'not-allowed' : 'pointer',
                                  opacity: isFull ? 0.6 : 1,
                                  transition: 'all 0.3s ease',
                                  border: selectedEvent?.id === event.id 
                                    ? `2px solid ${theme.palette.primary.main}`
                                    : '2px solid transparent',
                                  '&:hover': isFull ? {} : {
                                    transform: 'translateY(-4px)',
                                    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                                  },
                                }}
                                onClick={() => !isFull && handleEventSelect(event)}
                              >
                                {/* Event Header */}
                                <Box
                                  sx={{
                                    height: 100,
                                    background: `linear-gradient(45deg, ${getStatusColor(event)}, ${alpha(getStatusColor(event), 0.7)})`,
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                  }}
                                >
                                  <Event sx={{ fontSize: 40 }} />
                                  <Chip
                                    label={getAvailabilityText(event)}
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
                                </Box>

                                <CardContent sx={{ p: 3 }}>
                                  <Typography variant="h6" fontWeight="bold" mb={1}>
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
                                    <Typography variant="body2" color="text.secondary">
                                      {event.location}
                                    </Typography>
                                  </Box>

                                  {capacity > 0 && (
                                    <LinearProgress
                                      variant="determinate"
                                      value={Math.min((attendeeCount / capacity) * 100, 100)}
                                      sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: alpha(getStatusColor(event), 0.2),
                                        '& .MuiLinearProgress-bar': {
                                          bgcolor: getStatusColor(event),
                                          borderRadius: 3,
                                        },
                                      }}
                                    />
                                  )}

                                  {event.category && (
                                    <Chip
                                      label={event.category.name}
                                      size="small"
                                      sx={{
                                        mt: 2,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: theme.palette.primary.main,
                                        fontWeight: 600,
                                      }}
                                    />
                                  )}
                                </CardContent>
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    )}
                  </StepContent>
                </Step>

                {/* Step 2: Registration Details */}
                <Step>
                  <StepLabel>Registration Details</StepLabel>
                  <StepContent>
                    <Typography variant="body1" color="text.secondary" mb={3}>
                      Please provide additional information for your registration
                    </Typography>

                    {selectedEvent && (
                      <Paper sx={{ p: 3, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                          Selected Event: {selectedEvent.title}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={3}>
                          <Box display="flex" alignItems="center">
                            <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {format(new Date(selectedEvent.startDate), 'MMM dd, yyyy')}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center">
                            <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {format(new Date(selectedEvent.startDate), 'hh:mm a')}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    )}

                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Emergency Contact"
                          value={form.emergencyContact}
                          onChange={(e) => handleFormChange('emergencyContact', e.target.value)}
                          placeholder="Name and phone number"
                          variant="outlined"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Dietary Restrictions"
                          value={form.dietaryRestrictions}
                          onChange={(e) => handleFormChange('dietaryRestrictions', e.target.value)}
                          placeholder="Any dietary restrictions or allergies"
                          variant="outlined"
                          multiline
                          rows={2}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Additional Notes"
                          value={form.notes}
                          onChange={(e) => handleFormChange('notes', e.target.value)}
                          placeholder="Any additional information or special requests"
                          variant="outlined"
                          multiline
                          rows={3}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={form.agreeToTerms}
                              onChange={(e) => handleFormChange('agreeToTerms', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="I agree to the terms and conditions and event guidelines"
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ mb: 2, mt: 3 }}>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={!form.agreeToTerms}
                        sx={{ mr: 1 }}
                      >
                        Continue
                      </Button>
                      <Button onClick={handleBack}>
                        Back
                      </Button>
                    </Box>
                  </StepContent>
                </Step>

                {/* Step 3: Confirmation */}
                <Step>
                  <StepLabel>Confirmation</StepLabel>
                  <StepContent>
                    <Typography variant="body1" color="text.secondary" mb={3}>
                      Please review your registration details and confirm
                    </Typography>

                    {selectedEvent && (
                      <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" mb={3}>
                          Registration Summary
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">Event</Typography>
                            <Typography variant="body1" fontWeight="bold">{selectedEvent.title}</Typography>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">Date & Time</Typography>
                            <Typography variant="body1">
                              {format(new Date(selectedEvent.startDate), 'MMM dd, yyyy')} at {format(new Date(selectedEvent.startDate), 'hh:mm a')}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                            <Typography variant="body1">{selectedEvent.location}</Typography>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">Registrant</Typography>
                            <Typography variant="body1">{user?.firstName} {user?.lastName}</Typography>
                          </Grid>
                          
                          {form.emergencyContact && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="text.secondary">Emergency Contact</Typography>
                              <Typography variant="body1">{form.emergencyContact}</Typography>
                            </Grid>
                          )}
                          
                          {form.dietaryRestrictions && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="text.secondary">Dietary Restrictions</Typography>
                              <Typography variant="body1">{form.dietaryRestrictions}</Typography>
                            </Grid>
                          )}
                          
                          {form.notes && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="text.secondary">Additional Notes</Typography>
                              <Typography variant="body1">{form.notes}</Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>
                    )}

                    <Box sx={{ mb: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleSubmitRegistration}
                        disabled={registering}
                        startIcon={registering ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                        sx={{ mr: 1 }}
                      >
                        {registering ? 'Registering...' : 'Confirm Registration'}
                      </Button>
                      <Button onClick={handleBack} disabled={registering}>
                        Back
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
              </Stepper>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </MainLayout>
  );
}