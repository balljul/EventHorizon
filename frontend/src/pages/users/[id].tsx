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
  } = useQuery<User, Error>(['user', id], () => getUser(id as string), {
    enabled: !!id,
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

  const updateMutation = useMutation(
    (data: UpdateUserDto) => updateUser(id as string, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        router.push('/users');
      },
    }
  );
  const deleteMutation = useMutation(() => deleteUser(id as string), {
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
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

  if (isLoading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  if (error) {
    return (
      <Container>
        <Typography color="error">Error: {error.message}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          Edit User
        </Typography>
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
      </Box>
    </Container>
  );
};

export default UserDetailPage;