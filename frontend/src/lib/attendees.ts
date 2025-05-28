import { api } from './api';
import { User } from './users';

export interface Event {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

export interface Attendee {
  id: string;
  user: User;
  event: Event;
  status: string;
  notes?: string;
  isPaid: boolean;
  paymentAmount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch all attendees
 */
export const getAttendees = async (): Promise<Attendee[]> => {
  const response = await api.get<Attendee[]>('/attendees');
  return response.data;
};

/**
 * Fetch attendee by ID
 */
export const getAttendee = async (id: string): Promise<Attendee> => {
  const response = await api.get<Attendee>(`/attendees/${id}`);
  return response.data;
};

/**
 * Delete attendee by ID
 */
export const deleteAttendee = async (id: string): Promise<void> => {
  await api.delete(`/attendees/${id}`);
};