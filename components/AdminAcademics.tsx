
import React, { useState } from 'react';
import { 
    FacultyDto, CourseDto, StudentGroupDto, UserDto, 
    CreateFacultyDto, CreateCourseDto, CreateStudentGroupDto 
} from '../types';
import { academicService } from '../services/api';
import { 
    Building2, Book, Users, Plus, X, Check, Loader2, 
    GraduationCap, Sparkles, MoreHorizontal, Trash2
} from 'lucide-react';

interface AdminAcademicsProps {
    faculties: FacultyDto[];
    courses: CourseDto[];
    studentGroups: StudentGroupDto[];
    users: UserDto[]; 
    currentUser: UserDto;
    onUpdate: () => void; 
}

export const AdminAcademics: React.FC<AdminAcademicsProps> = ({ 
    faculties, courses, studentGroups, users, currentUser, onUpdate 
}) => {
    const [activeTab, setActiveTab] = useState<'faculties' | 'courses' | 'groups'>('faculties');
    const [isCreating, setIsCreating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // For deletion confirmation
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Form States - Auto-assign current user as Dean default
    const [facultyForm, setFacultyForm] = useState<CreateFacultyDto>({ 
        name: '', 
        code: '', 
        description: '', 
        deanId: currentUser?.id || '' 
    });
    const [courseForm, setCourseForm] = useState<CreateCourseDto>({ name: '', year: 1, code: '', facultyId: '' });
    const [groupForm, setGroupForm] = useState<CreateStudentGroupDto>({ name: '', code: '', description: '', courseId: '' });

    const handleCreateFaculty = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Fallback: Ensure DeanId is set to current user if somehow empty
        const payload = { ...facultyForm };
        if (!payload.deanId && currentUser) {
            payload.deanId = currentUser.id;
        }

        const res = await academicService.createFaculty(payload);
        setIsSubmitting(false);
        if(res.success) {
            setIsCreating(false);
            setFacultyForm({ name: '', code: '', description: '', deanId: currentUser?.id || '' });
            onUpdate();
        } else {
            alert("Error creating faculty: " + res.message);
        }
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const res = await academicService.createCourse(courseForm);
        setIsSubmitting(false);
        if(res.success) {
            setIsCreating(false);
            setCourseForm({ name: '', year: 1, code: '', facultyId: '' });
            onUpdate();
        } else {
            alert("Error creating course: " + res.message);
        }
    };

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const res = await academicService.createStudentGroup(groupForm);
        setIsSubmitting(false);
        if(res.success) {
            setIsCreating(false);
            setGroupForm({ name: '', code: '', description: '', courseId: '' });
            onUpdate();
        } else {
            alert("Error creating group: " + res.message);
        }
    };

    const handleDelete = async (id: string, type: 'faculty' | 'course' | 'group') => {
        if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;
        
        setDeletingId(id);
        let res;
        if (type === 'faculty') res = await academicService.deleteFaculty(id);
        else if (type === 'course') res = await academicService.deleteCourse(id);
        else res = await academicService.deleteStudentGroup(id);
        
        setDeletingId(null);
        if (res.success) {
            onUpdate();
        } else {
            alert("Failed to delete: " + res.message);
        }
    };

    // Updated Gradients to match Beige/Red theme
    const gradients = {
        faculties: 'from-red-900 via-red-800 to-red-700',
        courses: 'from-stone-800 via-stone-700 to-stone-600',
        groups: 'from-orange-700 via-orange-600 to-amber-600'
    };

    const activeGradient = gradients[activeTab];

    const renderCard = (type: 'faculty' | 'course' | 'group', data: any) => {
        let icon = <Building2 className="text-white" size={24} />;
        let bgGradient = gradients.faculties;
        let title = data.name;
        let subtitle = data.description || 'No description';
        let meta1 = data.code;
        let meta2 = '';
        let shadowColor = 'shadow-red-200';

        if (type === 'course') {
            icon = <Book className="text-white" size={24} />;
            bgGradient = gradients.courses;
            subtitle = data.facultyName || 'General';
            meta2 = `Year ${data.year}`;
            shadowColor = 'shadow-stone-300';
        } else if (type === 'group') {
            icon = <Users className="text-white" size={24} />;
            bgGradient = gradients.groups;
            subtitle = data.courseName || 'No Course';
            meta2 = `${data.studentCount || 0} Members`;
            shadowColor = 'shadow-orange-200';
        } else {
             // Faculty specific
             if (data.deanName) meta2 = `Dean: ${data.deanName.split(' ')[0]}`;
        }
        
        const isDeleting = deletingId === data.id;

        return (
            <div key={data.id} className={`group relative bg-white rounded-[2rem] p-6 hover:-translate-y-2 transition-all duration-300 border border-stone-100 overflow-hidden hover:shadow-2xl ${shadowColor} ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
                
                {/* Graphic Pattern Overlay */}
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                     <svg width="60" height="60" viewBox="0 0 100 100" className="fill-current text-stone-400">
                         <circle cx="10" cy="10" r="5" />
                         <circle cx="40" cy="10" r="5" />
                         <circle cx="70" cy="10" r="5" />
                         <circle cx="10" cy="40" r="5" />
                         <circle cx="40" cy="40" r="5" />
                     </svg>
                </div>

                {/* Gradient Blob */}
                <div className={`absolute -top-10 -left-10 w-40 h-40 rounded-full bg-gradient-to-br ${bgGradient} blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${bgGradient} flex items-center justify-center shadow-lg text-white ring-4 ring-white`}>
                        {isDeleting ? <Loader2 className="animate-spin" /> : icon}
                    </div>
                    <div className="flex gap-1">
                        <button 
                            onClick={() => handleDelete(data.id, type)}
                            className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                <div className="relative z-10 mt-4">
                    <h3 className="font-black text-stone-800 text-xl mb-1 leading-tight tracking-tight">{title}</h3>
                    <p className="text-stone-500 text-sm font-medium mb-6 line-clamp-2 h-10">{subtitle}</p>
                    
                    <div className="flex items-center gap-2 pt-4 border-t border-stone-50">
                        <span className="bg-stone-100 text-stone-600 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">
                            {meta1}
                        </span>
                        {meta2 && (
                            <span className="text-xs font-bold text-stone-400 flex items-center gap-1 ml-auto bg-white px-2 py-1 rounded-lg border border-stone-100 shadow-sm">
                                {type === 'faculty' && <GraduationCap size={12} />}
                                {meta2}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderModal = () => {
        if (!isCreating) return null;
        
        return (
            <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transform transition-all scale-100 border border-white/50">
                    <div className={`p-8 bg-gradient-to-r ${activeGradient} text-white flex justify-between items-center relative overflow-hidden`}>
                        
                        <div className="absolute top-0 left-0 w-full h-full bg-white/10" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px', opacity: 0.2}}></div>

                        <div className="relative z-10">
                            <h3 className="font-black text-3xl tracking-tight">
                                {activeTab === 'faculties' && 'New Faculty'}
                                {activeTab === 'courses' && 'New Course'}
                                {activeTab === 'groups' && 'New Group'}
                            </h3>
                            <p className="text-white/90 font-medium mt-1">Add to your academic structure</p>
                        </div>
                        <button onClick={() => setIsCreating(false)} className="bg-white/20 hover:bg-white/30 p-2.5 rounded-full transition-colors relative z-10 backdrop-blur-sm">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className="p-8">
                        {activeTab === 'faculties' && (
                            <form onSubmit={handleCreateFaculty} className="space-y-5">
                                <div className="group">
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 ml-1">Faculty Name</label>
                                    <input type="text" required className="w-full px-5 py-3.5 bg-stone-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-300 focus:ring-4 focus:ring-red-100 transition-all text-stone-800 font-bold placeholder:text-stone-300 outline-none" 
                                        value={facultyForm.name} onChange={e => setFacultyForm({...facultyForm, name: e.target.value})} placeholder="e.g. Design & Arts"/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 ml-1">Code</label>
                                        <input type="text" required className="w-full px-5 py-3.5 bg-stone-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-300 focus:ring-4 focus:ring-red-100 transition-all text-stone-800 font-bold placeholder:text-stone-300 outline-none" 
                                            value={facultyForm.code} onChange={e => setFacultyForm({...facultyForm, code: e.target.value})} placeholder="e.g. DES"/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 ml-1">Dean</label>
                                        <select className="w-full px-5 py-3.5 bg-stone-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-300 focus:ring-4 focus:ring-red-100 transition-all text-stone-800 font-bold outline-none"
                                            value={facultyForm.deanId} onChange={e => setFacultyForm({...facultyForm, deanId: e.target.value})}>
                                            <option value="">Select Dean...</option>
                                            {users.map(u => (
                                                <option key={u.id} value={u.id}>{u.fullName} {u.id === currentUser.id ? '(You)' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 ml-1">Description</label>
                                    <textarea className="w-full px-5 py-3.5 bg-stone-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-300 focus:ring-4 focus:ring-red-100 transition-all text-stone-800 font-bold placeholder:text-stone-300 outline-none resize-none" rows={3}
                                        value={facultyForm.description} onChange={e => setFacultyForm({...facultyForm, description: e.target.value})} placeholder="Brief description of the faculty..." />
                                </div>
                                <button type="submit" disabled={isSubmitting} className={`w-full bg-gradient-to-r ${activeGradient} text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-300 hover:-translate-y-1 transition-all flex justify-center gap-2 mt-2`}>
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Check size={20} />} Create Faculty
                                </button>
                            </form>
                        )}

                        {activeTab === 'courses' && (
                            <form onSubmit={handleCreateCourse} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 ml-1">Course Name</label>
                                    <input type="text" required className="w-full px-5 py-3.5 bg-stone-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-stone-400 focus:ring-4 focus:ring-stone-200 transition-all text-stone-800 font-bold placeholder:text-stone-300 outline-none" 
                                        value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} placeholder="e.g. Advanced Graphic Design"/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 ml-1">Code</label>
                                        <input type="text" required className="w-full px-5 py-3.5 bg-stone-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-stone-400 focus:ring-4 focus:ring-stone-200 transition-all text-stone-800 font-bold placeholder:text-stone-300 outline-none" 
                                            value={courseForm.code} onChange={e => setCourseForm({...courseForm, code: e.target.value})} placeholder="e.g. AGD202"/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 ml-1">Year (1-6)</label>
                                        <input type="number" min="1" max="6" required className="w-full px-5 py-3.5 bg-stone-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-stone-400 focus:ring-4 focus:ring-stone-200 transition-all text-stone-800 font-bold outline-none" 
                                            value={courseForm.year} onChange={e => setCourseForm({...courseForm, year: parseInt(e.target.value)})} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 ml-1">Faculty</label>
                                    <select required className="w-full px-5 py-3.5 bg-stone-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-stone-400 focus:ring-4 focus:ring-stone-200 transition-all text-stone-800 font-bold outline-none"
                                        value={courseForm.facultyId} onChange={e => setCourseForm({...courseForm, facultyId: e.target.value})}>
                                        <option value="">Select Faculty...</option>
                                        {faculties.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" disabled={isSubmitting} className={`w-full bg-gradient-to-r ${activeGradient} text-white py-4 rounded-2xl font-bold shadow-lg shadow-stone-300 hover:shadow-xl hover:shadow-stone-400 hover:-translate-y-1 transition-all flex justify-center gap-2 mt-2`}>
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Check size={20} />} Create Course
                                </button>
                            </form>
                        )}

                        {activeTab === 'groups' && (
                            <form onSubmit={handleCreateGroup} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 ml-1">Group Name</label>
                                    <input type="text" required className="w-full px-5 py-3.5 bg-stone-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-amber-300 focus:ring-4 focus:ring-amber-100 transition-all text-stone-800 font-bold placeholder:text-stone-300 outline-none" 
                                        value={groupForm.name} onChange={e => setGroupForm({...groupForm, name: e.target.value})} placeholder="e.g. Design Team A"/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 ml-1">Code</label>
                                        <input type="text" required className="w-full px-5 py-3.5 bg-stone-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-amber-300 focus:ring-4 focus:ring-amber-100 transition-all text-stone-800 font-bold placeholder:text-stone-300 outline-none" 
                                            value={groupForm.code} onChange={e => setGroupForm({...groupForm, code: e.target.value})} placeholder="e.g. DTA"/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 ml-1">Parent Course</label>
                                        <select required className="w-full px-5 py-3.5 bg-stone-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-amber-300 focus:ring-4 focus:ring-amber-100 transition-all text-stone-800 font-bold outline-none"
                                            value={groupForm.courseId} onChange={e => setGroupForm({...groupForm, courseId: e.target.value})}>
                                            <option value="">Select Course...</option>
                                            {courses.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 ml-1">Description</label>
                                    <input type="text" className="w-full px-5 py-3.5 bg-stone-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-amber-300 focus:ring-4 focus:ring-amber-100 transition-all text-stone-800 font-bold placeholder:text-stone-300 outline-none" 
                                        value={groupForm.description} onChange={e => setGroupForm({...groupForm, description: e.target.value})} placeholder="Optional group description"/>
                                </div>
                                <button type="submit" disabled={isSubmitting} className={`w-full bg-gradient-to-r ${activeGradient} text-white py-4 rounded-2xl font-bold shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300 hover:-translate-y-1 transition-all flex justify-center gap-2 mt-2`}>
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Check size={20} />} Create Group
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            {/* Dashboard Header */}
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="px-3 py-1 bg-red-100 rounded-full text-red-900 flex items-center gap-2">
                            <Sparkles size={14} />
                            <span className="text-xs font-black uppercase tracking-widest">Administration</span>
                        </div>
                    </div>
                    <h2 className="text-5xl font-black text-stone-900 tracking-tight leading-tight">
                        Academic <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-900 to-red-600">Hub</span>
                    </h2>
                    <p className="text-stone-500 mt-3 font-medium text-lg max-w-2xl">Manage the heart of your university. Create faculties, design courses, and organize student groups.</p>
                </div>
                
                <button 
                    onClick={() => setIsCreating(true)}
                    className={`px-8 py-4 rounded-2xl font-bold text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3 bg-gradient-to-r ${activeGradient} group`}
                >
                    <div className="bg-white/20 p-1.5 rounded-xl group-hover:rotate-90 transition-transform duration-300">
                        <Plus size={20} className="stroke-[3]" />
                    </div>
                    <span className="text-lg">Create New</span>
                </button>
            </div>

            {/* Modern Tabs */}
            <div className="flex flex-wrap gap-4 mb-10">
                {[
                    { id: 'faculties', icon: Building2, label: 'Faculties', count: faculties.length, color: 'text-red-900' },
                    { id: 'courses', icon: Book, label: 'Courses', count: courses.length, color: 'text-stone-700' },
                    { id: 'groups', icon: Users, label: 'Student Groups', count: studentGroups.length, color: 'text-orange-600' },
                ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-8 py-4 rounded-2xl text-base font-bold transition-all flex items-center gap-3 border-2 ${
                                isActive 
                                    ? `bg-white border-stone-900 text-stone-900 shadow-lg scale-105` 
                                    : 'bg-white border-transparent text-stone-400 hover:bg-stone-50 hover:text-stone-600'
                            }`}
                        >
                            <Icon size={22} className={isActive ? tab.color : ''} strokeWidth={isActive ? 2.5 : 2} />
                            {tab.label}
                            <span className={`ml-2 px-2.5 py-1 rounded-lg text-xs font-extrabold ${isActive ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400'}`}>
                                {tab.count}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {activeTab === 'faculties' && faculties.map(f => renderCard('faculty', f))}
                {activeTab === 'courses' && courses.map(c => renderCard('course', c))}
                {activeTab === 'groups' && studentGroups.map(g => renderCard('group', g))}
                
                {/* Empty State Card / Add New Shortcut */}
                <button 
                    onClick={() => setIsCreating(true)}
                    className="group border-3 border-dashed border-stone-200 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-6 text-stone-400 hover:border-red-300 hover:bg-red-50/30 transition-all min-h-[260px]"
                >
                    <div className={`w-20 h-20 rounded-full bg-white group-hover:scale-110 flex items-center justify-center transition-all shadow-sm group-hover:shadow-md ring-4 ring-stone-50 group-hover:ring-red-100`}>
                        <Plus size={32} className="text-stone-300 group-hover:text-red-900 stroke-[3]" />
                    </div>
                    <div className="text-center">
                        <span className="block font-bold text-lg group-hover:text-red-900">Add New</span>
                        <span className="text-sm font-medium text-stone-300 group-hover:text-red-400">{activeTab === 'groups' ? 'Student Group' : activeTab.slice(0, -1)}</span>
                    </div>
                </button>
            </div>
            
            {renderModal()}
        </div>
    );
};
