import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User, UserCreate } from '../types';
import { Role } from '../types';
const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState<UserCreate>({ email: '', password: '', role: Role.ANALYST, full_name: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUser(newUser);
      setShowForm(false);
      setNewUser({ email: '', password: '', role: Role.ANALYST, full_name: '' });
      fetchUsers();
    } catch (e) {
      alert("Failed to create user");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-600 text-white px-4 py-2 rounded text-sm hover:bg-brand-700"
        >
          {showForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded shadow mb-6 border border-slate-200">
          <h3 className="text-lg font-medium mb-4">Create New User</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <input 
               type="text" placeholder="Name" className="border p-2 rounded" 
               value={newUser.full_name || ''} onChange={e => setNewUser({...newUser, full_name: e.target.value})} 
               required
             />
             <input 
               type="email" placeholder="Email" className="border p-2 rounded" 
               value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} 
               required
             />
             <input 
               type="password" placeholder="Password" className="border p-2 rounded" 
               value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} 
               required
             />
             <select 
               className="border p-2 rounded bg-white"
               value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as Role})}
             >
               {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
             </select>
             <div className="md:col-span-2">
               <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded text-sm">Save User</button>
             </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map(u => (
              <tr key={u.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{u.full_name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                     ${u.role === Role.ADMIN ? 'bg-purple-100 text-purple-800' : 
                       u.role === Role.PARTNER ? 'bg-green-100 text-green-800' : 
                       'bg-blue-100 text-blue-800'}`}>
                     {u.role}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">#{u.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
