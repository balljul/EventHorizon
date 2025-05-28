import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { createUser, CreateUserDto } from '../../lib/users';

const CreateUserPage: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateUserDto>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const mutation = useMutation({
    mutationFn: createUser,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Create New User
        </Typography>
        {/* Mutation Error */}
        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {(mutation.error as Error)?.message || 'Failed to create user.'}
          </Alert>
        )}
        <form onSubmit={handleSubmit} noValidate>
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
            required
          />
          <Box mt={2} display="flex" gap={2}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={mutation.isLoading}
            >
              {mutation.isLoading ? <CircularProgress size={24} /> : 'Create'}
            </Button>
            <Button variant="outlined" onClick={() => router.back()}>
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateUserPage;