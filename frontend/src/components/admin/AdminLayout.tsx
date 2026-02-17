import React, { useState } from 'react';
import { Dashboard } from './Dashboard';
import { UserManagement } from './UserManagement';
import { ContentManagement } from './ContentManagement';
import { TemplateManagement } from './TemplateManagement';
import { SystemHealth } from './SystemHealth';

type TabType = 'dashboard' | 'users' | 'contents' | 'templates' | 'system';

interface AdminLayoutProps {
  isDarkMode: boolean;
  onLogout: () => void;
  onBackToMain: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ isDarkMode, onLogout, onBackToMain }) => {
  
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'contents', label: 'Contents', icon: '📄' },
    { id: 'templates', label: 'Templates', icon: '📚' },
    { id: 'system', label: 'System', icon: '🔧' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard isDarkMode={isDarkMode} />;
      case 'users':
        return <UserManagement isDarkMode={isDarkMode} />;
      case 'contents':
        return <ContentManagement isDarkMode={isDarkMode} />;
      case 'templates':
        return <TemplateManagement isDarkMode={isDarkMode} />;
      case 'system':
        return <SystemHealth isDarkMode={isDarkMode} />;
      default:
        return <Dashboard isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Top Navigation */}
      <div className={`border-b ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white'} shadow`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🛡️ Admin Panel
            </h1>
            <div className="flex gap-2">
              <button
                onClick={onBackToMain}  // ✅ ÄNDERT zu onBackToMain Callback
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                ← Zurück zur App
              </button>
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`border-b ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-1 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === tab.id
                    ? isDarkMode
                      ? 'border-blue-500 text-blue-400'
                      : 'border-blue-500 text-blue-600'
                    : isDarkMode
                    ? 'border-transparent text-gray-400 hover:text-gray-300'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};