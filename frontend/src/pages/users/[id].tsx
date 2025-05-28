import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  getUser,
  updateUser,
  deleteUser,
  User,
  UpdateUserDto,
} from '../../lib/users';

const UserDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery<User, Error>({
    queryKey: ['user', id],
    queryFn: () => getUser(id as string),
    enabled: Boolean(id),
    retry: false,
  });
  const [form, setForm] = useState<UpdateUserDto>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: '',
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserDto) => updateUser(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      router.push('/users');
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteUser(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      router.push('/users');
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate();
    }
  };


  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Edit User
        </Typography>
        {/* Loading Spinner */}
        {isLoading && (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress />
          </Box>
        )}
        {/* Loading/Error for fetch */}
        {error && (
          <Box my={2}>
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            >
              Failed to load user: {error.message}
            </Alert>
          </Box>
        )}
        {/* Mutation Errors */}
        {updateMutation.isError && (
          <Box my={2}>
            <Alert severity="error">
              Failed to update user: {(updateMutation.error as Error)?.message}
            </Alert>
          </Box>
        )}
        {deleteMutation.isError && (
          <Box my={2}>
            <Alert severity="error">
              Failed to delete user: {(deleteMutation.error as Error)?.message}
            </Alert>
          </Box>
        )}
        <form onSubmit={handleUpdate} noValidate>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="First Name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Last Name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            helperText="Leave blank to keep existing password"
          />
          <Box mt={2} display="flex" gap={2}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={updateMutation.isLoading}
            >
              {updateMutation.isLoading ? (
                <CircularProgress size={24} />
              ) : (
                'Save'
              )}
            </Button>
            <Button variant="outlined" onClick={() => router.back()}>
              Cancel
            </Button>
            <Box flexGrow={1} />
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? (
                <CircularProgress size={24} />
              ) : (
                'Delete'
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default UserDetailPage;