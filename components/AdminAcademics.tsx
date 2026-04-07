
import React, { useState, useMemo, useEffect } from 'react';
import { 
    FacultyDto, CourseDto, StudentGroupDto, UserDto, CommunityDto, CommunityType,
    CreateFacultyDto, CreateCourseDto, CreateStudentGroupDto,
    UpdateFacultyDto, UpdateCourseDto, UpdateStudentGroupDto
} from '../types';
import { academicService, communityService } from '../services/api';
import { AdminSubjectsPanel } from './AdminSubjectsPanel';
import { 
    Building2, Book, Users, Plus, X, Check, Loader2, 
    GraduationCap, Search, Edit2, Trash2, ChevronDown, ChevronUp,
    MessageSquare, ArrowUpRight, LayoutGrid, MoreHorizontal
} from 'lucide-react';

interface AdminAcademicsProps {
    faculties: FacultyDto[];
    courses: CourseDto[];
    studentGroups: StudentGroupDto[];
    users: UserDto[]; 
    currentUser: UserDto;
    onUpdate: () => void;
    onNavigate?: (communityId: string) => void;
}

type EntityType = 'faculty' | 'course' | 'group';
type ModalMode = 'create' | 'edit';
type SectionType = 'all' | 'faculties' | 'courses' | 'groups' | 'subjects' | 'communities';

