import React from 'react';
import { useAdmin } from '../../context/AdminContext';

export const TemplateManagement: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const { templates, loading, refreshData } = useAdmin();
  const token = localStorage.getItem('access_token');

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('Delete this template?')) return;
    try {
      const res = await fetch(`http://localhost:8118/admin/templates/${templateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        refreshData();
        alert('Template deleted');
      }
    } catch (err) {
      alert('Error deleting template');
    }
  };

  const defaultTemplates = templates.filter(t => t.is_default);
  const customTemplates = templates.filter(t => !t.is_default);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className={`p-8 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        📚 Template Management
      </h1>

      {/* Default Templates */}
      <div className="mb-12">
        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          🔧 Default Templates
        </h2>
        <div className={`rounded-lg shadow-lg overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    Name
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    Category
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    Language
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {defaultTemplates.map((template) => (
                  <tr key={template.id} className={`border-t ${isDarkMode ? 'border-slate-700 hover:bg-slate-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {template.name}
                    </td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {template.category}
                    </td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {template.language.toUpperCase()}
                    </td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="text-blue-500">🔒 System</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Custom Templates */}
      <div>
        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          ✨ Custom Templates ({customTemplates.length})
        </h2>
        {customTemplates.length === 0 ? (
          <div className={`p-8 rounded-lg text-center ${isDarkMode ? 'bg-slate-800 text-gray-400' : 'bg-white text-gray-600'}`}>
            No custom templates yet
          </div>
        ) : (
          <div className={`rounded-lg shadow-lg overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      Name
                    </th>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      Category
                    </th>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      Language
                    </th>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      Owner
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
                  {customTemplates.map((template) => (
                    <tr key={template.id} className={`border-t ${isDarkMode ? 'border-slate-700 hover:bg-slate-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {template.name}
                      </td>
                      <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {template.category}
                      </td>
                      <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {template.language.toUpperCase()}
                      </td>
                      <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {template.owner_username}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(template.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};