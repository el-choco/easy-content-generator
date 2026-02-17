import React, { createContext, useState, useEffect } from 'react';

interface AdminContextType {
  dashboard: any;
  users: any[];
  contents: any[];
  templates: any[];
  loading: boolean;
  error: string | null;
  refreshData: () => void;
}

export const AdminContext = createContext<AdminContextType | undefined>(undefined);

const getApiBase = () => {
  return (window as any).__API_URL__ || '/api';
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [contents, setContents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('access_token');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE = getApiBase(); // ✅ HIER berechnen!
      const headers = { Authorization: `Bearer ${token}` };

      const [dashRes, usersRes, contentsRes, templatesRes] = await Promise.all([
        fetch(`${API_BASE}/admin/dashboard`, { headers }),
        fetch(`${API_BASE}/admin/users`, { headers }),
        fetch(`${API_BASE}/admin/contents`, { headers }),
        fetch(`${API_BASE}/admin/templates`, { headers })
      ]);

      if (!dashRes.ok || !usersRes.ok || !contentsRes.ok || !templatesRes.ok) {
        throw new Error('Failed to fetch admin data');
      }

      setDashboard(await dashRes.json());
      setUsers(await usersRes.json());
      setContents(await contentsRes.json());
      setTemplates(await templatesRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('AdminContext Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <AdminContext.Provider value={{ dashboard, users, contents, templates, loading, error, refreshData: fetchData }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = React.useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
};