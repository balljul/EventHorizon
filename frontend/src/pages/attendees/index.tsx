import React from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { getAttendees, deleteAttendee, Attendee } from '../../lib/attendees';

const AttendeesPage: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: attendees, isLoading, error, refetch } = useQuery<Attendee[], Error>({
    queryKey: ['attendees'],
    queryFn: getAttendees,
    retry: false,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAttendee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendees'] });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this attendee?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {isLoading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Box mt={2}>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }>
            Error loading attendees: {error.message}
          </Alert>
        </Box>
      )}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Attendees</Typography>
        </Box>
      </Paper>
      <TableContainer component={Paper} sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Event</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(attendees && attendees.length > 0 ? attendees : []).map((att) => (
              <TableRow key={att.id} hover>
                <TableCell>{att.id}</TableCell>
                <TableCell>{att.user.email}</TableCell>
                <TableCell>{att.event.title}</TableCell>
                <TableCell>{att.status}</TableCell>
                <TableCell>{att.isPaid ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => router.push(`/attendees/${att.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => handleDelete(att.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && (!attendees || attendees.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No attendees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AttendeesPage;