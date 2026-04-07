
import React from 'react';
import { UserDto, UserRole } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  MessageSquare, 
  Flag, 
  Settings,
  LogOut,
  GraduationCap,
  User,
  Bell,
  Globe
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser?: UserDto;
  onLogout?: () => void;
  notificationCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentUser, onLogout, notificationCount = 0 }) => {
  
  const isAdmin = currentUser && currentUser.role !== UserRole.STUDENT;
  const isStudent = currentUser?.role === UserRole.STUDENT;
  const isTeacher = currentUser?.role === UserRole.TEACHER;

  const menuItems = [
    { id: 'community', label: 'Community Feed', icon: MessageSquare },
    { id: 'discover', label: 'Discover Communities', icon: Globe },
    ...(isAdmin ? [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'academics-manage', label: 'Academics', icon: GraduationCap },
        { id: 'users', label: 'People', icon: Users },
        { id: 'reports', label: 'Reports', icon: Flag },
    ] : []),
    ...(isTeacher ? [
        { id: 'tasks', label: 'Tasks', icon: BookOpen },
    ] : []),
    ...(isStudent ? [
        { id: 'subjects', label: 'My Subjects', icon: GraduationCap },
        { id: 'my-academics', label: 'My Studies', icon: BookOpen },
    ] : []),
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: notificationCount },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <div className="w-72 bg-white/90 backdrop-blur-md border-r border-stone-200 flex flex-col h-screen sticky top-0 z-30">
      <div className="p-8 pb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
            <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-tr from-red-900 to-red-800 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-200/50 rotate-3">
                    U
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-stone-300 rounded-full border-2 border-white"></div>
            </div>
            <div>
                <h1 className="text-xl font-black text-stone-900 tracking-tight leading-none">UniConnect</h1>
                <div className="flex items-center gap-1.5 mt-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-800 to-red-600 uppercase tracking-widest">Live Campus</span>
                </div>
            </div>
        </div>
      </div>

      {currentUser && (
        <button 
            onClick={() => setActiveTab('profile')}
            className="mx-6 mb-8 p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-center gap-3 group cursor-pointer hover:bg-stone-100 transition-colors text-left w-[calc(100%-3rem)] flex-shrink-0"
        >
             <div className="w-12 h-12 rounded-full bg-white border-2 border-white shadow-md flex items-center justify-center text-stone-700 text-lg font-bold overflow-hidden relative flex-shrink-0">
                {currentUser.profilePictureUrl ? (
                    <img src={currentUser.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="bg-gradient-to-br from-stone-100 to-stone-200 w-full h-full flex items-center justify-center">
                        {(currentUser.firstName || 'U').charAt(0)}
                    </div>
                )}
             </div>
             <div className="overflow-hidden">
                 <p className="text-sm font-bold text-stone-900 truncate group-hover:text-red-900 transition-colors">{currentUser.firstName} {currentUser.lastName}</p>
                 <p className="text-[11px] text-stone-500 font-semibold">
                    {isAdmin ? 'Admin Access' : 'Student'}
                 </p>
             </div>
        </button>
      )}

      <div className="px-6 mb-2 flex-shrink-0">
          <p className="text-xs font-extrabold text-stone-400 uppercase tracking-widest px-2 mb-2">Explore</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden flex-shrink-0 ${
                isActive 
                  ? 'bg-gradient-to-r from-red-900 to-red-800 text-white shadow-lg shadow-red-200/50' 
                  : 'hover:bg-stone-50 text-stone-500 hover:text-stone-900'
              }`}
            >
              <Icon size={22} className={`${isActive ? 'text-white' : 'text-stone-400 group-hover:text-red-800'} transition-colors relative z-10`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`font-bold text-sm relative z-10 ${isActive ? 'tracking-wide' : ''}`}>{item.label}</span>
              
              {item.badge && item.badge > 0 && (
                  <span className={`ml-auto px-2 py-0.5 rounded-md text-[10px] font-black relative z-10 ${isActive ? 'bg-white text-red-900' : 'bg-red-600 text-white shadow-md shadow-red-200'}`}>
                      {item.badge}
                  </span>
              )}

              {isActive && (
                  <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white/20 to-transparent pointer-events-none"></div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-6 mt-auto border-t border-stone-200 flex-shrink-0">
        <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 text-stone-400 hover:text-stone-900 transition-colors group font-semibold"
        >
            <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
            <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};


