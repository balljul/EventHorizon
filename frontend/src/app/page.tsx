'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

export default function HomePage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold">
          Welcome to <span className="text-blue-600">EventHorizon</span>
        </h1>
        <p className="mt-3 text-xl">
          A modern event management platform
        </p>
        <p className="mt-2 text-lg">
          Hello, {user.firstName} {user.lastName}!
        </p>
        <div className="mt-6">
          <a
            href="/users"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-4"
          >
            Manage Users
          </a>
          <button
            onClick={() => {
              logout();
              router.replace('/login');
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}