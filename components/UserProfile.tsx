
import React, { useState, useEffect } from 'react';
import { UserDto, UpdateProfileDto, getRoleLabel, FacultyDto, CourseDto, StudentGroupDto } from '../types';
import { authService, academicService } from '../services/api';
import { 
  Camera, 
  MapPin, 
  Calendar, 
  Mail, 
  Briefcase, 
  Pencil, 
  Save, 
  X, 
  Loader2,
  GraduationCap,
  BookOpen,
  Lock
} from 'lucide-react';

interface UserProfileProps {
  user: UserDto;
  onUpdate: (updatedUser: UserDto) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data for Dropdowns
  const [faculties, setFaculties] = useState<FacultyDto[]>([]);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [groups, setGroups] = useState<StudentGroupDto[]>([]);

  const [formData, setFormData] = useState<UpdateProfileDto>({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    bio: user.bio || '',
    profilePictureUrl: user.profilePictureUrl || '',
    facultyId: user.facultyId || '',
    courseId: user.courseId || '',
    studentGroupId: user.studentGroupId || ''
  });

  useEffect(() => {
      // Refresh form data when user prop changes (e.g. after update)
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        profilePictureUrl: user.profilePictureUrl || '',
        facultyId: user.facultyId || '',
        courseId: user.courseId || '',
        studentGroupId: user.studentGroupId || ''
      });
  }, [user]);

  useEffect(() => {
      if (isEditing) {
          const loadAcademicData = async () => {
              const [f, c, g] = await Promise.all([
                  academicService.getFaculties(),
                  academicService.getCourses(),
                  academicService.getStudentGroups()
              ]);
              if(f.success) setFaculties(f.data || []);
              if(c.success) setCourses(c.data || []);
              if(g.success) setGroups(g.data || []);
          };
          loadAcademicData();
      }
  }, [isEditing]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
        const res = await authService.updateProfile(formData);
        if (res.success && res.data) {
            onUpdate(res.data);
            setIsEditing(false);
        } else {
            alert('Failed to update profile: ' + res.message);
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred');
    } finally {
        setIsLoading(false);
    }
  };

  const getRoleBadgeColor = () => {
    switch (user.role) {
        case 3: return 'from-red-900 to-red-800'; // Dean
        case 1: return 'from-stone-800 to-stone-700'; // Teacher
        case 2: return 'from-orange-800 to-orange-700'; // Manager
        default: return 'from-stone-600 to-stone-500'; // Student
    }
  };

  // Filter courses based on selected faculty if any
  const filteredCourses = formData.facultyId 
      ? courses.filter(c => c.facultyId === formData.facultyId)
      : courses;

  // Filter groups based on selected course if any
  const filteredGroups = formData.courseId
      ? groups.filter(g => g.courseId === formData.courseId)
      : groups;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-stone-200/50 border border-stone-100 overflow-hidden relative">
        
        {/* Cover Photo */}
        <div className={`h-64 w-full bg-gradient-to-r ${getRoleBadgeColor()} relative`}>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-stone-900/40 to-transparent"></div>
        </div>

        {/* Profile Content */}
        <div className="px-8 pb-8 relative">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start justify-between gap-6 -mt-20 mb-8">
                <div className="flex flex-col md:flex-row items-end md:items-end gap-6">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-3xl bg-white p-1.5 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-300">
                            <div className="w-full h-full rounded-2xl bg-stone-100 overflow-hidden flex items-center justify-center text-4xl font-black text-stone-300 relative">
                                {formData.profilePictureUrl ? (
                                    <img src={formData.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user.firstName?.charAt(0)
                                )}
                            </div>
                        </div>
                        {isEditing && (
                             <div className="absolute -bottom-2 -right-2 bg-red-900 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-red-800 transition-colors">
                                <Camera size={20} />
                             </div>
                        )}
                    </div>

                    {/* Name & Role */}
                    <div className="mb-2">
                        <h1 className="text-4xl font-black text-stone-900 tracking-tight mb-2">{user.fullName}</h1>
                        <div className="flex items-center gap-2">
                             <span className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-widest bg-gradient-to-r ${getRoleBadgeColor()}`}>
                                {getRoleLabel(user.role)}
                             </span>
                             <span className="flex items-center gap-1 text-stone-500 font-bold text-sm bg-stone-50 px-3 py-1 rounded-full border border-stone-100">
                                <GraduationCap size={14} /> {user.facultyName || 'No Faculty'}
                             </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-20 md:mt-0 flex gap-3">
                    {!isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all hover:-translate-y-1 shadow-lg shadow-stone-200"
                        >
                            <Pencil size={18} /> Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-3 bg-white text-stone-700 border border-stone-200 rounded-xl font-bold hover:bg-stone-50 transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-6 py-3 bg-red-900 text-white rounded-xl font-bold hover:bg-red-800 transition-all shadow-lg shadow-red-200"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />} Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Details */}
                <div className="space-y-6">
                    <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Contact Info</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-stone-700 font-medium">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-stone-400 shadow-sm">
                                    <Mail size={16} />
                                </div>
                                <span className="truncate">{user.email}</span>
                            </li>
                            <li className="flex items-center gap-3 text-stone-700 font-medium">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-stone-400 shadow-sm">
                                    <Calendar size={16} />
                                </div>
                                <span>Joined {new Date(user.createdAt || Date.now()).getFullYear()}</span>
                            </li>
                             <li className="flex items-center gap-3 text-stone-700 font-medium">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-stone-400 shadow-sm">
                                    <Briefcase size={16} />
                                </div>
                                <span>{user.studentGroupName || 'No Group'}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Column: Bio & Edit Form */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Bio Section */}
                    <div className="bg-white rounded-2xl">
                        <h3 className="text-lg font-black text-stone-900 mb-4 flex items-center gap-2">
                            Personal Details
                        </h3>
                        
                        {isEditing ? (
                             <form className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">First Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                            className="w-full p-3 bg-stone-50 border-2 border-transparent focus:bg-white focus:border-red-900 rounded-xl font-bold outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Last Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                            className="w-full p-3 bg-stone-50 border-2 border-transparent focus:bg-white focus:border-red-900 rounded-xl font-bold outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                     <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Profile Image URL</label>
                                     <input 
                                        type="text" 
                                        value={formData.profilePictureUrl || ''}
                                        onChange={(e) => setFormData({...formData, profilePictureUrl: e.target.value})}
                                        placeholder="https://..."
                                        className="w-full p-3 bg-stone-50 border-2 border-transparent focus:bg-white focus:border-red-900 rounded-xl font-medium text-sm outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Bio</label>
                                    <textarea 
                                        rows={4}
                                        value={formData.bio || ''}
                                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                        className="w-full p-3 bg-stone-50 border-2 border-transparent focus:bg-white focus:border-red-900 rounded-xl font-medium text-stone-700 leading-relaxed outline-none transition-all resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>

                                <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
                                    <h4 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                                        <GraduationCap size={18} /> Academic Information
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* FACULTY SELECT */}
                                        <div className="relative">
                                            <label className="block text-xs font-bold text-red-800 uppercase mb-1">Faculty</label>
                                            <select 
                                                value={formData.facultyId || ''}
                                                onChange={(e) => setFormData({...formData, facultyId: e.target.value, courseId: '', studentGroupId: ''})} // Reset dependents
                                                disabled={!!user.facultyId} // Locked if already set
                                                className={`w-full p-3 rounded-xl font-bold outline-none appearance-none border-2 ${
                                                    !!user.facultyId 
                                                    ? 'bg-stone-100 text-stone-500 border-transparent cursor-not-allowed' 
                                                    : 'bg-white border-transparent focus:border-red-900 text-stone-800'
                                                }`}
                                            >
                                                <option value="">Select Faculty...</option>
                                                {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                            </select>
                                            {!!user.facultyId && <Lock size={14} className="absolute right-3 bottom-4 text-stone-400" />}
                                        </div>

                                        {/* COURSE SELECT */}
                                        <div className="relative">
                                            <label className="block text-xs font-bold text-red-800 uppercase mb-1">Course</label>
                                            <select 
                                                value={formData.courseId || ''}
                                                onChange={(e) => setFormData({...formData, courseId: e.target.value, studentGroupId: ''})} // Reset dependent
                                                disabled={!!user.courseId || !formData.facultyId} // Locked if set OR no faculty selected
                                                className={`w-full p-3 rounded-xl font-bold outline-none appearance-none border-2 ${
                                                    (!!user.courseId || !formData.facultyId)
                                                    ? 'bg-stone-100 text-stone-500 border-transparent cursor-not-allowed' 
                                                    : 'bg-white border-transparent focus:border-red-900 text-stone-800'
                                                }`}
                                            >
                                                <option value="">Select Course...</option>
                                                {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                            {!!user.courseId && <Lock size={14} className="absolute right-3 bottom-4 text-stone-400" />}
                                        </div>

                                        {/* STUDENT GROUP SELECT */}
                                        <div className="relative md:col-span-2">
                                            <label className="block text-xs font-bold text-red-800 uppercase mb-1">Student Group</label>
                                            <select 
                                                value={formData.studentGroupId || ''}
                                                onChange={(e) => setFormData({...formData, studentGroupId: e.target.value})}
                                                disabled={!!user.studentGroupId || !formData.courseId} // Locked if set OR no course selected
                                                className={`w-full p-3 rounded-xl font-bold outline-none appearance-none border-2 ${
                                                    (!!user.studentGroupId || !formData.courseId)
                                                    ? 'bg-stone-100 text-stone-500 border-transparent cursor-not-allowed' 
                                                    : 'bg-white border-transparent focus:border-red-900 text-stone-800'
                                                }`}
                                            >
                                                <option value="">Select Student Group...</option>
                                                {filteredGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                            </select>
                                            {!!user.studentGroupId && <Lock size={14} className="absolute right-3 bottom-4 text-stone-400" />}
                                        </div>
                                    </div>
                                    {(!!user.facultyId || !!user.courseId || !!user.studentGroupId) && (
                                        <p className="text-[10px] text-stone-400 mt-2 flex items-center gap-1">
                                            <Lock size={10} /> Academic details cannot be changed once assigned. Contact administration for transfers.
                                        </p>
                                    )}
                                </div>
                             </form>
                        ) : (
                            <div className="bg-stone-50/50 p-6 rounded-2xl border border-stone-100">
                                <p className="text-stone-600 leading-relaxed text-lg font-medium">
                                    {user.bio || "No bio yet. Click edit to add one!"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Activity Preview (Mock) */}
                    <div>
                        <h3 className="text-lg font-black text-stone-900 mb-4 flex items-center gap-2">
                            Recent Activity
                        </h3>
                        <div className="flex items-center gap-4 p-4 rounded-2xl border border-stone-100 hover:bg-stone-50 transition-colors cursor-pointer group">
                            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-stone-800">Enrolled in {user.courseName || 'New Course'}</h4>
                                <p className="text-sm text-stone-400 font-medium">2 days ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
