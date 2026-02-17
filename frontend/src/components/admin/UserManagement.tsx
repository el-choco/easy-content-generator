import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';

interface EditModalData {
  userId: number;
  username: string;
  email: string;
}

interface ResetPasswordModalData {
  userId: number;
  newPassword: string;
  confirmPassword: string;
}

const API_BASE = '/api'; // ✅ Nutzt den Vite Proxy!

export const UserManagement: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const { users, loading, refreshData } = useAdmin();
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [editModal, setEditModal] = useState<EditModalData | null>(null);
  const [resetPasswordModal, setResetPasswordModal] = useState<ResetPasswordModalData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const token = localStorage.getItem('access_token');

  // Filter users by search term
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Checkbox handlers
  const toggleUserSelection = (userId: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  // Edit User
  const handleEditUser = async () => {
    if (!editModal) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${editModal.userId}`, { // ✅ /api prefix
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          username: editModal.username,
          email: editModal.email
        }).toString()
      });
      if (res.ok) {
        refreshData();
        setEditModal(null);
        alert('✅ User updated successfully');
      } else {
        const error = await res.json();
        alert(`❌ Error: ${error.detail}`);
      }
    } catch (err) {
      alert('❌ Error updating user');
    }
  };

  // Reset Password
  const handleResetPassword = async () => {
    if (!resetPasswordModal) return;
    if (resetPasswordModal.newPassword !== resetPasswordModal.confirmPassword) {
      alert('❌ Passwords do not match');
      return;
    }
    if (resetPasswordModal.newPassword.length < 6) {
      alert('❌ Password must be at least 6 characters');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/admin/users/${resetPasswordModal.userId}/reset-password`, { // ✅ /api prefix
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          new_password: resetPasswordModal.newPassword
        }).toString()
      });
      if (res.ok) {
        setResetPasswordModal(null);
        alert('✅ Password reset successfully');
      } else {
        const error = await res.json();
        alert(`❌ Error: ${error.detail}`);
      }
    } catch (err) {
      alert('❌ Error resetting password');
    }
  };

  // Toggle Active
  const handleToggleActive = async (userId: number) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/toggle-active`, { // ✅ /api prefix
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      alert('❌ Error updating user');
    }
  };

  // Toggle Admin
  const handleToggleAdmin = async (userId: number) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/toggle-admin`, { // ✅ /api prefix
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      alert('❌ Error updating user');
    }
  };

  // Delete Single User
  const handleDeleteUser = async (userId: number) => {
    if (!confirm('⚠️ Are you sure? This will delete the user and all their content!')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, { // ✅ /api prefix
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        refreshData();
        alert('✅ User deleted');
      }
    } catch (err) {
      alert('❌ Error deleting user');
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) {
      alert('❌ Please select at least one user');
      return;
    }
    if (!confirm(`⚠️ Delete ${selectedUsers.size} users? This cannot be undone!`)) return;

    try {
      const res = await fetch(`${API_BASE}/admin/users/bulk-delete`, { // ✅ /api prefix
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_ids: Array.from(selectedUsers)
        })
      });
      if (res.ok) {
        const data = await res.json();
        refreshData();
        setSelectedUsers(new Set());
        alert(`✅ ${data.deleted_count} users deleted`);
      } else {
        const error = await res.json();
        alert(`❌ Error: ${error.detail}`);
      }
    } catch (err) {
      alert('❌ Error deleting users');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className={`p-8 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          👥 User Management ({filteredUsers.length})
        </h1>

        {/* Search Bar */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="🔍 Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`flex-1 px-4 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          {selectedUsers.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              🗑️ Delete {selectedUsers.size}
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className={`rounded-lg shadow-lg overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}>
              <tr>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleAllSelection}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  Username
                </th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  Email
                </th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  Content
                </th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className={`border-t ${isDarkMode ? 'border-slate-700 hover:bg-slate-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user.username}
                    {user.is_admin && <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-1 rounded">🛡️ ADMIN</span>}
                  </td>
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {user.email}
                  </td>
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {user.stats.total_content} ({user.stats.published} pub, {user.stats.drafts} draft)
                  </td>
                  <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {user.is_active ? <span className="text-green-500 font-semibold">✅ Active</span> : <span className="text-red-500 font-semibold">❌ Inactive</span>}
                  </td>
                  <td className="px-6 py-4 flex gap-1 flex-wrap">
                    <button
                      onClick={() => setEditModal({ userId: user.id, username: user.username, email: user.email })}
                      className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                      title="Edit user"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => setResetPasswordModal({ userId: user.id, newPassword: '', confirmPassword: '' })}
                      className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded"
                      title="Reset password"
                    >
                      🔐 Reset PW
                    </button>
                    <button
                      onClick={() => handleToggleActive(user.id)}
                      className={`text-xs text-white px-2 py-1 rounded ${user.is_active ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
                      title={user.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {user.is_active ? '⏸️ Deactivate' : '▶️ Activate'}
                    </button>
                    <button
                      onClick={() => handleToggleAdmin(user.id)}
                      className={`text-xs text-white px-2 py-1 rounded ${user.is_admin ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-purple-500 hover:bg-purple-600'}`}
                      title={user.is_admin ? 'Remove Admin' : 'Make Admin'}
                    >
                      {user.is_admin ? '👤 Remove' : '🛡️ Make Admin'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                      title="Delete user"
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

      {/* Edit User Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg p-8 max-w-md w-full ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ✏️ Edit User
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  Username
                </label>
                <input
                  type="text"
                  value={editModal.username}
                  onChange={(e) => setEditModal({ ...editModal, username: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  Email
                </label>
                <input
                  type="email"
                  value={editModal.email}
                  onChange={(e) => setEditModal({ ...editModal, email: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleEditUser}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
              >
                ✅ Save
              </button>
              <button
                onClick={() => setEditModal(null)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg p-8 max-w-md w-full ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🔐 Reset Password
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  New Password
                </label>
                <input
                  type="password"
                  value={resetPasswordModal.newPassword}
                  onChange={(e) => setResetPasswordModal({ ...resetPasswordModal, newPassword: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  placeholder="Min. 6 characters"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={resetPasswordModal.confirmPassword}
                  onChange={(e) => setResetPasswordModal({ ...resetPasswordModal, confirmPassword: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  placeholder="Confirm password"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleResetPassword}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg"
              >
                ✅ Reset
              </button>
              <button
                onClick={() => setResetPasswordModal(null)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};