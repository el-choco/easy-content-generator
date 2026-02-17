import React, { useState, useEffect } from 'react';

export const SystemHealth: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [health, setHealth] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [healthRes, statsRes] = await Promise.all([
        fetch('http://localhost:8118/admin/system/health', { headers }),
        fetch('http://localhost:8118/admin/system/stats', { headers })
      ]);

      if (healthRes.ok && statsRes.ok) {
        setHealth(await healthRes.json());
        setStats(await statsRes.json());
      }
    } catch (err) {
      console.error('Error fetching system data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!health || !stats) return <div className="p-8 text-center">No data</div>;

  return (
    <div className={`p-8 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        🔧 System Health & Status
      </h1>

      {/* Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Database Status */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🗄️ Database
          </h3>
          <p className="text-2xl font-bold text-green-500">{health.database}</p>
          <p className={`text-sm mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Last checked: {new Date(health.timestamp).toLocaleTimeString()}
          </p>
        </div>

        {/* Gemini API Status */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🤖 Gemini API
          </h3>
          <p className="text-2xl font-bold text-green-500">{health.gemini_api}</p>
          <p className={`text-sm mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Version: {health.version}
          </p>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Database Stats */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📊 Database Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Users:</span>
              <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.database.users}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Contents:</span>
              <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.database.contents}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Templates:</span>
              <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.database.templates}
              </span>
            </div>
          </div>
        </div>

        {/* Content Status */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📄 Content Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Published:</span>
              <span className="font-bold text-green-500">
                {stats.content_by_status.published}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Drafts:</span>
              <span className="font-bold text-orange-500">
                {stats.content_by_status.draft}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: isDarkMode ? '#4b5563' : '#e5e7eb' }}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total: {stats.content_by_status.published + stats.content_by_status.draft}
              </p>
            </div>
          </div>
        </div>

        {/* Top Languages */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🌍 Top Languages
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.content_by_language)
              .sort((a: any, b: any) => b[1] - a[1])
              .slice(0, 5)
              .map(([lang, count]: any) => (
                <div key={lang} className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {lang.toUpperCase()}:
                  </span>
                  <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Templates & Tones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Template Categories */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📚 Template Categories
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.templates_by_category)
              .sort((a: any, b: any) => b[1] - a[1])
              .map(([category, count]: any) => (
                <div key={category} className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}:
                  </span>
                  <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Content Tones */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🎨 Content Tones Distribution
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.content_by_tone)
              .sort((a: any, b: any) => b[1] - a[1])
              .map(([tone, count]: any) => (
                <div key={tone} className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}:
                  </span>
                  <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Auto Refresh Info */}
      <div className={`mt-8 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
        <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
          ℹ️ This page auto-refreshes every 10 seconds
        </p>
      </div>
    </div>
  );
};