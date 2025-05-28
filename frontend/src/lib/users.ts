import { api } from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/users');
  return response.data;
};

export const getUser = async (id: string): Promise<User> => {
  const response = await api.get<User>(`/users/${id}`);
  return response.data;
};

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const createUser = async (data: CreateUserDto): Promise<User> => {
  const response = await api.post<User>('/users', data);
  return response.data;
};

export interface UpdateUserDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

export const updateUser = async (id: string, data: UpdateUserDto): Promise<User> => {
  const response = await api.put<User>(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};