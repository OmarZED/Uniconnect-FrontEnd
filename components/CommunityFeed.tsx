import React, { useState, useRef, useEffect } from 'react';
import { UserDto, Post, StudentGroupDto, ReactionType, CreatePostDto, CommunityDto, getRoleLabel } from '../types';
import { MessageCircle, Share2, MoreHorizontal, Send, Search, UserPlus, MessageSquare, Users, X, ThumbsUp, ArrowLeft, Trash2, Pencil, Check, Loader2, AlertCircle } from 'lucide-react';
import { CommentSection } from './CommentSection';
import { communityService } from '../services/api';

interface CommunityFeedProps {
  user: UserDto;
  posts: Post[];
  users: UserDto[];
  studentGroups: StudentGroupDto[];
  myCommunities: CommunityDto[]; 
  addPost: (post: Post) => void;
  onUpdatePost?: (post: Post) => void;
  onDeletePost?: (postId: string) => void;
  viewingCommunityId?: string | null;
  onBack?: () => void;
}

type SearchFilter = 'all' | 'posts' | 'people' | 'communities';

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ 
    user, posts, users, studentGroups, myCommunities, addPost, onUpdatePost, onDeletePost, viewingCommunityId, onBack 
}) => {
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedCommunityId, setSelectedCommunityId] = useState(viewingCommunityId || '');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('all');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);

  const [reactionDockPostId, setReactionDockPostId] = useState<string | null>(null);
  const longPressTimer = useRef<any>(null);
  const isLongPress = useRef(false);
  const [postRefresh, setPostRefresh] = useState(0); 

  useEffect(() => {
      if (viewingCommunityId) {
          setSelectedCommunityId(viewingCommunityId);
      }
  }, [viewingCommunityId]);

  useEffect(() => {
      const handleClickOutside = () => {
          setReactionDockPostId(null);
          setActiveMenuPostId(null);
      };
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const currentViewCommunity = viewingCommunityId 
    ? myCommunities.find(c => c.id === viewingCommunityId) 
    : null;

  const startPress = (postId: string) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
        isLongPress.current = true;
        setReactionDockPostId(postId);
        if (navigator.vibrate) navigator.vibrate(50);
    }, 400); 
  };

  const cancelPress = () => {
    if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
    }
  };

  const handleMouseUp = (postId: string) => {
      cancelPress();
      if (!isLongPress.current && reactionDockPostId !== postId) {
          handleReaction(postId, ReactionType.Like);
      }
  };

  const handleTouchEnd = (e: React.TouchEvent, postId: string) => {
      cancelPress();

      if (isLongPress.current) {
          const touch = e.changedTouches[0];
          const element = document.elementFromPoint(touch.clientX, touch.clientY);
          const reactionBtn = element?.closest('[data-reaction-type]');
          
          if (reactionBtn) {
              const type = parseInt(reactionBtn.getAttribute('data-reaction-type') || '0');
              handleReaction(postId, type);
          }
          setReactionDockPostId(null);
          isLongPress.current = false;
      } else if (reactionDockPostId !== postId) {
          handleReaction(postId, ReactionType.Like);
      }
  };

  const isTitleValid = (t: string) => t.length >= 3 && t.length <= 200;
  const isContentValid = (c: string) => c.length >= 10 && c.length <= 5000;

  const isCreateValid = isTitleValid(newPostTitle) && isContentValid(newPostContent) && selectedCommunityId;
  const isEditValid = isTitleValid(editTitle) && isContentValid(editContent);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCreateValid) return;

    const createDto: CreatePostDto = {
        title: newPostTitle,
        content: newPostContent,
        communityId: selectedCommunityId
    };

    const response = await communityService.createPost(createDto);
    if (response.success && response.data) {
        addPost(response.data);
        setNewPostTitle('');
        setNewPostContent('');
        if (!viewingCommunityId) setSelectedCommunityId('');
    } else {
        alert("Failed to publish post: " + (response.message || 'Unknown error'));
    }
  };

  const startEditing = (post: Post) => {
      setEditingPostId(post.id);
      setEditTitle(post.title);
      setEditContent(post.content);
      setActiveMenuPostId(null);
  };

  const handleUpdatePost = async () => {
      if (!editingPostId || !onUpdatePost || !isEditValid) return;
      setIsUpdating(true);
      const res = await communityService.updatePost(editingPostId, {
          title: editTitle,
          content: editContent
      });
      setIsUpdating(false);

      if (res.success && res.data) {
          onUpdatePost(res.data);
          setEditingPostId(null);
      } else {
          alert("Failed to update post: " + res.message);
      }
  };

  const handleDeletePost = async (postId: string) => {
      if (!confirm("Are you sure you want to delete this post?") || !onDeletePost) return;
      const res = await communityService.deletePost(postId);
      if (res.success) {
          onDeletePost(postId);
      } else {
          alert("Failed to delete post: " + res.message);
      }
  };

  const handleReaction = async (postId: string, type: ReactionType) => {
      const post = posts.find(p => p.id === postId);
      if(!post) return;
      await communityService.toggleReaction(postId, type);
      
      if (post.currentUserReaction === type) {
          post.totalReactions--;
          post.currentUserReaction = null;
          if (type === ReactionType.Like) post.likeCount--;
          if (type === ReactionType.Love) post.loveCount--;
          if (type === ReactionType.Wow) post.wowCount--;
          if (type === ReactionType.Laugh) post.laughCount--;
          if (type === ReactionType.Sad) post.sadCount--;
          if (type === ReactionType.Angry) post.angryCount--;
      } else {
          if (post.currentUserReaction !== null && post.currentUserReaction !== undefined) {
               const oldType = post.currentUserReaction;
               post.totalReactions--;
               if (oldType === ReactionType.Like) post.likeCount--;
               if (oldType === ReactionType.Love) post.loveCount--;
               if (oldType === ReactionType.Wow) post.wowCount--;
               if (oldType === ReactionType.Laugh) post.laughCount--;
               if (oldType === ReactionType.Sad) post.sadCount--;
               if (oldType === ReactionType.Angry) post.angryCount--;
          }
          post.totalReactions++;
          post.currentUserReaction = type;
          if (type === ReactionType.Like) post.likeCount++;
          if (type === ReactionType.Love) post.loveCount++;
          if (type === ReactionType.Wow) post.wowCount++;
          if (type === ReactionType.Laugh) post.laughCount++;
          if (type === ReactionType.Sad) post.sadCount++;
          if (type === ReactionType.Angry) post.angryCount++;
      }
      setPostRefresh(prev => prev + 1);
  };

  const getUserById = (id: string) => users.find(u => u.id === id) || { 
      fullName: 'Unknown User', 
      firstName: 'Unknown',
      role: -1, 
      profilePictureUrl: '' 
  };

  const basePosts = viewingCommunityId 
    ? posts.filter(p => p.communityId === viewingCommunityId)
    : posts;

  const filteredPosts = basePosts.filter(p => p.content.toLowerCase().includes(searchQuery.toLowerCase()) || p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const filteredUsers = viewingCommunityId ? [] : users.filter(u => u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) && u.id !== user.id);
  const filteredGroups = viewingCommunityId ? [] : studentGroups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.code.toLowerCase().includes(searchQuery.toLowerCase()));

  const clearSearch = () => {
      setSearchQuery('');
      setActiveFilter('all');
  };

  const toggleComments = (postId: string) => {
      setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  const getReactionConfig = (type?: ReactionType | null) => {
      switch (type) {
          case ReactionType.Like: return { label: 'Like', color: 'text-blue-600' };
          case ReactionType.Love: return { label: 'Love', color: 'text-red-600' };
          case ReactionType.Wow: return { label: 'Wow', color: 'text-stone-600' };
          case ReactionType.Laugh: return { label: 'Haha', color: 'text-stone-600' };
          case ReactionType.Sad: return { label: 'Sad', color: 'text-stone-600' };
          case ReactionType.Angry: return { label: 'Angry', color: 'text-orange-600' };
          default: return { label: 'Like', color: 'text-stone-500' };
      }
  };

  const REACTIONS = [
    { type: ReactionType.Like, char: 'LIKE' },
    { type: ReactionType.Love, char: 'LOVE' },
    { type: ReactionType.Wow, char: 'WOW' },
    { type: ReactionType.Laugh, char: 'HAHA' },
    { type: ReactionType.Sad, char: 'SAD' },
    { type: ReactionType.Angry, char: 'ANGRY' },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      
      {viewingCommunityId && onBack && (
          <div className="flex items-center gap-4 mb-4 bg-white p-4 rounded-2xl shadow-sm border border-stone-100 animate-in slide-in-from-left-4">
              <button onClick={onBack} className="p-2 rounded-full hover:bg-stone-100 transition-colors">
                  <ArrowLeft size={24} className="text-stone-700"/>
              </button>
              <div>
                  <h2 className="text-2xl font-black text-stone-900">{currentViewCommunity?.name || 'Community'}</h2>
                  <p className="text-sm text-stone-500 font-medium">{currentViewCommunity?.memberCount || 0} Members</p>
              </div>
          </div>
      )}

      {!viewingCommunityId && (
        <div className="relative z-20 mb-2">
            <div className="absolute inset-0 bg-red-900 blur-2xl opacity-5 rounded-full"></div>
            <div className="relative bg-white rounded-2xl shadow-lg shadow-stone-200/50 flex items-center p-1 border border-stone-100 focus-within:border-red-900 transition-all ring-4 ring-stone-50/50">
                <div className="w-12 h-12 flex items-center justify-center text-stone-400">
                    <Search size={22} />
                </div>
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full h-12 bg-transparent outline-none text-stone-700 font-medium placeholder:text-stone-400 text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button onClick={clearSearch} className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-stone-600 bg-stone-50 rounded-xl mr-1">
                        <X size={18} />
                    </button>
                )}
            </div>
        </div>
      )}

      {!viewingCommunityId && searchQuery && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {[{ id: 'all', label: 'All Results' }, { id: 'people', label: 'People' }, { id: 'communities', label: 'Communities' }, { id: 'posts', label: 'Posts' }].map(f => (
                  <button 
                    key={f.id}
                    onClick={() => setActiveFilter(f.id as SearchFilter)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeFilter === f.id ? 'bg-red-900 text-white shadow-lg shadow-stone-200' : 'bg-white text-stone-500 border border-stone-100 hover:bg-stone-50'}`}
                  >
                      {f.label}
                  </button>
              ))}
          </div>
      )}

      {searchQuery && (activeFilter === 'all' || activeFilter === 'communities') && filteredGroups.length > 0 && (
          <div className="mb-4">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 px-2">Communities</h3>
              <div className={`grid gap-4 ${activeFilter === 'communities' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  {filteredGroups.map(g => (
                      <div key={g.id} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group cursor-pointer">
                           <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center group-hover:rotate-6 transition-transform shrink-0">
                               <Users size={20} />
                           </div>
                           <div className="flex-1 overflow-hidden">
                               <h4 className="font-bold text-stone-800 text-sm truncate">{g.name}</h4>
                               <p className="text-xs text-stone-500 truncate">{g.studentCount || 0} members • {g.code}</p>
                           </div>
                           <button className="px-3 py-1.5 bg-stone-50 text-stone-600 text-xs font-bold rounded-lg hover:bg-stone-100">Visit</button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {searchQuery && (activeFilter === 'all' || activeFilter === 'people') && filteredUsers.length > 0 && (
          <div className="mb-4">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 px-2">People</h3>
              <div className={activeFilter === 'people' ? 'grid grid-cols-2 gap-4' : 'flex gap-4 overflow-x-auto pb-4 scrollbar-hide'}>
                  {filteredUsers.map(u => (
                      <div key={u.id} className={`bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center text-center ${activeFilter === 'people' ? 'min-w-0' : 'min-w-[200px]'}`}>
                           <div className="w-16 h-16 rounded-full bg-stone-100 mb-3 overflow-hidden">
                               {u.profilePictureUrl ? (
                                   <img src={u.profilePictureUrl} alt={u.firstName} className="w-full h-full object-cover"/>
                               ) : (
                                   <div className="w-full h-full flex items-center justify-center text-stone-300 font-bold text-xl">{u.firstName?.charAt(0)}</div>
                               )}
                           </div>
                           <h4 className="font-bold text-stone-800 text-sm truncate w-full">{u.fullName}</h4>
                           <p className="text-xs text-stone-500 mb-3">{getRoleLabel(u.role)}</p>
                           <div className="flex gap-2 w-full">
                               <button className="flex-1 bg-stone-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-stone-700 flex justify-center"><UserPlus size={14}/></button>
                               <button className="flex-1 bg-stone-100 text-stone-600 text-xs font-bold py-2 rounded-lg hover:bg-stone-200 flex justify-center"><MessageSquare size={14}/></button>
                           </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {!searchQuery && (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-900 font-bold overflow-hidden shrink-0">
                {user.profilePictureUrl ? (
                    <img src={user.profilePictureUrl} alt={user.firstName} className="w-full h-full object-cover"/>
                ) : (
                    user.firstName.charAt(0)
                )}
            </div>
            <div className="flex-1">
                <form onSubmit={handlePostSubmit} className="space-y-3">
                    <input 
                        type="text" 
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        placeholder="Post Title"
                        className="w-full border-0 bg-transparent text-lg font-bold placeholder:text-stone-400 focus:ring-0 px-0 text-stone-800"
                    />
                    <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder={viewingCommunityId ? `Share with ${currentViewCommunity?.name}...` : `What's happening in your department?`}
                        className="w-full border-0 bg-stone-50 rounded-lg p-3 focus:ring-2 focus:ring-red-900 resize-none text-stone-700 min-h-[100px]"
                        rows={3}
                    />
                    
                    <div className="flex justify-between items-center pt-2">
                        <select 
                            value={selectedCommunityId}
                            onChange={(e) => setSelectedCommunityId(e.target.value)}
                            className={`text-sm bg-stone-50 border-0 rounded-lg py-2 px-3 text-stone-600 font-medium focus:ring-2 focus:ring-red-900 max-w-[50%] ${viewingCommunityId ? 'opacity-75 cursor-not-allowed' : ''}`}
                            required
                            disabled={!!viewingCommunityId}
                        >
                            <option value="">Select Community...</option>
                            {myCommunities && myCommunities.length > 0 ? (
                                myCommunities.map(comm => (
                                    <option key={comm.id} value={comm.id}>{comm.name}</option>
                                ))
                            ) : null}
                        </select>

                        <div className="flex items-center gap-3">
                            {(!isCreateValid && (newPostTitle || newPostContent)) && (
                                <span className="text-[10px] text-red-800 flex items-center gap-1 font-medium bg-red-50 px-2 py-1 rounded">
                                    <AlertCircle size={12}/> Title 3+ chars, Content 10+ chars
                                </span>
                            )}
                            <button
                                type="submit"
                                disabled={!isCreateValid}
                                className="bg-red-900 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Send size={16} />
                                Post
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            </div>
        </div>
      )}

      {(searchQuery && (activeFilter === 'all' || activeFilter === 'posts')) && (
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest px-2">Posts</h3>
      )}

      {(activeFilter === 'all' || activeFilter === 'posts') && (
          <div className="space-y-4">
            {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => {
                const author = getUserById(post.authorId); 
                const reactionConfig = getReactionConfig(post.currentUserReaction);
                const hasReacted = post.currentUserReaction !== null && post.currentUserReaction !== undefined;
                const isDockOpen = reactionDockPostId === post.id;
                const isEditing = editingPostId === post.id;
                const isMenuOpen = activeMenuPostId === post.id;
                
                const reactionBreakdown = `Likes: ${post.likeCount}, Loves: ${post.loveCount}, Wows: ${post.wowCount}`;

                return (
                    <div key={post.id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-visible transition-all duration-300">
                    <div className="p-4 flex items-start justify-between">
                        <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-bold text-sm overflow-hidden">
                            {(author as any).profilePictureUrl ? (
                                <img src={(author as any).profilePictureUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                (author.firstName || 'U').charAt(0)
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-stone-900">{post.authorName}</h3>
                            <p className="text-xs text-stone-500">
                                <span className="font-medium text-red-900">{post.communityName}</span> • {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        </div>

                        {(post.canEdit || post.canDelete) && (
                            <div className="relative">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveMenuPostId(isMenuOpen ? null : post.id); }}
                                    className="text-stone-400 hover:text-stone-600 p-2 rounded-full hover:bg-stone-50 transition-colors"
                                >
                                    <MoreHorizontal size={20} />
                                </button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                        {post.canEdit && (
                                            <button 
                                                onClick={() => startEditing(post)}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors text-left"
                                            >
                                                <Pencil size={16} /> Edit Post
                                            </button>
                                        )}
                                        {post.canDelete && (
                                            <button 
                                                onClick={() => handleDeletePost(post.id)}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left border-t border-stone-50"
                                            >
                                                <Trash2 size={16} /> Delete Post
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="px-4 pb-3">
                        {isEditing ? (
                            <div className="space-y-3">
                                <input 
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full p-2 text-lg font-bold border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-900 outline-none"
                                    placeholder="Title"
                                />
                                <textarea 
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full p-3 min-h-[100px] border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-900 outline-none text-stone-700 bg-stone-50"
                                    placeholder="Content"
                                />
                                <div className="flex justify-end gap-2 items-center">
                                    {!isEditValid && (
                                        <span className="text-[10px] text-red-800 flex items-center gap-1 font-medium bg-red-50 px-2 py-1 rounded mr-auto">
                                            <AlertCircle size={12}/> Min lengths not met
                                        </span>
                                    )}
                                    <button 
                                        onClick={() => setEditingPostId(null)}
                                        className="px-4 py-2 text-xs font-bold text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleUpdatePost}
                                        disabled={isUpdating || !isEditValid}
                                        className="px-4 py-2 text-xs font-bold text-white bg-red-900 hover:bg-red-800 rounded-lg flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isUpdating ? <Loader2 size={14} className="animate-spin"/> : <Check size={14} />} Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h4 className="font-bold text-lg text-stone-900 mb-1">{post.title}</h4>
                                <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                            </>
                        )}
                    </div>

                    <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 flex items-center gap-6 text-stone-500 relative select-none">
                        
                        <div 
                            className="relative"
                            onMouseDown={() => startPress(post.id)}
                            onMouseUp={() => handleMouseUp(post.id)}
                            onMouseLeave={cancelPress}
                            onTouchStart={() => startPress(post.id)}
                            onTouchEnd={(e) => handleTouchEnd(e, post.id)}
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            {isDockOpen && (
                                <div 
                                    className="absolute bottom-full left-0 mb-3 flex bg-white shadow-2xl shadow-stone-400/50 rounded-full border border-stone-100 p-2 gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200 z-50 origin-bottom-left scale-110"
                                    onClick={(e) => e.stopPropagation()} 
                                >
                                    {REACTIONS.map(reaction => (
                                        <div 
                                            key={reaction.type}
                                            data-reaction-type={reaction.type}
                                            onMouseUp={(e) => {
                                                e.stopPropagation();
                                                handleReaction(post.id, reaction.type);
                                                setReactionDockPostId(null);
                                            }}
                                            className="hover:scale-110 active:scale-95 transition-transform px-2 py-1 text-xs font-bold rounded-full bg-stone-50 border border-stone-200 cursor-pointer" 
                                            title={ReactionType[reaction.type]}
                                        >
                                            {reaction.char}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button 
                                className={`flex items-center gap-2 text-sm transition-all py-1 px-2 rounded-lg active:scale-95 ${hasReacted ? reactionConfig.color : 'hover:bg-stone-200/50 hover:text-stone-700'}`}
                                style={{ touchAction: 'none' }}
                                title={reactionBreakdown}
                            >
                                <ThumbsUp size={18} />
                                <span className={`font-bold ${hasReacted ? '' : 'text-stone-500'}`}>{reactionConfig.label}</span>
                                {post.totalReactions > 0 && <span className="bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded text-[10px] ml-1">{post.totalReactions}</span>}
                            </button>
                        </div>

                        <button 
                            onClick={() => toggleComments(post.id)}
                            className={`flex items-center gap-2 text-sm transition-colors ${expandedPostId === post.id ? 'text-red-900' : 'hover:text-red-900'}`}
                        >
                            <MessageCircle size={18} className={expandedPostId === post.id ? 'fill-current' : ''}/>
                            <span>{post.commentCount} Comments</span>
                        </button>
                        <button className="flex items-center gap-2 text-sm hover:text-stone-900 transition-colors ml-auto">
                            <Share2 size={18} />
                            <span>Share</span>
                        </button>
                    </div>

                    {expandedPostId === post.id && (
                        <div className="px-4 pb-6 bg-stone-50">
                            <CommentSection postId={post.id} currentUser={user} />
                        </div>
                    )}

                    </div>
                );
                })
            ) : (
                <div className="text-center py-12">
                    <p className="text-stone-400 font-medium">No posts found in this feed.</p>
                </div>
            )}
        </div>
      )}
      
      {searchQuery && filteredPosts.length === 0 && filteredUsers.length === 0 && filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                <Search size={24} />
            </div>
            <p className="text-stone-500 font-medium">No results found for "{searchQuery}"</p>
          </div>
      )}
    </div>
  );
};
