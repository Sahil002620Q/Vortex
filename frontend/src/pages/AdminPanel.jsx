import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const approveUser = async (userId) => {
        try {
            await axios.post(`/api/admin/users/${userId}/approve`);
            fetchUsers();
        } catch (err) {
            alert("Failed to approve");
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-secondary">Admin Control Center</h1>

            <div className="glass-panel p-6 rounded-3xl border border-white/10">
                <h2 className="text-xl font-bold mb-6">User Management</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-slate-400 text-xs uppercase border-b border-white/10">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white">{user.username}</div>
                                        <div className="text-sm text-slate-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 capitalize text-slate-300">{user.role}</td>
                                    <td className="px-6 py-4">
                                        {user.is_approved ? (
                                            <span className="text-emerald-400 font-bold text-xs">Approved</span>
                                        ) : (
                                            <span className="text-yellow-500 font-bold text-xs">Pending</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {!user.is_approved && user.role === 'seller' && (
                                            <button
                                                onClick={() => approveUser(user.id)}
                                                className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                                            >
                                                Approve
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
