import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';

interface FilterState {
  status: string;
  language: string;
  userId: number | '';
  searchTerm: string;
}

export const ContentManagement: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const { contents, users, loading, refreshData } = useAdmin();
  const token = localStorage.getItem('access_token');
  const [selectedContents, setSelectedContents] = useState<Set<number>>(new Set());
  
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    language: '',
    userId: '',
    searchTerm: ''
  });

  // ✅ Get unique languages and statuses
  const languages = [...new Set(contents.map(c => c.language))].filter(Boolean);
  const statuses = ['draft', 'published', 'archived'];

  // ✅ Filter & Search logic
  const filteredContents = contents.filter(content => {
    // Status filter
    if (filters.status && content.status !== filters.status) return false;
    
    // Language filter
    if (filters.language && content.language !== filters.language) return false;
    
    // User filter
    if (filters.userId && content.user_id !== filters.userId) return false;
    
    // Search filter (Titel + Body)
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      return (
        content.title.toLowerCase().includes(search) ||
        content.body.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  // Checkbox handlers
  const toggleContentSelection = (contentId: number) => {
    const newSelected = new Set(selectedContents);
    if (newSelected.has(contentId)) {
      newSelected.delete(contentId);
    } else {
      newSelected.add(contentId);
    }
    setSelectedContents(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedContents.size === filteredContents.length) {
      setSelectedContents(new Set());
    } else {
      setSelectedContents(new Set(filteredContents.map(c => c.id)));
    }
  };

  // ✅ Delete single content
  const handleDeleteContent = async (contentId: number) => {
    if (!confirm('⚠️ Delete this content?')) return;
    try {
      const res = await fetch(`/api/admin/contents/${contentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        refreshData();
        alert('✅ Content deleted');
      }
    } catch (err) {
      alert('❌ Error deleting content');
    }
  };

  // ✅ Bulk delete
  const handleBulkDelete = async () => {
    if (selectedContents.size === 0) {
      alert('❌ Please select at least one content');
      return;
    }
    if (!confirm(`⚠️ Delete ${selectedContents.size} contents? This cannot be undone!`)) return;

    try {
      const res = await fetch(`/api/admin/contents/bulk-delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content_ids: Array.from(selectedContents)
        })
      });
      if (res.ok) {
        const data = await res.json();
        refreshData();
        setSelectedContents(new Set());
        alert(`✅ ${data.deleted_count} contents deleted`);
      } else {
        const error = await res.json();
        alert(`❌ Error: ${error.detail}`);
      }
    } catch (err) {
      alert('❌ Error deleting contents');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className={`p-8 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          📄 Content Management ({filteredContents.length})
        </h1>

        {/* Filters & Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Search title & body..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          {/* Language Filter */}
          <select
            value={filters.language}
            onChange={(e) => setFilters({ ...filters, language: e.target.value })}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">All Languages</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          {/* User Filter */}
          <select
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value ? Number(e.target.value) : '' })}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>

          {/* Bulk Delete Button */}
          {selectedContents.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold col-span-full md:col-span-1"
            >
              🗑️ Delete {selectedContents.size}
            </button>
          )}
        </div>
      </div>

      {/* Contents Table */}
      <div className={`rounded-lg shadow-lg overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}>
              <tr>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  <input
                    type="checkbox"
                    checked={selectedContents.size === filteredContents.length && filteredContents.length > 0}
                    onChange={toggleAllSelection}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  Title
                </th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  Owner
                </th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  Language
                </th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  Created
                </th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredContents.map((content) => (
                <tr key={content.id} className={`border-t ${isDarkMode ? 'border-slate-700 hover:bg-slate-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedContents.has(content.id)}
                      onChange={() => toggleContentSelection(content.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {content.title}
                  </td>
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {users.find(u => u.id === content.user_id)?.username || 'Unknown'}
                  </td>
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {content.language}
                  </td>
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      content.status === 'published' ? 'bg-green-600 text-white' :
                      content.status === 'draft' ? 'bg-yellow-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {content.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {new Date(content.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteContent(content.id)}
                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      title="Delete content"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* No results */}
      {filteredContents.length === 0 && (
        <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No contents found matching your filters
        </div>
      )}
    </div>
  );
};