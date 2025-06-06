import { api } from './api';

// Dashboard Data Types
export interface DashboardStats {
  totalEvents: number;
  totalUsers: number;
  totalTickets: number;
  totalRevenue: number;
  activeEvents: number;
  recentEvents: Event[];
  eventsByCategory: CategoryStats[];
  monthlyTrends: MonthlyTrend[];
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  organizerId: string;
  venueId?: string;
  categoryId?: string;
  category?: Category;
  venue?: Venue;
  attendeeCount?: number;
  ticketsSold?: number;
  revenue?: number;
  // Computed properties for frontend compatibility
  maxCapacity?: number;
  status?: 'active' | 'inactive' | 'cancelled';
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  capacity: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface Ticket {
  id: string;
  eventId: string;
  name: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Attendee {
  id: string;
  status: 'registered' | 'confirmed' | 'attended' | 'cancelled' | 'no_show';
  notes?: string;
  isPaid: boolean;
  paymentAmount?: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  event?: Event;
}

export interface AttendeeStats {
  totalAttendees: number;
  confirmedAttendees: number;
  attendedCount: number;
  cancelledCount: number;
  noShowCount: number;
  paidAttendees: number;
  unpaidAttendees: number;
  totalRevenue: number;
}

export interface CategoryStats {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  events: number;
  revenue: number;
  attendees: number;
}

export interface UserDashboardData {
  upcomingEvents: Event[];
  attendingEvents: Attendee[];
  userStats: {
    eventsAttended: number;
    upcomingEvents: number;
    totalSpent: number;
    certificates: number;
  };
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  action: string;
  time: string;
  type: 'registration' | 'completion' | 'review' | 'join';
}

// Helper function to transform backend event to frontend format
const transformEvent = (event: any): Event => ({
  ...event,
  maxCapacity: event.capacity,
  status: event.isActive ? 'active' : 'inactive',
});

// API Functions
export const dashboardApi = {
  // Admin Dashboard Data
  async getAdminDashboardStats(): Promise<DashboardStats> {
    const [
      events,
      users,
      tickets,
      categories,
      activeEvents
    ] = await Promise.all([
      api.get('/events'),
      api.get('/users'),
      api.get('/tickets'),
      api.get('/categories'),
      api.get('/events/active')
    ]);

    // Calculate stats from the data
    const totalEvents = events.data.length;
    const totalUsers = users.data.length;
    const totalTickets = tickets.data.reduce((sum: number, ticket: Ticket) => 
      sum + ticket.quantity, 0);
    const totalRevenue = tickets.data.reduce((sum: number, ticket: Ticket) => 
      sum + (ticket.price * ticket.quantity), 0);

    // Get recent events (last 10) and transform them
    const recentEvents = events.data
      .map(transformEvent)
      .sort((a: Event, b: Event) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    // Calculate events by category
    const eventsByCategory = await this.getEventsByCategory(events.data, categories.data);

    // Calculate monthly trends
    const monthlyTrends = await this.getMonthlyTrends(events.data, tickets.data);

    return {
      totalEvents,
      totalUsers,
      totalTickets,
      totalRevenue,
      activeEvents: activeEvents.data.length,
      recentEvents,
      eventsByCategory,
      monthlyTrends
    };
  },

  async getEventsByCategory(events: Event[], categories: Category[]): Promise<CategoryStats[]> {
    const categoryColors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#ffeaa7'];
    
    const categoryMap = new Map();
    categories.forEach(category => {
      categoryMap.set(category.id, { name: category.name, count: 0 });
    });

    events.forEach(event => {
      if (event.categoryId && categoryMap.has(event.categoryId)) {
        categoryMap.get(event.categoryId).count++;
      }
    });

    return Array.from(categoryMap.values())
      .filter(cat => cat.count > 0)
      .map((cat, index) => ({
        name: cat.name,
        value: cat.count,
        color: categoryColors[index % categoryColors.length]
      }));
  },

  async getMonthlyTrends(events: Event[], tickets: Ticket[]): Promise<MonthlyTrend[]> {
    const last6Months: MonthlyTrend[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthEvents = events.filter(event => {
        const eventDate = new Date(event.createdAt);
        return eventDate.getMonth() === date.getMonth() && 
               eventDate.getFullYear() === date.getFullYear();
      });

      const monthRevenue = tickets
        .filter(ticket => {
          const ticketDate = new Date(ticket.createdAt);
          return ticketDate.getMonth() === date.getMonth() && 
                 ticketDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0);

      last6Months.push({
        month: monthName,
        events: monthEvents.length,
        revenue: monthRevenue,
        attendees: monthEvents.reduce((sum, event) => sum + (event.attendeeCount || 0), 0)
      });
    }

    return last6Months;
  },

  // User Dashboard Data
  async getUserDashboardData(userId: string): Promise<UserDashboardData> {
    try {
      // Try to get active events, fallback to all events if active endpoint doesn't exist
      let upcomingEventsData;
      try {
        upcomingEventsData = await api.get('/events/active');
      } catch (error) {
        // Fallback to all events and filter client-side
        const allEvents = await api.get('/events');
        upcomingEventsData = {
          data: allEvents.data
            .map(transformEvent)
            .filter((event: Event) => 
              event.isActive && new Date(event.startDate) > new Date()
            )
        };
      }

      // Try to get user attendees, fallback to empty array
      let userAttendeesData;
      try {
        userAttendeesData = await api.get(`/attendees/user/${userId}`);
      } catch (error) {
        // If endpoint doesn't exist, try alternative or use empty data
        try {
          const allAttendees = await api.get('/attendees');
          userAttendeesData = {
            data: allAttendees.data.filter((attendee: Attendee) => 
              attendee.user?.id === userId
            )
          };
        } catch (error2) {
          userAttendeesData = { data: [] };
        }
      }

      // Get user's registered events
      const attendingEvents = userAttendeesData.data;
      
      // Calculate user stats
      const eventsAttended = attendingEvents.filter((a: Attendee) => 
        a.status === 'attended').length;
      const upcomingEventsCount = attendingEvents.filter((a: Attendee) => 
        ['registered', 'confirmed'].includes(a.status)).length;
      const totalSpent = attendingEvents.reduce((sum: number, a: Attendee) => 
        sum + (a.paymentAmount || 0), 0);

      // Enhanced recent activity based on user's actual attendee data
      const recentActivity: ActivityItem[] = attendingEvents
        .slice(0, 4)
        .map((attendee: Attendee) => ({
          action: `Registered for ${attendee.event?.title || 'Event'}`,
          time: new Date(attendee.createdAt).toLocaleDateString(),
          type: 'registration' as const
        }));

      // If no real activity, provide some default activity
      if (recentActivity.length === 0) {
        recentActivity.push(
          { action: 'Welcome to EventHorizon!', time: 'Just now', type: 'join' },
          { action: 'Profile setup completed', time: '1 hour ago', type: 'completion' },
        );
      }

      return {
        upcomingEvents: upcomingEventsData.data.map(transformEvent).slice(0, 6), // Limit to 6 events
        attendingEvents,
        userStats: {
          eventsAttended,
          upcomingEvents: upcomingEventsCount,
          totalSpent,
          certificates: Math.floor(eventsAttended / 3) // Mock certificate logic
        },
        recentActivity
      };
    } catch (error) {
      console.error('Error fetching user dashboard data:', error);
      // Return fallback data if everything fails
      return {
        upcomingEvents: [],
        attendingEvents: [],
        userStats: {
          eventsAttended: 0,
          upcomingEvents: 0,
          totalSpent: 0,
          certificates: 0
        },
        recentActivity: [
          { action: 'Welcome to EventHorizon!', time: 'Just now', type: 'join' }
        ]
      };
    }
  },

  // Get event attendance stats
  async getEventAttendanceStats(eventId: string): Promise<AttendeeStats> {
    const response = await api.get(`/attendees/event/${eventId}/stats`);
    return response.data;
  },

  // Get all events with full details
  async getAllEvents(): Promise<Event[]> {
    const response = await api.get('/events');
    return response.data;
  },

  // Get all users
  async getAllUsers(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  },

  // Get all categories
  async getAllCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data;
  },

  // Get all tickets
  async getAllTickets(): Promise<Ticket[]> {
    const response = await api.get('/tickets');
    return response.data;
  }
};