import React from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import Link from 'next/link'; // previously unused, removed
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Alert,
} from '@mui/material';
import { getUsers, deleteUser, User } from '../../lib/users';

const UsersPage: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: getUsers,
    retry: false,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(id);
    }
  };

  // Always render UI; show loading spinner or error alert as needed

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Loading Spinner */}
      {isLoading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}
      {/* Error Alert */}
      {error && (
        <Box mt={2}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          >
            Failed to load users: {error.message}
          </Alert>
        </Box>
      )}
      {/* Header Section */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Users</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/users/create')}
          >
            Create User
          </Button>
        </Box>
      </Paper>
      {/* Users Table */}
      <TableContainer component={Paper} sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(users && users.length > 0 ? users : []).map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => router.push(`/users/${user.id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {/* Empty state when no users */}
            {!isLoading && (!users || users.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users to display.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default UsersPage;