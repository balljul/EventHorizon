'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Chip,
  useTheme,
  alpha,
  keyframes,
  CircularProgress,
  Alert,
  Skeleton,
  Button,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  TrendingUp,
  People,
  Event,
  ConfirmationNumber,
  AttachMoney,
  Visibility,
  ArrowUpward,
  ArrowDownward,
  AutoAwesome,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useThemeMode } from '../../contexts/ThemeContext';
import { dashboardApi, DashboardStats, Event as EventType } from '../../lib/dashboard';
import { format } from 'date-fns';

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
  50% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.6); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Real data will be loaded from API

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color }) => {
  const { mode } = useThemeMode();
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        background: mode === 'cosmic' 
          ? 'linear-gradient(145deg, rgba(25, 25, 25, 0.9) 0%, rgba(15, 15, 35, 0.9) 100%)'
          : mode === 'dark'
          ? 'linear-gradient(145deg, rgba(30, 30, 30, 0.9) 0%, rgba(20, 20, 40, 0.9) 100%)'
          : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(color, 0.3)}`,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 30px ${alpha(color, 0.4)}`,
          animation: `${glow} 2s ease-in-out infinite`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              {value}
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              {change > 0 ? (
                <ArrowUpward sx={{ color: '#4caf50', fontSize: 16, mr: 0.5 }} />
              ) : (
                <ArrowDownward sx={{ color: '#f44336', fontSize: 16, mr: 0.5 }} />
              )}
              <Typography
                variant="body2"
                sx={{ color: change > 0 ? '#4caf50' : '#f44336', fontWeight: 600 }}
              >
                {Math.abs(change)}%
              </Typography>
            </Box>
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.2),
              color: color,
              width: 56,
              height: 56,
              animation: `${pulse} 3s ease-in-out infinite`,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

const AdminDashboard: React.FC = () => {
  const { mode } = useThemeMode();
  const theme = useTheme();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardApi.getAdminDashboardStats();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
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
        <Box display="flex" alignItems="center" mb={4}>
          <DashboardIcon sx={{ fontSize: 32, mr: 2, color: theme.palette.primary.main }} />
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Admin Dashboard
          </Typography>
          <Chip
            label={loading ? "Loading..." : "Live Data"}
            sx={{
              ml: 2,
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

            {/* Stats Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
              <StatCard
                title="Total Events"
                value={dashboardData.totalEvents.toLocaleString()}
                change={12.5} // Could be calculated from trends
                icon={<Event />}
                color="#667eea"
              />
              <StatCard
                title="Total Users"
                value={dashboardData.totalUsers.toLocaleString()}
                change={8.2} // Could be calculated from trends
                icon={<People />}
                color="#764ba2"
              />
              <StatCard
                title="Tickets Sold"
                value={dashboardData.totalTickets.toLocaleString()}
                change={15.3} // Could be calculated from trends
                icon={<ConfirmationNumber />}
                color="#f093fb"
              />
              <StatCard
                title="Revenue"
                value={`$${(dashboardData.totalRevenue / 1000).toFixed(1)}K`}
                change={23.1} // Could be calculated from trends
                icon={<AttachMoney />}
                color="#4facfe"
              />
            </Box>

        {/* Charts Row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 4 }}>
          {/* Event Trends */}
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
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Events & Revenue Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dashboardData.monthlyTrends}>
                  <defs>
                    <linearGradient id="eventsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f093fb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f093fb" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                  <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: alpha(theme.palette.background.paper, 0.95),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      borderRadius: 8,
                      backdropFilter: 'blur(10px)',
                    }}
                  />
                  <Area type="monotone" dataKey="events" stroke="#667eea" fill="url(#eventsGradient)" strokeWidth={3} />
                  <Area type="monotone" dataKey="revenue" stroke="#f093fb" fill="url(#revenueGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Box>

          {/* Event Categories */}
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
              }}
            >
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Event Categories
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.eventsByCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {dashboardData.eventsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: alpha(theme.palette.background.paper, 0.95),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      borderRadius: 8,
                      backdropFilter: 'blur(10px)',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </Box>

        {/* Recent Events */}
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
          <Typography variant="h6" fontWeight="bold" mb={3}>
            Recent Events
          </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
              {dashboardData.recentEvents.map((event) => (
                <Box key={event.id}>
                  <Card
                    sx={{
                      background: alpha(theme.palette.background.paper, 0.5),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                      },
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {event.title}
                      </Typography>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          {event.attendeeCount || 0} attendees
                        </Typography>
                        <Chip
                          label={event.status}
                          size="small"
                          sx={{
                            bgcolor: event.status === 'active' ? '#4caf50' : 
                                     event.status === 'inactive' ? '#ff9800' : '#9e9e9e',
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {format(new Date(event.startDate), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="h6" color="primary.main" fontWeight="bold">
                        ${(event.revenue || 0).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
          </Box>
        </Paper>
        </>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;