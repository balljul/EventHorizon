import React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Paper,
} from '@mui/material';
import { getAttendee, Attendee } from '../../lib/attendees';

const AttendeeDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: attendee, isLoading, error, refetch } = useQuery<Attendee, Error>({
    queryKey: ['attendee', id],
    queryFn: () => getAttendee(id as string),
    enabled: Boolean(id),
    retry: false,
  });

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Attendee Details
        </Typography>
        {isLoading && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Box my={2}>
            <Alert
              severity="error"
              action={<Button size="small" onClick={() => refetch()}>Retry</Button>}>
              Error loading attendee: {error.message}
            </Alert>
          </Box>
        )}
        {attendee && (
          <Box component="dl" sx={{ '& dt': { fontWeight: 'bold', mt: 1 }, '& dd': { ml: 0, mb: 1 } }}>
            <dt>ID</dt><dd>{attendee.id}</dd>
            <dt>User</dt><dd>{attendee.user.email} ({attendee.user.firstName} {attendee.user.lastName})</dd>
            <dt>Event</dt><dd>{attendee.event.title}</dd>
            <dt>Status</dt><dd>{attendee.status}</dd>
            <dt>Notes</dt><dd>{attendee.notes || '-'}</dd>
            <dt>Paid</dt><dd>{attendee.isPaid ? 'Yes' : 'No'}</dd>
            <dt>Payment Amount</dt><dd>{attendee.paymentAmount ?? '-'}</dd>
            <dt>Created At</dt><dd>{new Date(attendee.createdAt).toLocaleString()}</dd>
            <dt>Updated At</dt><dd>{new Date(attendee.updatedAt).toLocaleString()}</dd>
          </Box>
        )}
        <Box mt={3}>
          <Button variant="contained" onClick={() => router.back()}>
            Back
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AttendeeDetailPage;