export const AdminAcademics: React.FC<AdminAcademicsProps> = ({ 
    faculties, courses, studentGroups, users, currentUser, onUpdate, onNavigate 
}) => {
    const [activeSection, setActiveSection] = useState<SectionType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('create');
    const [modalType, setModalType] = useState<EntityType>('faculty');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const [ownedCommunities, setOwnedCommunities] = useState<CommunityDto[]>([]);
    const [isLoadingCommunities, setIsLoadingCommunities] = useState(false);
    
    // Form states
    const [facultyForm, setFacultyForm] = useState<CreateFacultyDto>({ 
        name: '', code: '', description: '', deanId: currentUser?.id || '' 
    });
    const [courseForm, setCourseForm] = useState<CreateCourseDto>({ 
        name: '', year: 1, code: '', facultyId: '' 
    });
    const [groupForm, setGroupForm] = useState<CreateStudentGroupDto>({ 
        name: '', code: '', description: '', courseId: '' 
    });

    // Fetch owned communities on mount
    useEffect(() => {
        fetchOwnedCommunities();
    }, []);

    // Fetch owned communities from API
    const fetchOwnedCommunities = async () => {
        setIsLoadingCommunities(true);
        const res = await communityService.getOwnedCommunities();
        if (res.success && res.data) {
            setOwnedCommunities(res.data);
        }
        setIsLoadingCommunities(false);
    };

    // Filter entities based on search
    const filteredFaculties = useMemo(() => {
        if (!searchQuery) return faculties;
        return faculties.filter(f => 
            f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [faculties, searchQuery]);

    const filteredCourses = useMemo(() => {
        let filtered = courses;
        if (searchQuery) {
            filtered = courses.filter(c => 
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.facultyName?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return filtered;
    }, [courses, searchQuery]);

    const filteredGroups = useMemo(() => {
        let filtered = studentGroups;
        if (searchQuery) {
            filtered = studentGroups.filter(g => 
                g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                g.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                g.courseName?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return filtered;
    }, [studentGroups, searchQuery]);

    const filteredCommunities = useMemo(() => {
        if (!searchQuery) return ownedCommunities;
        return ownedCommunities.filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [ownedCommunities, searchQuery]);

    // Get community for entity (from owned communities)
    const getEntityCommunity = (type: CommunityType, entityId: string): CommunityDto | undefined => {
        return ownedCommunities.find(c => {
            if (type === CommunityType.Faculty) return c.facultyId === entityId;
            if (type === CommunityType.Course) return c.courseId === entityId;
            if (type === CommunityType.Group) return c.studentGroupId === entityId;
            return false;
        });
    };

    // Handle navigation to community feed
    const handleNavigateToCommunity = (communityId: string) => {
        if (onNavigate) {
            onNavigate(communityId);
        }
    };

    // Toggle card expansion
    const toggleCardExpand = (id: string) => {
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    // Open create modal
    const openCreateModal = (type: EntityType) => {
        setModalMode('create');
        setModalType(type);
        setEditingId(null);
        resetForms();
        setIsModalOpen(true);
    };

    // Open edit modal
    const openEditModal = (type: EntityType, entity: any) => {
        setModalMode('edit');
        setModalType(type);
        setEditingId(entity.id);
        
        if (type === 'faculty') {
            setFacultyForm({
                name: entity.name,
                code: entity.code,
                description: entity.description || '',
                deanId: entity.deanId || currentUser.id
            });
        } else if (type === 'course') {
            setCourseForm({
                name: entity.name,
                year: entity.year,
                code: entity.code || '',
                facultyId: entity.facultyId || ''
            });
        } else {
            setGroupForm({
                name: entity.name,
                code: entity.code,
                description: entity.description || '',
                courseId: entity.courseId || ''
            });
        }
        setIsModalOpen(true);
    };

    // Reset forms
    const resetForms = () => {
        setFacultyForm({ name: '', code: '', description: '', deanId: currentUser?.id || '' });
        setCourseForm({ name: '', year: 1, code: '', facultyId: '' });
        setGroupForm({ name: '', code: '', description: '', courseId: '' });
    };

    // Handle create/edit submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        let res;
        if (modalMode === 'create') {
            if (modalType === 'faculty') {
                const payload = { ...facultyForm };
                if (!payload.deanId && currentUser) payload.deanId = currentUser.id;
                res = await academicService.createFaculty(payload);
            } else if (modalType === 'course') {
                res = await academicService.createCourse(courseForm);
            } else {
                res = await academicService.createStudentGroup(groupForm);
            }
        } else {
            // Edit mode
            if (!editingId) return;
            if (modalType === 'faculty') {
                const updateData: UpdateFacultyDto = {
                    name: facultyForm.name,
                    code: facultyForm.code,
                    description: facultyForm.description,
                    deanId: facultyForm.deanId
                };
                res = await academicService.updateFaculty(editingId, updateData);
            } else if (modalType === 'course') {
                const updateData: UpdateCourseDto = {
                    name: courseForm.name,
                    year: courseForm.year,
                    code: courseForm.code,
                    facultyId: courseForm.facultyId
                };
                res = await academicService.updateCourse(editingId, updateData);
            } else {
                const updateData: UpdateStudentGroupDto = {
                    name: groupForm.name,
                    code: groupForm.code,
                    description: groupForm.description,
                    courseId: groupForm.courseId
                };
                res = await academicService.updateStudentGroup(editingId, updateData);
            }
        }
        
        setIsSubmitting(false);
        if (res.success) {
            setIsModalOpen(false);
            resetForms();
            setEditingId(null);
            onUpdate();
        } else {
            alert(`Error ${modalMode === 'create' ? 'creating' : 'updating'}: ${res.message}`);
        }
    };

    // Handle delete
    const handleDelete = async (id: string, type: EntityType, name: string) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
        
        let res;
        if (type === 'faculty') res = await academicService.deleteFaculty(id);
        else if (type === 'course') res = await academicService.deleteCourse(id);
        else res = await academicService.deleteStudentGroup(id);
        
        if (res.success) {
            onUpdate();
        } else {
            alert("Failed to delete: " + res.message);
        }
    };

    // Section tabs config
    const sectionTabs = [
        { id: 'all', label: 'Overview', icon: LayoutGrid, count: faculties.length + courses.length + studentGroups.length },
        { id: 'faculties', label: 'Faculties', icon: Building2, count: faculties.length },
        { id: 'courses', label: 'Courses', icon: Book, count: courses.length },
        { id: 'groups', label: 'Groups', icon: Users, count: studentGroups.length },
        { id: 'subjects', label: 'Subjects', icon: GraduationCap, count: 0 },
        { id: 'communities', label: 'Communities', icon: MessageSquare, count: ownedCommunities.length },
    ];

    // Render stats card
    const renderStatsCard = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
                { label: 'Faculties', value: faculties.length, icon: Building2, color: 'red' },
                { label: 'Courses', value: courses.length, icon: Book, color: 'stone' },
                { label: 'Groups', value: studentGroups.length, icon: Users, color: 'red' },
                { label: 'Communities', value: ownedCommunities.length, icon: MessageSquare, color: 'stone' },
            ].map((stat, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.06)] border border-stone-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                            <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-stone-900">{stat.value}</p>
                    <p className="text-sm font-medium text-stone-500">{stat.label}</p>
                </div>
            ))}
        </div>
    );

    // Render entity card
    const renderEntityCard = (type: EntityType, data: any) => {
        const community = getEntityCommunity(
            type === 'faculty' ? CommunityType.Faculty : 
            type === 'course' ? CommunityType.Course : CommunityType.Group, 
            data.id
        );
        const isExpanded = expandedCards.has(data.id);
        
        let icon = <Building2 className="w-5 h-5" />;
        let badgeColor = 'bg-red-50 text-red-700';
        let metaInfo = [];
        
        if (type === 'faculty') {
            icon = <Building2 className="w-5 h-5" />;
            metaInfo = [
                { label: 'Code', value: data.code },
                { label: 'Dean', value: data.deanName || 'Not assigned' }
            ];
        } else if (type === 'course') {
            icon = <Book className="w-5 h-5" />;
            badgeColor = 'bg-stone-100 text-stone-700';
            metaInfo = [
                { label: 'Code', value: data.code || 'N/A' },
                { label: 'Year', value: `Year ${data.year}` },
                { label: 'Faculty', value: data.facultyName || 'N/A' }
            ];
        } else {
            icon = <Users className="w-5 h-5" />;
            badgeColor = 'bg-red-50 text-red-700';
            metaInfo = [
                { label: 'Code', value: data.code },
                { label: 'Course', value: data.courseName || 'N/A' },
                { label: 'Members', value: data.studentCount || 0 }
            ];
        }

        return (
            <div key={data.id} className="group bg-white rounded-2xl shadow-[0_2px_12px_-6px_rgba(0,0,0,0.06)] border border-stone-100 overflow-hidden hover:shadow-[0_12px_35px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300">
                {/* Card Header */}
                <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl ${badgeColor} flex items-center justify-center`}>
                                {icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-stone-900 leading-tight">{data.name}</h3>
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
                                    {type}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => openEditModal(type, data)}
                                className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center text-stone-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                title="Edit"
                            >
                                <Edit2 size={14} />
                            </button>
                            <button 
                                onClick={() => handleDelete(data.id, type, data.name)}
                                className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center text-stone-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                title="Delete"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                    
                    <p className="text-sm text-stone-500 line-clamp-2 mb-4">
                        {data.description || 'No description available.'}
                    </p>
                    
                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {metaInfo.map((meta, idx) => (
                            <span key={idx} className="text-xs font-medium text-stone-500 bg-stone-50 px-2.5 py-1 rounded-lg">
                                {meta.label}: <span className="font-bold text-stone-700">{meta.value}</span>
                            </span>
                        ))}
                    </div>
                    
                    {/* Community Info */}
                    {community ? (
                        <div 
                            className="bg-stone-50 rounded-xl p-3 mb-2 cursor-pointer hover:bg-red-50 transition-colors"
                            onClick={() => handleNavigateToCommunity(community.id)}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Linked Community</span>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleNavigateToCommunity(community.id);
                                    }}
                                    className="text-xs font-semibold text-red-600 flex items-center gap-1 hover:text-red-700"
                                >
                                    <ArrowUpRight size={12} /> Open
                                </button>
                            </div>
                            <p className="font-bold text-stone-800 text-sm mb-2">{community.name}</p>
                            <div className="flex gap-3 text-xs">
                                <span className="text-stone-500">
                                    <Users size={12} className="inline mr-1" />
                                    {community.memberCount || 0} members
                                </span>
                                <span className="text-stone-500">
                                    <MessageSquare size={12} className="inline mr-1" />
                                    {community.postCount || 0} posts
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-stone-50 rounded-xl p-3 mb-2">
                            <span className="text-xs font-medium text-stone-400">No community linked</span>
                        </div>
                    )}
                </div>
                
                {/* Expand/Collapse for related items */}
                {(type === 'faculty' || type === 'course') && (
                    <button 
                        onClick={() => toggleCardExpand(data.id)}
                        className="w-full py-2 bg-stone-50 border-t border-stone-100 flex items-center justify-center gap-2 text-xs font-semibold text-stone-500 hover:bg-stone-100 transition-colors"
                    >
                        {isExpanded ? (
                            <><ChevronUp size={14} /> Hide {type === 'faculty' ? 'Courses' : 'Groups'}</>
                        ) : (
                            <><ChevronDown size={14} /> Show {type === 'faculty' ? 'Courses' : 'Groups'} ({type === 'faculty' ? courses.filter(c => c.facultyId === data.id).length : studentGroups.filter(g => g.courseId === data.id).length})</>
                        )}
                    </button>
                )}
                
                {/* Expanded Content */}
                {isExpanded && type === 'faculty' && (
                    <div className="px-5 pb-4 bg-stone-50/50">
                        {courses.filter(c => c.facultyId === data.id).map(course => (
                            <div key={course.id} className="py-2 border-b border-stone-100 last:border-0 flex items-center justify-between">
                                <span className="text-sm font-medium text-stone-700">{course.name}</span>
                                <span className="text-xs text-stone-400">Year {course.year}</span>
                            </div>
                        ))}
                        {courses.filter(c => c.facultyId === data.id).length === 0 && (
                            <p className="text-xs text-stone-400 py-2">No courses in this faculty</p>
                        )}
                    </div>
                )}
                
                {isExpanded && type === 'course' && (
                    <div className="px-5 pb-4 bg-stone-50/50">
                        {studentGroups.filter(g => g.courseId === data.id).map(group => (
                            <div key={group.id} className="py-2 border-b border-stone-100 last:border-0 flex items-center justify-between">
                                <span className="text-sm font-medium text-stone-700">{group.name}</span>
                                <span className="text-xs text-stone-400">{group.studentCount || 0} members</span>
                            </div>
                        ))}
                        {studentGroups.filter(g => g.courseId === data.id).length === 0 && (
                            <p className="text-xs text-stone-400 py-2">No groups in this course</p>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Render communities list
    const renderCommunitiesSection = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-stone-600 to-stone-700 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-stone-800">All Communities</h2>
                        <p className="text-xs text-stone-500">Communities linked to your academic structure</p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCommunities.map(community => (
                    <div 
                        key={community.id} 
                        className="group bg-white rounded-2xl p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.06)] border border-stone-100 hover:shadow-[0_12px_35px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                        onClick={() => handleNavigateToCommunity(community.id)}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-red-600" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-2 py-1 rounded-lg">
                                {CommunityType[community.type]}
                            </span>
                        </div>
                        <h3 className="font-bold text-stone-800 mb-1">{community.name}</h3>
                        <p className="text-xs text-stone-500 line-clamp-2 mb-4">{community.description || 'No description'}</p>
                        <div className="flex items-center gap-4 text-xs text-stone-500">
                            <span className="flex items-center gap-1"><Users size={12} /> {community.memberCount || 0}</span>
                            <span className="flex items-center gap-1"><MessageSquare size={12} /> {community.postCount || 0}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Render modal content
    const renderModal = () => {
        if (!isModalOpen) return null;
        
        const isEdit = modalMode === 'edit';
        const title = isEdit ? `Edit ${modalType}` : `New ${modalType}`;
        const gradient = modalType === 'faculty' ? 'from-red-900 to-red-800' : 
                        modalType === 'course' ? 'from-stone-800 to-stone-700' : 
                        'from-red-800 to-red-700';
        
        return (
            <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className={`bg-gradient-to-br ${gradient} p-6 flex justify-between items-center text-white`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                {modalType === 'faculty' ? <Building2 className="w-5 h-5" /> : 
                                 modalType === 'course' ? <Book className="w-5 h-5" /> : 
                                 <Users className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-xl">{title}</h3>
                                <p className="text-xs text-white/70">
                                    {isEdit ? 'Update entity details' : 'Add to academic structure'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(false)} 
                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            <X size={20}/>
                        </button>
                    </div>
                    
                    {/* Modal Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-5">
                        {modalType === 'faculty' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Faculty Name</label>
                                    <input 
                                        type="text" required 
                                        className="w-full px-4 py-3.5 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-red-900 outline-none font-bold text-stone-800 transition-all"
                                        value={facultyForm.name} 
                                        onChange={e => setFacultyForm({...facultyForm, name: e.target.value})} 
                                        placeholder="e.g. Computer Science"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Code</label>
                                        <input 
                                            type="text" required 
                                            className="w-full px-4 py-3.5 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-red-900 outline-none font-bold text-stone-800 transition-all"
                                            value={facultyForm.code} 
                                            onChange={e => setFacultyForm({...facultyForm, code: e.target.value})} 
                                            placeholder="e.g. CS"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Dean</label>
                                        <select 
                                            className="w-full px-4 py-3.5 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-red-900 outline-none font-bold text-stone-800 transition-all"
                                            value={facultyForm.deanId} 
                                            onChange={e => setFacultyForm({...facultyForm, deanId: e.target.value})}
                                        >
                                            <option value="">Select Dean...</option>
                                            {users.map(u => (
                                                <option key={u.id} value={u.id}>{u.fullName} {u.id === currentUser.id ? '(You)' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Description</label>
                                    <textarea 
                                        className="w-full px-4 py-3.5 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-red-900 outline-none font-medium text-stone-700 resize-none transition-all" 
                                        rows={3}
                                        value={facultyForm.description} 
                                        onChange={e => setFacultyForm({...facultyForm, description: e.target.value})} 
                                        placeholder="Brief description..."
                                    />
                                </div>
                            </>
                        )}
                        
                        {modalType === 'course' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Course Name</label>
                                    <input 
                                        type="text" required 
                                        className="w-full px-4 py-3.5 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-stone-600 outline-none font-bold text-stone-800 transition-all"
                                        value={courseForm.name} 
                                        onChange={e => setCourseForm({...courseForm, name: e.target.value})} 
                                        placeholder="e.g. Advanced Programming"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Code</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-4 py-3.5 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-stone-600 outline-none font-bold text-stone-800 transition-all"
                                            value={courseForm.code} 
                                            onChange={e => setCourseForm({...courseForm, code: e.target.value})} 
                                            placeholder="e.g. CS101"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Year (1-6)</label>
                                        <input 
                                            type="number" min="1" max="6" required 
                                            className="w-full px-4 py-3.5 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-stone-600 outline-none font-bold text-stone-800 transition-all"
                                            value={courseForm.year} 
                                            onChange={e => setCourseForm({...courseForm, year: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Faculty</label>
                                    <select 
                                        required
                                        className="w-full px-4 py-3.5 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-stone-600 outline-none font-bold text-stone-800 transition-all"
                                        value={courseForm.facultyId} 
                                        onChange={e => setCourseForm({...courseForm, facultyId: e.target.value})}
                                    >
                                        <option value="">Select Faculty...</option>
                                        {faculties.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}
                        
                        {modalType === 'group' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Group Name</label>
                                    <input 
                                        type="text" required 
                                        className="w-full px-4 py-3.5 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-red-900 outline-none font-bold text-stone-800 transition-all"
                                        value={groupForm.name} 
                                        onChange={e => setGroupForm({...groupForm, name: e.target.value})} 
                                        placeholder="e.g. Group A"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Code</label>
                                        <input 
                                            type="text" required 
                                            className="w-full px-4 py-3.5 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-red-900 outline-none font-bold text-stone-800 transition-all"
                                            value={groupForm.code} 
                                            onChange={e => setGroupForm({...groupForm, code: e.target.value})} 
                                            placeholder="e.g. GA"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Course</label>
                                        <select 
                                            required
                                            className="w-full px-4 py-3.5 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-red-900 outline-none font-bold text-stone-800 transition-all"
                                            value={groupForm.courseId} 
                                            onChange={e => setGroupForm({...groupForm, courseId: e.target.value})}
                                        >
                                            <option value="">Select Course...</option>
                                            {courses.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Description</label>
                                    <input 
                                        type="text"
                                        className="w-full px-4 py-3.5 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-red-900 outline-none font-medium text-stone-700 transition-all"
                                        value={groupForm.description} 
                                        onChange={e => setGroupForm({...groupForm, description: e.target.value})} 
                                        placeholder="Optional description"
                                    />
                                </div>
                            </>
                        )}
                        
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className={`w-full bg-gradient-to-br ${gradient} text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all flex justify-center gap-2 shadow-lg disabled:opacity-50`}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <Check size={20} />} 
                            {isEdit ? 'Save Changes' : 'Create'}
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#fafaf9]">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-100/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-stone-200/30 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 p-6 md:p-10 lg:p-12 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-stone-200/60 mb-5">
                                <GraduationCap className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-semibold text-stone-600">Dean Portal</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
                                Academic <span className="text-red-900">Management</span>
                            </h1>
                            <p className="mt-3 text-lg text-stone-500 max-w-xl leading-relaxed">
                                Manage faculties, courses, and student groups with full visibility into linked communities.
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative max-w-2xl">
                        <div className="absolute inset-0 bg-stone-900/5 rounded-2xl blur-sm" />
                        <div className="relative flex items-center">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400" size={22} />
                            <input 
                                type="text" 
                                placeholder="Search across all entities..." 
                                className="w-full pl-14 pr-5 py-4 bg-white rounded-2xl border border-stone-200/80 focus:ring-2 focus:ring-red-900/20 focus:border-red-900 outline-none font-medium text-stone-700 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] placeholder:text-stone-400"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Section Tabs */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {sectionTabs.map(tab => {
                        const isActive = activeSection === tab.id;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSection(tab.id as SectionType)}
                                className={`px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border ${
                                    isActive 
                                        ? 'bg-stone-900 text-white border-stone-900 shadow-lg' 
                                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                                }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                                <span className={`ml-1 px-2 py-0.5 rounded-lg text-xs ${isActive ? 'bg-white/20' : 'bg-stone-100'}`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Stats Overview (when on 'all' tab) */}
                {(activeSection === 'all') && renderStatsCard()}

                {/* Content Sections */}
                <div className="space-y-10">
                    {/* Faculties Section */}
                    {(activeSection === 'all' || activeSection === 'faculties') && filteredFaculties.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-900 to-red-800 shadow-lg shadow-red-200 flex items-center justify-center">
                                        <Building2 className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-stone-800">Faculties</h2>
                                        <p className="text-xs text-stone-500">{filteredFaculties.length} total</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => openCreateModal('faculty')}
                                    className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors"
                                >
                                    <Plus size={16} /> New
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredFaculties.map(f => renderEntityCard('faculty', f))}
                            </div>
                        </section>
                    )}

                    {/* Courses Section */}
                    {(activeSection === 'all' || activeSection === 'courses') && filteredCourses.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-stone-700 to-stone-800 shadow-lg shadow-stone-200 flex items-center justify-center">
                                        <Book className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-stone-800">Courses</h2>
                                        <p className="text-xs text-stone-500">{filteredCourses.length} total</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => openCreateModal('course')}
                                    className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors"
                                >
                                    <Plus size={16} /> New
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredCourses.map(c => renderEntityCard('course', c))}
                            </div>
                        </section>
                    )}

                    {/* Groups Section */}
                    {(activeSection === 'all' || activeSection === 'groups') && filteredGroups.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-800 to-red-900 shadow-lg shadow-red-200 flex items-center justify-center">
                                        <Users className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-stone-800">Student Groups</h2>
                                        <p className="text-xs text-stone-500">{filteredGroups.length} total</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => openCreateModal('group')}
                                    className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors"
                                >
                                    <Plus size={16} /> New
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredGroups.map(g => renderEntityCard('group', g))}
                            </div>
                        </section>
                    )}

                    {(activeSection === 'all' || activeSection === 'subjects') && (
                        <AdminSubjectsPanel studentGroups={studentGroups} users={users} />
                    )}

                    {/* Communities Section */}
                    {(activeSection === 'all' || activeSection === 'communities') && renderCommunitiesSection()}
                </div>

                {/* Empty States */}
                {((activeSection === 'faculties' && filteredFaculties.length === 0) ||
                  (activeSection === 'courses' && filteredCourses.length === 0) ||
                  (activeSection === 'groups' && filteredGroups.length === 0)) && (
                    <div className="max-w-md mx-auto mt-12">
                        <div className="bg-white rounded-[2rem] p-10 text-center shadow-[0_8px_40px_-15px_rgba(0,0,0,0.06)] border border-stone-100">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-stone-100 to-stone-50 rounded-full flex items-center justify-center">
                                <Search className="w-7 h-7 text-stone-400" />
                            </div>
                            <h3 className="text-lg font-bold text-stone-800 mb-2">No results found</h3>
                            <p className="text-stone-500 text-sm">
                                Try adjusting your search or create a new entity.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {renderModal()}
        </div>
    );
};


