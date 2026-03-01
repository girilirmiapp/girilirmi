"use client"; 
import React, { useState, useEffect } from 'react'; 
import Link from 'next/link'; 
import { Users, LayoutDashboard, FileText, Activity, UserCheck, Database, Search, Filter, MoreVertical, LogIn, LogOut, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

// Önceki tasarımdan temel türler ve arayüzler
type Tab = 'dashboard' | 'users' | 'content' | 'logs';
interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'user';
}

export default function AdminDashboard() { 
  const [isLoading, setIsLoading] = useState(true); 
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    // Mock data to simulate fetching users and prevent build errors
    const mockUsers: UserProfile[] = [
      { id: '1', full_name: 'Admin User', email: 'admin@example.com', role: 'admin' },
      { id: '2', full_name: 'Test User 1', email: 'test1@example.com', role: 'user' },
    ];
    setUsers(mockUsers);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <RefreshCcw className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-200">
      <aside className="w-64 flex-shrink-0 border-r border-gray-800 bg-gray-900/50 flex flex-col">
        <div className="flex h-20 items-center justify-center border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-600/20">G</div>
            <span className="font-bold text-xl tracking-tight">Admin Panel</span>
          </div>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          <button className="w-full flex items-center gap-3 rounded-lg p-3 text-sm font-medium bg-indigo-600/10 text-indigo-300">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          <button className="w-full flex items-center gap-3 rounded-lg p-3 text-sm font-medium text-gray-400 hover:bg-gray-800/50 hover:text-gray-200">
            <Users size={18} />
            <span>Users</span>
          </button>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button className="w-full flex items-center justify-center gap-2 rounded-lg p-2 text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 flex items-center gap-6">
            <div className="h-12 w-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-400"><Users size={24} /></div>
            <div>
              <p className="text-sm text-gray-400">Total Users</p>
              <p className="text-3xl font-bold">{users.length}</p>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4">User Management</h2>
        <div className="rounded-2xl border border-gray-800 bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-gray-800/30">
                <tr>
                  <th scope="col" className="px-6 py-3">User</th>
                  <th scope="col" className="px-6 py-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-medium">
                      <p>{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-300'}`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}