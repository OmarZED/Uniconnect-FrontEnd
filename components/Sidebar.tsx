
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
    <div className="w-72 bg-white border-r border-stone-200 flex flex-col h-screen sticky top-0 z-30">
      <div className="px-6 pt-7 pb-5 flex-shrink-0">
        <div className="flex items-center gap-3">
            <div className="relative">
                <div className="w-10 h-10 bg-red-900 rounded-xl flex items-center justify-center text-white font-black text-xl">
                    U
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-stone-300 rounded-full border-2 border-white"></div>
            </div>
            <div>
                <h1 className="text-xl font-black text-stone-900 tracking-tight leading-none">UniConnect</h1>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500">Campus Portal</p>
            </div>
        </div>
      </div>

      {currentUser && (
        <button 
            onClick={() => setActiveTab('profile')}
            className="mx-4 mb-6 p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3 group cursor-pointer hover:bg-stone-100 transition-colors text-left w-[calc(100%-2rem)] flex-shrink-0"
        >
             <div className="w-11 h-11 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-700 text-lg font-bold overflow-hidden relative flex-shrink-0">
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
                 <p className="text-[11px] text-stone-500 font-medium">
                    {isAdmin ? 'Admin Access' : isTeacher ? 'Teacher' : 'Student'}
                 </p>
             </div>
        </button>
      )}

      <div className="px-4 mb-2 flex-shrink-0">
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-[0.12em] px-3 mb-2">Navigation</p>
      </div>

      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group relative overflow-hidden flex-shrink-0 ${
                isActive 
                  ? 'bg-red-900 text-white' 
                  : 'hover:bg-stone-50 text-stone-500 hover:text-stone-900'
              }`}
            >
              <Icon size={19} className={`${isActive ? 'text-white' : 'text-stone-400 group-hover:text-stone-700'} transition-colors relative z-10`} strokeWidth={2} />
              <span className={`font-bold text-sm relative z-10 ${isActive ? 'tracking-wide' : ''}`}>{item.label}</span>
              
              {item.badge && item.badge > 0 && (
                  <span className={`ml-auto px-2 py-0.5 rounded-md text-[10px] font-black relative z-10 ${isActive ? 'bg-white text-red-900' : 'bg-red-600 text-white shadow-md shadow-red-200'}`}>
                      {item.badge}
                  </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-stone-200 flex-shrink-0">
        <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 text-stone-500 hover:text-stone-900 transition-colors group font-medium"
        >
            <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
            <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};


