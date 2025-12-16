import React, { useEffect, useState } from 'react';
import { api } from '../lib/supabase';
import { LogOut, Users, MessageSquare, Shield, Activity, Calendar } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  usage_type: string;
  created_at: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalChats: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const profiles = await api.getAllUsers();
        const chatCount = await api.getAllChatsCount();

        setUsers(profiles || []);
        setStats({
            totalUsers: profiles?.length || 0,
            totalChats: chatCount || 0
        });

    } catch (error) {
        console.error("Admin fetch error:", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#131314] text-gray-900 dark:text-[#E3E3E3] flex flex-col font-sans">
       {/* Header */}
       <header className="bg-white dark:bg-[#1E1F20] border-b border-gray-200 dark:border-[#444746]/50 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Shield size={24} />
             </div>
             <div>
                <h1 className="text-xl font-bold tracking-tight">Admin Console</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">System Overview</p>
             </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
             <LogOut size={16} />
             Logout
          </button>
       </header>

       <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard 
                icon={<Users size={24} />} 
                label="Total Users" 
                value={stats.totalUsers} 
                color="blue"
              />
              <StatsCard 
                icon={<MessageSquare size={24} />} 
                label="Total Chat Sessions" 
                value={stats.totalChats} 
                color="purple"
              />
               <StatsCard 
                icon={<Activity size={24} />} 
                label="System Status" 
                value="Online" 
                color="green"
                isText
              />
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#444746]/50 rounded-2xl overflow-hidden shadow-sm">
             <div className="px-6 py-5 border-b border-gray-200 dark:border-[#444746]/50 flex justify-between items-center bg-gray-50/50 dark:bg-[#1E1F20]">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Users size={18} className="text-gray-400" />
                    Registered Users
                </h2>
                <button onClick={fetchData} className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-md transition-colors">
                    Refresh List
                </button>
             </div>
             
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                   <thead className="bg-gray-50 dark:bg-[#131314] text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-[#444746]/30">
                      <tr>
                         <th className="px-6 py-3 font-semibold tracking-wide">User</th>
                         <th className="px-6 py-3 font-semibold tracking-wide">Email</th>
                         <th className="px-6 py-3 font-semibold tracking-wide">Usage Type</th>
                         <th className="px-6 py-3 font-semibold tracking-wide">Joined</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-200 dark:divide-[#444746]/30">
                      {isLoading ? (
                         <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Loading data...</td></tr>
                      ) : users.length === 0 ? (
                         <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No users found in database.</td></tr>
                      ) : (
                         users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-[#252628] transition-colors group">
                               <td className="px-6 py-4 font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {user.first_name} {user.last_name}
                               </td>
                               <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                  {user.email}
                               </td>
                               <td className="px-6 py-4">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize tracking-wide
                                    ${user.usage_type === 'business' 
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-transparent' 
                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-transparent'}
                                  `}>
                                     {user.usage_type || 'Personal'}
                                  </span>
                               </td>
                               <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                                  <div className="flex items-center gap-1.5">
                                     <Calendar size={14} />
                                     {new Date(user.created_at).toLocaleDateString()}
                                  </div>
                               </td>
                            </tr>
                         ))
                      )}
                   </tbody>
                </table>
             </div>
          </div>

       </main>
    </div>
  );
};

const StatsCard = ({ icon, label, value, color, isText = false }: any) => {
    const colors: any = {
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    };

    return (
        <div className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#444746]/50 rounded-2xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-xl ${colors[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                <p className={`text-3xl font-bold text-gray-900 dark:text-white mt-1 ${isText ? 'text-xl' : ''}`}>
                    {value}
                </p>
            </div>
        </div>
    )
}