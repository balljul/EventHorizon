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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  ConfirmationNumber,
  Search,
  FilterList,
  Event,
  LocationOn,
  CalendarToday,
  AccessTime,
  People,
  Euro,
  ShoppingCart,
  Add,
  Remove,
  Payment,
  CheckCircle,
  LocalOffer,
  Category,
  SortByAlpha,
  TrendingUp,
  Close,
  Inventory,
} from '@mui/icons-material';
import { format, isAfter, isBefore } from 'date-fns';
import { useThemeMode } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Event as EventType, Ticket, dashboardApi } from '../../lib/dashboard';
import { api } from '../../lib/api';
import MainLayout from '../../components/layout/MainLayout';

interface TicketWithEvent extends Ticket {
  event: EventType;
}

interface CartItem {
  ticket: TicketWithEvent;
  quantity: number;
}

interface PurchaseModalState {
  open: boolean;
  tickets: CartItem[];
  step: number;
  loading: boolean;
  success: boolean;
}

export default function TicketsPage() {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const { user } = useAuth();
  
  const [tickets, setTickets] = useState<TicketWithEvent[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  
  // Cart and purchase
  const [cart, setCart] = useState<CartItem[]>([]);
  const [purchaseModal, setPurchaseModal] = useState<PurchaseModalState>({
    open: false,
    tickets: [],
    step: 0,
    loading: false,
    success: false,
  });

  const ticketsPerPage = 12;
  const steps = ['Review Items', 'Payment Info', 'Confirmation'];

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tickets, searchTerm, priceFilter, categoryFilter, sortBy, availabilityFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      // Fetch tickets and events
      const [ticketsData, eventsData] = await Promise.all([
        dashboardApi.getAllTickets(),
        dashboardApi.getAllEvents()
      ]);

      // Combine tickets with their event data
      const ticketsWithEvents: TicketWithEvent[] = ticketsData
        .map(ticket => {
          const event = eventsData.find(e => e.id === ticket.eventId);
          return event ? { ...ticket, event } : null;
        })
        .filter(Boolean) as TicketWithEvent[];

      setTickets(ticketsWithEvents);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tickets];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(ticket => {
        switch (priceFilter) {
          case 'free':
            return ticket.price === 0;
          case 'under50':
            return ticket.price > 0 && ticket.price < 50;
          case 'under100':
            return ticket.price >= 50 && ticket.price < 100;
          case 'over100':
            return ticket.price >= 100;
          default:
            return true;
        }
      });
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(ticket =>
        ticket.event.category?.name === categoryFilter
      );
    }

    // Availability filter
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(ticket => {
        switch (availabilityFilter) {
          case 'available':
            return ticket.quantity > 0;
          case 'limited':
            return ticket.quantity > 0 && ticket.quantity <= 10;
          case 'soldout':
            return ticket.quantity === 0;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popularity':
          return (b.event.attendeeCount || 0) - (a.event.attendeeCount || 0);
        case 'date':
        default:
          return new Date(a.event.startDate).getTime() - new Date(b.event.startDate).getTime();
      }
    });

    setFilteredTickets(filtered);
    setPage(1); // Reset to first page when filters change
  };

  const addToCart = (ticket: TicketWithEvent, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.ticket.id === ticket.id);
      if (existing) {
        return prev.map(item =>
          item.ticket.id === ticket.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, ticket.quantity) }
            : item
        );
      }
      return [...prev, { ticket, quantity }];
    });
  };

  const removeFromCart = (ticketId: string) => {
    setCart(prev => prev.filter(item => item.ticket.id !== ticketId));
  };

  const updateCartQuantity = (ticketId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(ticketId);
      return;
    }
    
    setCart(prev =>
      prev.map(item =>
        item.ticket.id === ticketId
          ? { ...item, quantity: Math.min(quantity, item.ticket.quantity) }
          : item
      )
    );
  };

  const openPurchaseModal = () => {
    setPurchaseModal({
      open: true,
      tickets: [...cart],
      step: 0,
      loading: false,
      success: false,
    });
  };

  const closePurchaseModal = () => {
    setPurchaseModal(prev => ({ ...prev, open: false }));
    if (purchaseModal.success) {
      setCart([]);
      fetchTickets(); // Refresh tickets to update quantities
    }
  };

  const handlePurchase = async () => {
    setPurchaseModal(prev => ({ ...prev, loading: true }));
    
    try {
      // Simulate purchase process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would call the actual purchase API
      // const response = await api.post('/tickets/purchase', {
      //   tickets: purchaseModal.tickets.map(item => ({
      //     ticketId: item.ticket.id,
      //     quantity: item.quantity
      //   }))
      // });

      setPurchaseModal(prev => ({ 
        ...prev, 
        loading: false, 
        success: true, 
        step: 2 
      }));
    } catch (error) {
      console.error('Purchase failed:', error);
      setPurchaseModal(prev => ({ ...prev, loading: false }));
      setError('Purchase failed. Please try again.');
    }
  };

  const getAvailabilityStatus = (ticket: TicketWithEvent) => {
    if (ticket.quantity === 0) return { label: 'Sold Out', color: 'error' };
    if (ticket.quantity <= 10) return { label: `${ticket.quantity} left`, color: 'warning' };
    return { label: 'Available', color: 'success' };
  };

  const getEventStatus = (event: EventType) => {
    const now = new Date();
    const eventStart = new Date(event.startDate);
    
    if (!event.isActive) return { label: 'Cancelled', color: '#9e9e9e' };
    if (isBefore(eventStart, now)) return { label: 'Past', color: '#ff9800' };
    return { label: 'Upcoming', color: '#4caf50' };
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

  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);
  const paginatedTickets = filteredTickets.slice(
    (page - 1) * ticketsPerPage,
    page * ticketsPerPage
  );

  const cartTotal = cart.reduce((sum, item) => sum + (item.ticket.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Get unique categories for filter
  const categories = Array.from(new Set(
    tickets.map(ticket => ticket.event.category?.name).filter(Boolean)
  ));

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
              <Box display="flex" alignItems="center" justify="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                  <ConfirmationNumber 
                    sx={{ 
                      fontSize: 40, 
                      color: theme.palette.primary.main, 
                      mr: 2 
                    }} 
                  />
                  <Typography variant="h3" fontWeight="bold">
                    Event Tickets
                  </Typography>
                </Box>
                
                {/* Cart Button */}
                {cartItemCount > 0 && (
                  <Button
                    variant="contained"
                    startIcon={
                      <Badge badgeContent={cartItemCount} color="secondary">
                        <ShoppingCart />
                      </Badge>
                    }
                    onClick={openPurchaseModal}
                    sx={{
                      borderRadius: 3,
                      px: 3,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    View Cart (€{cartTotal.toFixed(2)})
                  </Button>
                )}
              </Box>
              <Typography variant="h6" color="text.secondary" mb={3}>
                Browse and purchase tickets for upcoming events
              </Typography>
            </Box>
          </Fade>

          {/* Filters */}
          <Fade in timeout={1000}>
            <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    placeholder="Search tickets, events, venues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ borderRadius: 2 }}
                  />
                </Grid>
                
                <Grid item xs={6} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Price Range</InputLabel>
                    <Select
                      value={priceFilter}
                      label="Price Range"
                      onChange={(e) => setPriceFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Prices</MenuItem>
                      <MenuItem value="free">Free</MenuItem>
                      <MenuItem value="under50">Under €50</MenuItem>
                      <MenuItem value="under100">€50 - €100</MenuItem>
                      <MenuItem value="over100">Over €100</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={categoryFilter}
                      label="Category"
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Categories</MenuItem>
                      {categories.map(category => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Availability</InputLabel>
                    <Select
                      value={availabilityFilter}
                      label="Availability"
                      onChange={(e) => setAvailabilityFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Tickets</MenuItem>
                      <MenuItem value="available">Available</MenuItem>
                      <MenuItem value="limited">Limited (≤10)</MenuItem>
                      <MenuItem value="soldout">Sold Out</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      label="Sort By"
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <MenuItem value="date">Event Date</MenuItem>
                      <MenuItem value="price-low">Price: Low to High</MenuItem>
                      <MenuItem value="price-high">Price: High to Low</MenuItem>
                      <MenuItem value="name">Name</MenuItem>
                      <MenuItem value="popularity">Popularity</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={1}>
                  <Box display="flex" justifyContent="center">
                    <Chip 
                      label={`${filteredTickets.length} tickets`}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Fade>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Tickets Grid */}
          <Grid container spacing={3}>
            {paginatedTickets.map((ticket, index) => {
              const eventStatus = getEventStatus(ticket.event);
              const availabilityStatus = getAvailabilityStatus(ticket);
              const cartItem = cart.find(item => item.ticket.id === ticket.id);
              
              return (
                <Grid item xs={12} sm={6} lg={4} key={ticket.id}>
                  <Zoom in timeout={200 + index * 100}>
                    <Card
                      sx={{
                        height: 520,
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
                          label={eventStatus.label}
                          sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            bgcolor: eventStatus.color,
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                        <Chip
                          label={availabilityStatus.label}
                          color={availabilityStatus.color as any}
                          sx={{
                            position: 'absolute',
                            bottom: 16,
                            left: 16,
                            fontWeight: 600,
                          }}
                        />
                      </Box>

                      <CardContent sx={{ flex: 1, p: 3 }}>
                        {/* Ticket Name & Price */}
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Typography variant="h6" fontWeight="bold" sx={{ flex: 1, mr: 2 }}>
                            {ticket.name}
                          </Typography>
                          <Box textAlign="right">
                            <Typography variant="h5" fontWeight="bold" color="primary.main">
                              {Number(ticket.price) === 0 ? 'FREE' : `€${Number(ticket.price).toFixed(2)}`}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Event Title */}
                        <Typography variant="subtitle1" fontWeight={600} mb={1} noWrap>
                          {ticket.event.title}
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

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Inventory sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {ticket.quantity} tickets available
                          </Typography>
                        </Box>

                        {ticket.event.category && (
                          <Chip
                            label={ticket.event.category.name}
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
                        {ticket.quantity === 0 ? (
                          <Button
                            fullWidth
                            variant="outlined"
                            disabled
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                            }}
                          >
                            Sold Out
                          </Button>
                        ) : cartItem ? (
                          <Box display="flex" alignItems="center" width="100%" gap={1}>
                            <IconButton
                              onClick={() => updateCartQuantity(ticket.id, cartItem.quantity - 1)}
                              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                            >
                              <Remove />
                            </IconButton>
                            <Typography variant="h6" fontWeight="bold" sx={{ mx: 2 }}>
                              {cartItem.quantity}
                            </Typography>
                            <IconButton
                              onClick={() => updateCartQuantity(ticket.id, cartItem.quantity + 1)}
                              disabled={cartItem.quantity >= ticket.quantity}
                              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                            >
                              <Add />
                            </IconButton>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => removeFromCart(ticket.id)}
                              sx={{ ml: 'auto', textTransform: 'none' }}
                            >
                              Remove
                            </Button>
                          </Box>
                        ) : (
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<ShoppingCart />}
                            onClick={() => addToCart(ticket)}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                            }}
                          >
                            Add to Cart
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Zoom>
                </Grid>
              );
            })}
          </Grid>

          {/* No Tickets Message */}
          {filteredTickets.length === 0 && !loading && (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              minHeight="40vh"
            >
              <ConfirmationNumber sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" mb={1}>
                No tickets found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your filters or search terms
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

        {/* Purchase Modal */}
        <Dialog
          open={purchaseModal.open}
          onClose={closePurchaseModal}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" fontWeight="bold">
              Complete Purchase
            </Typography>
            <IconButton onClick={closePurchaseModal}>
              <Close />
            </IconButton>
          </DialogTitle>
          
          <DialogContent>
            <Stepper activeStep={purchaseModal.step} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {purchaseModal.step === 0 && (
              <Box>
                <Typography variant="h6" mb={2}>Review Your Items</Typography>
                {purchaseModal.tickets.map((item) => (
                  <Card key={item.ticket.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {item.ticket.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.ticket.event.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {format(new Date(item.ticket.event.startDate), 'MMM dd, yyyy - hh:mm a')}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body1">
                            Quantity: {item.quantity}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="h6" fontWeight="bold" textAlign="right">
                            €{(item.ticket.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5" fontWeight="bold">
                    Total: €{cartTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            )}

            {purchaseModal.step === 1 && (
              <Box>
                <Typography variant="h6" mb={2}>Payment Information</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Card Number"
                      placeholder="1234 5678 9012 3456"
                      InputProps={{
                        endAdornment: <Payment />
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      placeholder="MM/YY"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="CVV"
                      placeholder="123"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Cardholder Name"
                      placeholder="John Doe"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {purchaseModal.step === 2 && (
              <Box textAlign="center" py={4}>
                <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold" mb={2}>
                  Purchase Successful!
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={2}>
                  Your tickets have been purchased successfully.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You will receive a confirmation email shortly.
                </Typography>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            {purchaseModal.step === 0 && (
              <>
                <Button onClick={closePurchaseModal}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setPurchaseModal(prev => ({ ...prev, step: 1 }))}
                >
                  Continue to Payment
                </Button>
              </>
            )}
            
            {purchaseModal.step === 1 && (
              <>
                <Button onClick={() => setPurchaseModal(prev => ({ ...prev, step: 0 }))}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handlePurchase}
                  disabled={purchaseModal.loading}
                  startIcon={purchaseModal.loading ? <CircularProgress size={20} /> : <Payment />}
                >
                  {purchaseModal.loading ? 'Processing...' : `Pay €${cartTotal.toFixed(2)}`}
                </Button>
              </>
            )}
            
            {purchaseModal.step === 2 && (
              <Button
                variant="contained"
                onClick={closePurchaseModal}
                fullWidth
              >
                Done
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}