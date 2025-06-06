'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Container,
  Paper,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from '@mui/material';
import {
  Event,
  Save,
  Preview,
  LocationOn,
  CalendarToday,
  AccessTime,
  People,
  Euro,
  Category,
  Description,
  Image,
  Add,
  Delete,
  Info,
  CheckCircle,
  Warning,
  Close,
  Visibility,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addHours, isAfter } from 'date-fns';
import { useThemeMode } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Category as CategoryType, Venue } from '../../../lib/dashboard';
import { api } from '../../../lib/api';
import MainLayout from '../../../components/layout/MainLayout';
import { useRouter } from 'next/navigation';

interface EventFormData {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  price: number;
  capacity: number;
  isActive: boolean;
  organizerId: string;
  venueId: string;
  categoryId: string;
  imageUrl?: string;
  tags: string[];
}

interface TicketType {
  name: string;
  price: number;
  quantity: number;
  description?: string;
}

const steps = [
  'Basic Information',
  'Date & Location',
  'Tickets & Pricing',
  'Review & Publish'
];

export default function CreateEventPage() {
  const { mode } = useThemeMode();
  const { user } = useAuth();
  const router = useRouter();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    location: '',
    startDate: addHours(new Date(), 24),
    endDate: addHours(new Date(), 27),
    price: 0,
    capacity: 100,
    isActive: true,
    organizerId: user?.id || '',
    venueId: '',
    categoryId: '',
    imageUrl: '',
    tags: [],
  });

  const [tickets, setTickets] = useState<TicketType[]>([
    { name: 'General Admission', price: 0, quantity: 100, description: 'Standard event access' }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  useEffect(() => {
    fetchCategories();
    fetchVenues();
  }, []);

  useEffect(() => {
    // Auto-adjust end date when start date changes
    if (isAfter(formData.startDate, formData.endDate)) {
      setFormData(prev => ({
        ...prev,
        endDate: addHours(prev.startDate, 3)
      }));
    }
  }, [formData.startDate]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchVenues = async () => {
    try {
      // If venues endpoint doesn't exist, create mock data
      try {
        const response = await api.get('/venues');
        setVenues(response.data);
      } catch {
        // Mock venues if endpoint doesn't exist
        setVenues([
          { id: '1', name: 'Main Conference Hall', address: '123 Business St, Downtown', capacity: 500, status: 'active', createdAt: '', updatedAt: '' },
          { id: '2', name: 'Community Center', address: '456 Community Ave, Midtown', capacity: 200, status: 'active', createdAt: '', updatedAt: '' },
          { id: '3', name: 'Outdoor Pavilion', address: '789 Park Rd, Uptown', capacity: 1000, status: 'active', createdAt: '', updatedAt: '' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    }
  };

  const handleInputChange = (field: keyof EventFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target?.value ?? event;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateChange = (field: 'startDate' | 'endDate') => (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        [field]: date,
      }));
    }
  };

  const addTicketType = () => {
    setTickets(prev => [...prev, {
      name: `Ticket ${prev.length + 1}`,
      price: 0,
      quantity: 50,
      description: ''
    }]);
  };

  const updateTicket = (index: number, field: keyof TicketType, value: string | number) => {
    setTickets(prev => prev.map((ticket, i) => 
      i === index ? { ...ticket, [field]: value } : ticket
    ));
  };

  const removeTicket = (index: number) => {
    if (tickets.length > 1) {
      setTickets(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 0:
        if (!formData.title.trim()) newErrors.title = 'Event title is required';
        if (!formData.description.trim()) newErrors.description = 'Event description is required';
        if (!formData.categoryId) newErrors.categoryId = 'Category is required';
        break;
      case 1:
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!isAfter(formData.endDate, formData.startDate)) {
          newErrors.endDate = 'End date must be after start date';
        }
        if (formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';
        break;
      case 2:
        tickets.forEach((ticket, index) => {
          if (!ticket.name.trim()) newErrors[`ticket_${index}_name`] = 'Ticket name is required';
          if (ticket.quantity < 1) newErrors[`ticket_${index}_quantity`] = 'Quantity must be at least 1';
          if (ticket.price < 0) newErrors[`ticket_${index}_price`] = 'Price cannot be negative';
        });
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;
    
    setLoading(true);
    try {
      // Create the event
      const eventData = {
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
      };

      const eventResponse = await api.post('/events', eventData);
      const createdEvent = eventResponse.data;

      // Create tickets for the event
      for (const ticket of tickets) {
        await api.post('/tickets', {
          ...ticket,
          eventId: createdEvent.id,
        });
      }

      showSnackbar('Event created successfully!', 'success');
      
      // Redirect to events page after a delay
      setTimeout(() => {
        router.push('/events');
      }, 2000);

    } catch (error: any) {
      console.error('Error creating event:', error);
      showSnackbar(
        error.response?.data?.message || 'Failed to create event',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
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

  // Check if user is admin
  const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('administrator');
  
  if (!isAdmin) {
    return (
      <MainLayout>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="error">
            You do not have permission to create events. Admin access required.
          </Alert>
        </Container>
      </MainLayout>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MainLayout>
        <Box sx={getBackgroundStyle()}>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                  <Event sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h3" fontWeight="bold">
                    Create Event
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<Preview />}
                  onClick={() => setPreviewOpen(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Preview
                </Button>
              </Box>
              <Typography variant="h6" color="text.secondary">
                Create and manage your event details
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {/* Stepper Sidebar */}
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Stepper activeStep={activeStep} orientation="vertical">
                    {steps.map((label, index) => (
                      <Step key={label}>
                        <StepLabel
                          onClick={() => {
                            if (index < activeStep || validateStep(activeStep)) {
                              setActiveStep(index);
                            }
                          }}
                          sx={{ cursor: 'pointer' }}
                        >
                          {label}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Paper>
              </Grid>

              {/* Main Form */}
              <Grid item xs={12} md={9}>
                <Paper sx={{ p: 4, borderRadius: 3 }}>
                  {/* Step 0: Basic Information */}
                  {activeStep === 0 && (
                    <Box>
                      <Typography variant="h5" fontWeight="bold" mb={3}>
                        Basic Information
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Event Title"
                            value={formData.title}
                            onChange={handleInputChange('title')}
                            error={!!errors.title}
                            helperText={errors.title}
                            placeholder="Enter a catchy event title"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Event />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Event Description"
                            value={formData.description}
                            onChange={handleInputChange('description')}
                            error={!!errors.description}
                            helperText={errors.description}
                            placeholder="Describe your event in detail..."
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Description />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth error={!!errors.categoryId}>
                            <InputLabel>Category</InputLabel>
                            <Select
                              value={formData.categoryId}
                              label="Category"
                              onChange={handleInputChange('categoryId')}
                            >
                              {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                  {category.name}
                                </MenuItem>
                              ))}
                            </Select>
                            {errors.categoryId && (
                              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                                {errors.categoryId}
                              </Typography>
                            )}
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Event Image URL (Optional)"
                            value={formData.imageUrl}
                            onChange={handleInputChange('imageUrl')}
                            placeholder="https://example.com/image.jpg"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Image />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Autocomplete
                            multiple
                            options={['Technology', 'Business', 'Health', 'Education', 'Entertainment', 'Sports']}
                            value={formData.tags}
                            onChange={(_, newValue) => setFormData(prev => ({ ...prev, tags: newValue }))}
                            renderTags={(value, getTagProps) =>
                              value.map((option, index) => (
                                <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />
                              ))
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Tags (Optional)"
                                placeholder="Add relevant tags"
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* Step 1: Date & Location */}
                  {activeStep === 1 && (
                    <Box>
                      <Typography variant="h5" fontWeight="bold" mb={3}>
                        Date & Location
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <DateTimePicker
                            label="Start Date & Time"
                            value={formData.startDate}
                            onChange={handleDateChange('startDate')}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: !!errors.startDate,
                                helperText: errors.startDate,
                              },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <DateTimePicker
                            label="End Date & Time"
                            value={formData.endDate}
                            onChange={handleDateChange('endDate')}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: !!errors.endDate,
                                helperText: errors.endDate,
                              },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Event Location"
                            value={formData.location}
                            onChange={handleInputChange('location')}
                            error={!!errors.location}
                            helperText={errors.location}
                            placeholder="Enter event address or venue"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LocationOn />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <FormControl fullWidth>
                            <InputLabel>Venue (Optional)</InputLabel>
                            <Select
                              value={formData.venueId}
                              label="Venue (Optional)"
                              onChange={handleInputChange('venueId')}
                            >
                              <MenuItem value="">
                                <em>No specific venue</em>
                              </MenuItem>
                              {venues.map((venue) => (
                                <MenuItem key={venue.id} value={venue.id}>
                                  {venue.name} - {venue.address}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Event Capacity"
                            value={formData.capacity}
                            onChange={handleInputChange('capacity')}
                            error={!!errors.capacity}
                            helperText={errors.capacity}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <People />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={formData.isActive}
                                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                              />
                            }
                            label="Event Active"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* Step 2: Tickets & Pricing */}
                  {activeStep === 2 && (
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5" fontWeight="bold">
                          Tickets & Pricing
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<Add />}
                          onClick={addTicketType}
                          sx={{ textTransform: 'none' }}
                        >
                          Add Ticket Type
                        </Button>
                      </Box>
                      
                      <Grid container spacing={3}>
                        {tickets.map((ticket, index) => (
                          <Grid item xs={12} key={index}>
                            <Card sx={{ p: 3, borderRadius: 2 }}>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" fontWeight="bold">
                                  Ticket Type #{index + 1}
                                </Typography>
                                {tickets.length > 1 && (
                                  <IconButton
                                    color="error"
                                    onClick={() => removeTicket(index)}
                                  >
                                    <Delete />
                                  </IconButton>
                                )}
                              </Box>
                              
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Ticket Name"
                                    value={ticket.name}
                                    onChange={(e) => updateTicket(index, 'name', e.target.value)}
                                    error={!!errors[`ticket_${index}_name`]}
                                    helperText={errors[`ticket_${index}_name`]}
                                  />
                                </Grid>
                                
                                <Grid item xs={6} sm={3}>
                                  <TextField
                                    fullWidth
                                    type="number"
                                    label="Price (€)"
                                    value={ticket.price}
                                    onChange={(e) => updateTicket(index, 'price', Number(e.target.value))}
                                    error={!!errors[`ticket_${index}_price`]}
                                    helperText={errors[`ticket_${index}_price`]}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <Euro />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                </Grid>
                                
                                <Grid item xs={6} sm={3}>
                                  <TextField
                                    fullWidth
                                    type="number"
                                    label="Quantity"
                                    value={ticket.quantity}
                                    onChange={(e) => updateTicket(index, 'quantity', Number(e.target.value))}
                                    error={!!errors[`ticket_${index}_quantity`]}
                                    helperText={errors[`ticket_${index}_quantity`]}
                                  />
                                </Grid>
                                
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    label="Description (Optional)"
                                    value={ticket.description}
                                    onChange={(e) => updateTicket(index, 'description', e.target.value)}
                                    placeholder="Describe what's included with this ticket"
                                  />
                                </Grid>
                              </Grid>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {/* Step 3: Review & Publish */}
                  {activeStep === 3 && (
                    <Box>
                      <Typography variant="h5" fontWeight="bold" mb={3}>
                        Review & Publish
                      </Typography>
                      
                      <Alert severity="info" sx={{ mb: 3 }}>
                        Please review all the information before publishing your event.
                      </Alert>

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" fontWeight="bold" mb={2}>
                            Event Details
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Title:</Typography>
                            <Typography variant="body1">{formData.title}</Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Description:</Typography>
                            <Typography variant="body2">{formData.description}</Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Location:</Typography>
                            <Typography variant="body1">{formData.location}</Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Date & Time:</Typography>
                            <Typography variant="body1">
                              {format(formData.startDate, 'MMMM dd, yyyy - hh:mm a')} to{' '}
                              {format(formData.endDate, 'MMMM dd, yyyy - hh:mm a')}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Capacity:</Typography>
                            <Typography variant="body1">{formData.capacity} attendees</Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" fontWeight="bold" mb={2}>
                            Ticket Information
                          </Typography>
                          {tickets.map((ticket, index) => (
                            <Card key={index} sx={{ mb: 2, p: 2 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {ticket.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Price: €{ticket.price.toFixed(2)} | Quantity: {ticket.quantity}
                              </Typography>
                              {ticket.description && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  {ticket.description}
                                </Typography>
                              )}
                            </Card>
                          ))}
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* Navigation Buttons */}
                  <Box display="flex" justifyContent="space-between" mt={4}>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      sx={{ textTransform: 'none' }}
                    >
                      Back
                    </Button>
                    
                    <Box>
                      {activeStep === steps.length - 1 ? (
                        <Button
                          variant="contained"
                          onClick={handleSubmit}
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                          sx={{ textTransform: 'none', px: 3 }}
                        >
                          {loading ? 'Creating...' : 'Create Event'}
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{ textTransform: 'none' }}
                        >
                          Next
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Preview Modal */}
            <Dialog
              open={previewOpen}
              onClose={() => setPreviewOpen(false)}
              maxWidth="md"
              fullWidth
              PaperProps={{
                sx: { borderRadius: 3 }
              }}
            >
              <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h5" fontWeight="bold">
                  Event Preview
                </Typography>
                <IconButton onClick={() => setPreviewOpen(false)}>
                  <Close />
                </IconButton>
              </DialogTitle>
              
              <DialogContent>
                <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  {formData.imageUrl && (
                    <Box
                      component="img"
                      src={formData.imageUrl}
                      alt="Event"
                      sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                    />
                  )}
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h4" fontWeight="bold" mb={2}>
                      {formData.title || 'Event Title'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mb={3}>
                      {formData.description || 'Event description will appear here...'}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2">
                            {format(formData.startDate, 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                      </Grid>
                    {/* Category Preview */}
                    {formData.categoryId && (
                      <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
                        <Category sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2">
                          {categories.find(c => c.id === formData.categoryId)?.name || 'Category'}
                        </Typography>
                      </Box>
                    )}
                    {/* Tickets Preview */}
                    {tickets.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" fontWeight="bold" mb={1}>
                          Tickets
                        </Typography>
                        {tickets.map((ticket, index) => (
                          <Box key={index} sx={{ mb: 1 }}>
                            <Typography variant="body2">
                              {ticket.name}: €{ticket.price.toFixed(2)} x {ticket.quantity}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                    {/* Tags Preview */}
                    {formData.tags && formData.tags.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" fontWeight="bold" mb={1}>
                          Tags
                        </Typography>
                        {formData.tags.map((tag, idx) => (
                          <Chip key={idx} label={tag} sx={{ mr: 1, mt: 0.5 }} />
                        ))}
                      </Box>
                    )}
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2">
                            {format(formData.startDate, 'hh:mm a')}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2">
                            {formData.location || 'Event location'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </DialogContent>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
              <Alert
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                severity={snackbar.severity}
                sx={{ width: '100%' }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Container>
        </Box>
      </MainLayout>
    </LocalizationProvider>
  );
}