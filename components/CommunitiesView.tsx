
import React, { useState } from 'react';
import { CommunityDto, CommunityType, UserDto, UserRole, CreateDepartmentCommunityDto } from '../types';
import { communityService } from '../services/api';
import { Users, Plus, Check, Loader2, X, Search, LogIn, LogOut, Building2, Globe } from 'lucide-react';

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

    return (
        <div className="min-h-screen bg-[#fafaf9]">
            {/* Subtle ambient gradient */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-red-100/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-stone-200/30 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 p-6 md:p-10 lg:p-12 max-w-7xl mx-auto">
                {/* Hero Header */}
                <div className="mb-10 md:mb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-stone-200/60 mb-5">
                                <Globe className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-semibold text-stone-600">Discover</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
                                Department <span className="text-red-900">Communities</span>
                            </h1>
                            <p className="mt-3 text-lg text-stone-500 max-w-xl leading-relaxed">
                                Browse and join university departments to connect with peers.
                            </p>
                        </div>
                        
                        {isDeanOrManager && (
                            <button 
                                onClick={() => setIsCreating(true)}
                                className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-br from-red-900 to-red-800 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shrink-0"
                            >
                                <Plus size={20} /> New Department
                            </button>
                        )}
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl">
                        <div className="absolute inset-0 bg-stone-900/5 rounded-2xl blur-sm" />
                        <div className="relative flex items-center">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400" size={22} />
                            <input 
                                type="text" 
                                placeholder="Search departments by name..." 
                                className="w-full pl-14 pr-5 py-4 bg-white rounded-2xl border border-stone-200/80 focus:ring-2 focus:ring-red-900/20 focus:border-red-900 outline-none font-medium text-stone-700 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] placeholder:text-stone-400"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-stone-500" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-stone-800">Available Departments</h2>
                        <p className="text-xs text-stone-500">{filteredCommunities.length} communities found</p>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredCommunities.map(community => (
                        <div 
                            key={community.id} 
                            className="group cursor-pointer"
                        >
                            {/* 3D Card */}
                            <div className="relative h-full">
                                {/* Hover glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-stone-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                
                                <div className="relative bg-white rounded-2xl p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.06)] border border-stone-100/80 group-hover:shadow-[0_15px_40px_-12px_rgba(0,0,0,0.12)] group-hover:-translate-y-1.5 transition-all duration-400 ease-out h-full flex flex-col">
                                    {/* Top row: Icon + Type */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-red-50 group-hover:to-red-100 transition-all duration-300">
                                            <Building2 className="w-5 h-5 text-stone-500 group-hover:text-red-600 transition-colors" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-2.5 py-1 rounded-lg">
                                            Department
                                        </span>
                                    </div>
                                    
                                    {/* Content */}
                                    <h3 className="text-lg font-bold text-stone-800 mb-2 leading-tight group-hover:text-red-900 transition-colors line-clamp-1">
                                        {community.name}
                                    </h3>
                                    <p className="text-sm text-stone-500 mb-6 flex-1 line-clamp-2">
                                        {community.description || 'No description available.'}
                                    </p>
                                    
                                    {/* Footer: Members + Action */}
                                    <div className="flex items-center justify-between pt-4 border-t border-stone-100 mt-auto">
                                        <span className="text-xs font-semibold text-stone-400 flex items-center gap-1.5">
                                            <Users size={14} /> {community.memberCount} Members
                                        </span>
                                        
                                        {community.isCurrentUserMember ? (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleLeave(community.id); }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 text-stone-600 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-900 transition-colors"
                                            >
                                                <LogOut size={14} /> Leave
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleJoin(community.id); }}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-br from-red-900 to-red-800 text-white rounded-lg text-xs font-bold hover:from-red-800 hover:to-red-700 transition-all shadow-md shadow-red-200"
                                            >
                                                <LogIn size={14} /> Join
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredCommunities.length === 0 && (
                    <div className="max-w-md mx-auto mt-12">
                        <div className="bg-white rounded-[2rem] p-10 text-center shadow-[0_8px_40px_-15px_rgba(0,0,0,0.06)] border border-stone-100">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-stone-100 to-stone-50 rounded-full flex items-center justify-center">
                                <Search className="w-7 h-7 text-stone-400" />
                            </div>
                            <h3 className="text-lg font-bold text-stone-800 mb-2">No departments found</h3>
                            <p className="text-stone-500 text-sm">
                                Try adjusting your search or check back later for new communities.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-br from-stone-900 to-stone-800 p-6 flex justify-between items-center text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">New Department</h3>
                                    <p className="text-xs text-stone-400">Create a community for your department</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsCreating(false)} 
                                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                            >
                                <X size={20}/>
                            </button>
                        </div>
                        
                        {/* Modal Form */}
                        <form onSubmit={handleCreate} className="p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Department Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full px-4 py-3.5 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-red-900 outline-none font-bold text-stone-800 transition-all"
                                    value={createForm.name} 
                                    onChange={e => setCreateForm({...createForm, name: e.target.value})} 
                                    placeholder="e.g. Computer Science Dept" 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Description</label>
                                <textarea 
                                    className="w-full px-4 py-3.5 bg-stone-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-red-900 outline-none font-medium text-stone-700 resize-none transition-all" 
                                    rows={3}
                                    value={createForm.description} 
                                    onChange={e => setCreateForm({...createForm, description: e.target.value})} 
                                    placeholder="What is this department about?" 
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${createForm.allowPosts ? 'border-red-900 bg-red-900' : 'border-stone-300'}`}>
                                        {createForm.allowPosts && <Check size={12} className="text-white" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={createForm.allowPosts} onChange={e => setCreateForm({...createForm, allowPosts: e.target.checked})} />
                                    <span className="text-sm font-semibold text-stone-700">Allow Posts</span>
                                </label>
                                
                                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${createForm.autoJoin ? 'border-red-900 bg-red-900' : 'border-stone-300'}`}>
                                        {createForm.autoJoin && <Check size={12} className="text-white" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={createForm.autoJoin} onChange={e => setCreateForm({...createForm, autoJoin: e.target.checked})} />
                                    <span className="text-sm font-semibold text-stone-700">Auto-Join</span>
                                </label>
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="w-full bg-gradient-to-br from-red-900 to-red-800 text-white py-4 rounded-xl font-bold hover:from-red-800 hover:to-red-700 transition-all flex justify-center gap-2 shadow-lg shadow-red-200 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus size={20} />} Create Department
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
