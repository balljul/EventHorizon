'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardHeader,
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
} from '@mui/material';
import {
  AccountCircle,
  Save,
  Edit,
  Language,
  Palette,
  Security,
  Notifications,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';
import MainLayout from '../../components/layout/MainLayout';

interface UserPreferences {
  language: 'en' | 'de';
  theme: 'light' | 'dark' | 'cosmic';
  notifications: {
    email: boolean;
    push: boolean;
    eventReminders: boolean;
    marketingEmails: boolean;
  };
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsPage() {
  const { user, login } = useAuth();
  const { mode, setMode } = useThemeMode();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'en',
    theme: mode,
    notifications: {
      email: true,
      push: true,
      eventReminders: true,
      marketingEmails: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      }));
    }

    // Load preferences from localStorage
    const savedPrefs = localStorage.getItem('userPreferences');
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        setPreferences(prev => ({ ...prev, ...parsed, theme: mode }));
      } catch (error) {
        console.error('Error parsing saved preferences:', error);
      }
    }
  }, [user, mode]);

  const handleInputChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handlePreferenceChange = (category: keyof UserPreferences, field: string, value: any) => {
    setPreferences(prev => {
      const updated = { ...prev };
      if (category === 'notifications') {
        updated.notifications = { ...updated.notifications, [field]: value };
      } else {
        (updated as any)[category] = value;
      }
      return updated;
    });
  };

  const savePreferences = () => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    if (preferences.theme !== mode) {
      setMode(preferences.theme);
    }
    showSnackbar('Preferences saved successfully!', 'success');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Validate passwords if trying to change them
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          showSnackbar('New passwords do not match!', 'error');
          setLoading(false);
          return;
        }
        if (formData.newPassword.length < 8) {
          showSnackbar('New password must be at least 8 characters long!', 'error');
          setLoading(false);
          return;
        }
        if (!formData.currentPassword) {
          showSnackbar('Current password is required to change password!', 'error');
          setLoading(false);
          return;
        }
      }

      // Prepare update data
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      };

      if (formData.newPassword && formData.currentPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.password = formData.newPassword;
      }

      // Update user profile
      const response = await api.put(`/users/${user?.id}`, updateData);
      
      // Update local user data
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      showSnackbar('Profile updated successfully!', 'success');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showSnackbar(
        error.response?.data?.message || 'Failed to update profile!',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];

  const themes = [
    { value: 'light', name: 'Light', icon: '☀️' },
    { value: 'dark', name: 'Dark', icon: '🌙' },
    { value: 'cosmic', name: 'Cosmic', icon: '🌌' },
  ];

  const tabItems = [
    { id: 'profile', label: 'Profile', icon: <Person /> },
    { id: 'preferences', label: 'Preferences', icon: <Palette /> },
    { id: 'notifications', label: 'Notifications', icon: <Notifications /> },
    { id: 'security', label: 'Security', icon: <Security /> },
  ];

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account settings and preferences
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Sidebar Navigation */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mb: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  <AccountCircle sx={{ fontSize: 50 }} />
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {tabItems.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'contained' : 'text'}
                    startIcon={tab.icon}
                    onClick={() => setActiveTab(tab.id)}
                    sx={{
                      justifyContent: 'flex-start',
                      py: 1.5,
                      px: 2,
                    }}
                  >
                    {tab.label}
                  </Button>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={9}>
            {activeTab === 'profile' && (
              <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom fontWeight={600}>
                  Profile Information
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Update your personal information and account details
                </Typography>

                <Box component="form" onSubmit={handleProfileSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={formData.firstName}
                        onChange={handleInputChange('firstName')}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={formData.lastName}
                        onChange={handleInputChange('lastName')}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        required
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Change Password
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Leave blank if you don't want to change your password
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        type="password"
                        value={formData.currentPassword}
                        onChange={handleInputChange('currentPassword')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleInputChange('newPassword')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange('confirmPassword')}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Save />}
                        disabled={loading}
                        sx={{ mt: 2 }}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            )}

            {activeTab === 'preferences' && (
              <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom fontWeight={600}>
                  Preferences
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Customize your experience with language and theme settings
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={preferences.language}
                        label="Language"
                        onChange={(e) => handlePreferenceChange('language', '', e.target.value)}
                      >
                        {languages.map((lang) => (
                          <MenuItem key={lang.code} value={lang.code}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>{lang.flag}</span>
                              {lang.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Theme</InputLabel>
                      <Select
                        value={preferences.theme}
                        label="Theme"
                        onChange={(e) => handlePreferenceChange('theme', '', e.target.value)}
                      >
                        {themes.map((theme) => (
                          <MenuItem key={theme.value} value={theme.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>{theme.icon}</span>
                              {theme.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={savePreferences}
                      sx={{ mt: 2 }}
                    >
                      Save Preferences
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {activeTab === 'notifications' && (
              <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom fontWeight={600}>
                  Notification Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Choose what notifications you want to receive
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.notifications.email}
                          onChange={(e) => 
                            handlePreferenceChange('notifications', 'email', e.target.checked)
                          }
                        />
                      }
                      label="Email Notifications"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      Receive notifications via email
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.notifications.push}
                          onChange={(e) => 
                            handlePreferenceChange('notifications', 'push', e.target.checked)
                          }
                        />
                      }
                      label="Push Notifications"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      Receive push notifications in your browser
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.notifications.eventReminders}
                          onChange={(e) => 
                            handlePreferenceChange('notifications', 'eventReminders', e.target.checked)
                          }
                        />
                      }
                      label="Event Reminders"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      Get reminded about upcoming events you're attending
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.notifications.marketingEmails}
                          onChange={(e) => 
                            handlePreferenceChange('notifications', 'marketingEmails', e.target.checked)
                          }
                        />
                      }
                      label="Marketing Emails"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      Receive promotional emails and updates
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={savePreferences}
                      sx={{ mt: 2 }}
                    >
                      Save Notification Settings
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {activeTab === 'security' && (
              <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom fontWeight={600}>
                  Security Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Manage your account security and access
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Account Status
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip label="Active" color="success" size="small" />
                          <Chip label="Verified" color="info" size="small" />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Your account is active and email verified
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Login Sessions
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Manage where you're logged in
                        </Typography>
                        <Button variant="outlined" color="error">
                          End All Other Sessions
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Data Export
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Download a copy of your data
                        </Typography>
                        <Button variant="outlined">
                          Request Data Export
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Grid>
        </Grid>

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
    </MainLayout>
  );
}