import React from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminProvider } from '../context/AdminContext';

interface AdminPageProps {
  isDarkMode: boolean;
  onLogout: () => void;
  onBackToMain: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ isDarkMode, onLogout, onBackToMain }) => {
  return (
    <AdminProvider>
      <AdminLayout 
        isDarkMode={isDarkMode} 
        onLogout={onLogout} 
        onBackToMain={onBackToMain}
      />
    </AdminProvider>
  );
};