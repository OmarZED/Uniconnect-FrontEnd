
import React, { useState } from 'react';
import { UserDto, UserRole, getRoleLabel } from '../types';
import { Search, MapPin, UserPlus, MessageCircle, Shield, Briefcase, GraduationCap, Sparkles } from 'lucide-react';

interface UserManagementProps {
  users: UserDto[];
  setUsers: React.Dispatch<React.SetStateAction<UserDto[]>>;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
        case UserRole.DEAN:
            return 'bg-red-100 text-red-900 border-red-200';
        case UserRole.TEACHER:
            return 'bg-stone-200 text-stone-700 border-stone-300';
        case UserRole.DEPARTMENT_MANAGER:
            return 'bg-orange-100 text-orange-700 border-orange-200';
        default:
            return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  const getGradient = (userId: string) => {
      // Deterministic random gradient based on ID length for consistency
      const gradients = [
          'from-red-900 to-red-800',
          'from-stone-800 to-stone-600',
          'from-orange-800 to-amber-700',
          'from-stone-700 to-stone-500',
          'from-red-800 to-stone-700'
      ];
      const index = userId.length % gradients.length;
      return gradients[index];
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      {/* Header & Search Section */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-red-900 font-bold text-xs uppercase tracking-widest mb-4">
            <Sparkles size={12} /> Community Hub
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight mb-4">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-900 to-stone-700">People</span>
        </h2>
        <p className="text-stone-500 text-lg font-medium mb-8">Connect with students, professors, and staff across campus.</p>
        
        <div className="relative group z-20">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-900 to-stone-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
            <div className="relative bg-white rounded-2xl shadow-xl flex items-center p-2">
                <Search className="text-stone-400 ml-4" size={24} />
                <input 
                    type="text" 
                    placeholder="Search by name, role, or email..." 
                    className="w-full p-4 text-lg font-medium text-stone-700 placeholder:text-stone-300 outline-none bg-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="hidden md:flex items-center gap-2 pr-2">
                     <select 
                        className="bg-stone-50 text-sm font-bold text-stone-600 py-2.5 px-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-red-100 outline-none cursor-pointer hover:bg-stone-100 transition-colors"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                     >
                        <option value="all">All Roles</option>
                        <option value={UserRole.STUDENT}>Students</option>
                        <option value={UserRole.TEACHER}>Teachers</option>
                        <option value={UserRole.DEAN}>Deans</option>
                        <option value={UserRole.DEPARTMENT_MANAGER}>Staff</option>
                     </select>
                </div>
            </div>
        </div>

        {/* Mobile Filter (Visible only on small screens) */}
        <div className="md:hidden mt-4 flex justify-center">
            <select 
                className="bg-white text-sm font-bold text-stone-600 py-3 px-6 rounded-xl border border-stone-200 shadow-sm w-full"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                >
                <option value="all">All Roles</option>
                <option value={UserRole.STUDENT}>Students</option>
                <option value={UserRole.TEACHER}>Teachers</option>
                <option value={UserRole.DEAN}>Deans</option>
            </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group relative">
            
            {/* Cover Photo (Generated Gradient) */}
            <div className={`h-24 bg-gradient-to-r ${getGradient(user.id)} relative`}>
                <div className="absolute inset-0 bg-black/5"></div>
            </div>

            <div className="px-6 pb-6 flex-1 flex flex-col relative">
                {/* Avatar */}
                <div className="-mt-12 mb-3 relative inline-block self-start">
                    <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-md rotate-3 group-hover:rotate-0 transition-transform duration-300">
                         <div className="w-full h-full rounded-xl bg-stone-100 overflow-hidden flex items-center justify-center text-2xl font-black text-stone-300">
                            {user.profilePictureUrl ? (
                                <img src={user.profilePictureUrl} alt={user.firstName} className="w-full h-full object-cover" />
                            ) : (
                                user.firstName?.charAt(0)
                            )}
                         </div>
                    </div>
                    <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-white ${user.isActive ? 'bg-red-400' : 'bg-stone-300'}`}></div>
                </div>

                {/* Info */}
                <div className="mb-4">
                    <div className="flex justify-between items-start mb-1">
                         <h3 className="font-black text-xl text-stone-800 leading-tight">{user.fullName}</h3>
                         <span className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded-lg border ${getRoleBadgeStyle(user.role)}`}>
                            {getRoleLabel(user.role)}
                        </span>
                    </div>
                    <p className="text-sm text-stone-500 font-medium flex items-center gap-1.5 mb-2">
                        <GraduationCap size={14} className="text-stone-400"/>
                        {user.facultyName || 'General Studies'}
                    </p>
                    {user.bio ? (
                        <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">{user.bio}</p>
                    ) : (
                        <p className="text-sm text-stone-400 italic">No bio available.</p>
                    )}
                </div>

                {/* Stats / Details */}
                <div className="mt-auto pt-4 border-t border-stone-50 flex items-center gap-4 mb-4 text-xs font-bold text-stone-500">
                    {user.studentGroupName && (
                        <span className="flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-md">
                            <MapPin size={12} /> {user.studentGroupName}
                        </span>
                    )}
                    <span className="ml-auto text-stone-400">Joined {new Date(user.createdAt || '').getFullYear()}</span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-bold hover:bg-stone-800 transition-colors shadow-lg shadow-stone-200">
                        <UserPlus size={16} /> Connect
                    </button>
                    <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-50 text-stone-700 text-sm font-bold border border-stone-200 hover:bg-white hover:border-stone-300 transition-all">
                        <MessageCircle size={16} /> Message
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
          <div className="text-center py-20">
              <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={40} className="text-stone-300" />
              </div>
              <h3 className="text-xl font-bold text-stone-800">No users found</h3>
              <p className="text-stone-500">Try adjusting your search terms or filters.</p>
          </div>
      )}
    </div>
  );
};
