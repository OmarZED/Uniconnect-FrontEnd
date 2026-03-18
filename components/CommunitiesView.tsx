
import React, { useState } from 'react';
import { CommunityDto, CommunityType, UserDto, UserRole, CreateDepartmentCommunityDto } from '../types';
import { communityService } from '../services/api';
import { Users, Plus, Check, Loader2, X, Search, LogIn, LogOut, Building2, Book, GraduationCap } from 'lucide-react';

interface CommunitiesViewProps {
    allCommunities: CommunityDto[];
    user: UserDto;
    onUpdate: () => void;
}

export const CommunitiesView: React.FC<CommunitiesViewProps> = ({ allCommunities, user, onUpdate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createForm, setCreateForm] = useState<CreateDepartmentCommunityDto>({
        name: '', description: '', allowPosts: true, autoJoin: false
    });

    const isDeanOrManager = user.role === UserRole.DEAN || user.role === UserRole.DEPARTMENT_MANAGER;

    // Filter to strictly show Department communities
    const filteredCommunities = allCommunities.filter(c => {
        // Only Department (3)
        if (c.type !== CommunityType.Department) {
            return false;
        }

        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const handleJoin = async (id: string) => {
        const res = await communityService.joinCommunity(id);
        if (res.success) onUpdate();
        else alert("Failed to join: " + res.message);
    };

    const handleLeave = async (id: string) => {
        if (!window.confirm("Are you sure you want to leave this community?")) return;
        const res = await communityService.leaveCommunity(id);
        if (res.success) onUpdate();
        else alert("Failed to leave: " + res.message);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const res = await communityService.createDepartmentCommunity(createForm);
        setIsSubmitting(false);
        if (res.success) {
            setIsCreating(false);
            setCreateForm({ name: '', description: '', allowPosts: true, autoJoin: false });
            onUpdate();
        } else {
            alert("Error: " + res.message);
        }
    };

    const getTypeIcon = (type: CommunityType) => {
        switch (type) {
            case CommunityType.Faculty: return <GraduationCap size={18} className="text-red-900" />;
            case CommunityType.Course: return <Book size={18} className="text-stone-600" />;
            case CommunityType.Group: return <Users size={18} className="text-orange-600" />;
            default: return <Building2 size={18} className="text-stone-500" />;
        }
    };

    const getTypeLabel = (type: CommunityType) => {
        switch (type) {
            case CommunityType.Faculty: return 'Faculty';
            case CommunityType.Course: return 'Course';
            case CommunityType.Group: return 'Study Group';
            case CommunityType.Department: return 'Department';
            default: return 'Community';
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-4xl font-black text-stone-900 tracking-tight mb-2">Discover Departments</h2>
                    <p className="text-stone-500 font-medium text-lg">Browse and join university departments.</p>
                </div>
                {isDeanOrManager && (
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl font-bold shadow-lg shadow-stone-300 hover:bg-stone-800 transition-all hover:-translate-y-1"
                    >
                        <Plus size={20} /> New Department
                    </button>
                )}
            </div>

            {/* Controls */}
            <div className="mb-8">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search departments..." 
                        className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-stone-200 focus:ring-2 focus:ring-red-900 outline-none font-medium shadow-sm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunities.map(community => (
                    <div key={community.id} className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col h-full group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-stone-50 flex items-center justify-center border border-stone-100 group-hover:bg-stone-100 transition-colors">
                                {getTypeIcon(community.type)}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-50 text-stone-600 px-2 py-1 rounded-md">
                                {getTypeLabel(community.type)}
                            </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-stone-900 mb-2 leading-tight">{community.name}</h3>
                        <p className="text-stone-500 text-sm mb-6 flex-1 line-clamp-3">{community.description || 'No description available.'}</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-stone-50 mt-auto">
                            <span className="text-xs font-bold text-stone-400 flex items-center gap-1">
                                <Users size={14} /> {community.memberCount} Members
                            </span>
                            
                            {community.isCurrentUserMember ? (
                                <button 
                                    onClick={() => handleLeave(community.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 text-stone-600 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-900 transition-colors"
                                >
                                    <LogOut size={14} /> Leave
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleJoin(community.id)}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-red-900 text-white rounded-lg text-xs font-bold hover:bg-red-800 transition-colors shadow-md shadow-red-200"
                                >
                                    <LogIn size={14} /> Join Now
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredCommunities.length === 0 && (
                <div className="text-center py-20 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                    <p className="text-stone-400 font-medium">No department communities found.</p>
                </div>
            )}

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="bg-stone-900 p-6 flex justify-between items-center text-white">
                            <h3 className="font-bold text-xl">Create Department Community</h3>
                            <button onClick={() => setIsCreating(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-2 ml-1">Department Name</label>
                                <input type="text" required className="w-full px-4 py-3 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-red-900 outline-none font-bold text-stone-800"
                                    value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} placeholder="e.g. Computer Science Dept" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-2 ml-1">Description</label>
                                <textarea className="w-full px-4 py-3 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-red-900 outline-none font-medium text-stone-700 resize-none" rows={3}
                                    value={createForm.description} onChange={e => setCreateForm({...createForm, description: e.target.value})} placeholder="What is this department about?" />
                            </div>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-stone-100 hover:bg-stone-50 flex-1">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${createForm.allowPosts ? 'border-red-900 bg-red-900' : 'border-stone-300'}`}>
                                        {createForm.allowPosts && <Check size={12} className="text-white" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={createForm.allowPosts} onChange={e => setCreateForm({...createForm, allowPosts: e.target.checked})} />
                                    <span className="text-sm font-bold text-stone-700">Allow Member Posts</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-stone-100 hover:bg-stone-50 flex-1">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${createForm.autoJoin ? 'border-red-900 bg-red-900' : 'border-stone-300'}`}>
                                        {createForm.autoJoin && <Check size={12} className="text-white" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={createForm.autoJoin} onChange={e => setCreateForm({...createForm, autoJoin: e.target.checked})} />
                                    <span className="text-sm font-bold text-stone-700">Auto-Join Enabled</span>
                                </label>
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full bg-red-900 text-white py-4 rounded-xl font-bold hover:bg-red-800 transition-all flex justify-center gap-2">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus size={20} />} Create Department
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
