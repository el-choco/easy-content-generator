import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Dashboard: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const { dashboard, loading } = useAdmin();

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!dashboard) return <div className="p-8 text-center">No data</div>;

  return (
    <div className={`p-8 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <h1 className={`text-4xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        📊 Admin Dashboard
      </h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Users Card */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Users
          </h3>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {dashboard.users.total}
          </p>
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Active: {dashboard.users.active} | Admins: {dashboard.users.admins}
          </p>
        </div>

        {/* Content Card */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Content
          </h3>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {dashboard.content.total}
          </p>
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Published: {dashboard.content.published} | Drafts: {dashboard.content.drafts}
          </p>
        </div>

        {/* Templates Card */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Templates
          </h3>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {dashboard.templates.total}
          </p>
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Default: {dashboard.templates.default} | Custom: {dashboard.templates.custom}
          </p>
        </div>

        {/* Health Card */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            System Status
          </h3>
          <p className="text-3xl font-bold text-green-500">✅</p>
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            All systems operational
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Languages */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📊 Top Languages
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboard.top_languages}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="language" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Tones */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🎨 Top Tones
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboard.top_tones}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ tone, count }) => `${tone} (${count})`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {dashboard.top_tones.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};