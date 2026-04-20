/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import ManageUsers from './pages/ManageUsers';
import ManageQuestions from './pages/ManageQuestions';
import ManageExams from './pages/ManageExams';
import SiswaExams from './pages/SiswaExams';
import ExamWindow from './pages/ExamWindow';
import ExamResults from './pages/ExamResults';
import React from 'react';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'admin/users',
        element: <ManageUsers />,
      },
      {
        path: 'guru/questions',
        element: <ManageQuestions />,
      },
      {
        path: 'guru/exams',
        element: <ManageExams />,
      },
      {
        path: 'siswa/exams',
        element: <SiswaExams />,
      },
      {
        path: 'results',
        element: <ExamResults />,
      },
    ],
  },
  {
    path: 'app/siswa/exam/:id',
    element: <ExamWindow />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
