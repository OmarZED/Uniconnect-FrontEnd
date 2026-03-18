import React, { useState, useEffect } from 'react';
import { CommentDto, UserDto, VoteType } from '../types';
import { commentService } from '../services/api';
import { ArrowBigUp, ArrowBigDown, MessageSquare, User, Loader2, Send, Pencil, Trash2, X, Check } from 'lucide-react';

interface CommentSectionProps {
    postId: string;
    currentUser: UserDto;
}

interface CommentItemProps {
    comment: CommentDto;
    currentUser: UserDto;
    depth: number;
    onReply: (parentId: string, content: string) => Promise<void>;
    onVote: (commentId: string, type: VoteType) => Promise<void>;
    onEdit: (commentId: string, content: string) => Promise<void>;
    onDelete: (commentId: string) => Promise<void>;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, currentUser, depth, onReply, onVote, onEdit, onDelete }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [collapsed, setCollapsed] = useState(false);
    
    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [isSaving, setIsSaving] = useState(false);

    const replies = comment.replies || [];
    const hasReplies = replies.length > 0;
    const canReply = depth < 2;
    const score = comment.score ?? 0;
    const upvoteCount = comment.upvoteCount ?? 0;
    const downvoteCount = comment.downvoteCount ?? 0;

    const handleSubmitReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!replyContent.trim()) return;
        await onReply(comment.id, replyContent);
        setReplyContent('');
        setIsReplying(false);
    };

    const handleEditSubmit = async () => {
        if (!editContent.trim()) return;
        setIsSaving(true);
        await onEdit(comment.id, editContent);
        setIsSaving(false);
        setIsEditing(false);
    };

    const handleDeleteClick = async () => {
        await onDelete(comment.id);
    };

    const handleVoteClick = (type: VoteType) => {
        if (comment.currentUserVote === type) return;
        onVote(comment.id, type);
    };

    return (
        <div className={`flex gap-2 ${depth > 0 ? 'mt-4' : 'mt-6'}`}>
            {/* Avatar + thread line */}
            <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center shrink-0 mb-1 overflow-hidden">
                    {comment.authorProfilePicture ? (
                        <img src={comment.authorProfilePicture} className="w-full h-full object-cover" />
                    ) : (
                        <User size={14} className="text-stone-400" />
                    )}
                </div>
                <div className={`w-0.5 grow bg-stone-100/80 group-hover:bg-stone-200 transition-colors ${collapsed ? 'hidden' : ''}`}></div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 text-xs">
                    <span className="font-bold text-stone-800">{comment.authorName}</span>
                    <span className="text-stone-400">•</span>
                    <span className="text-stone-400">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>

                <div className="group relative">
                    {!isEditing && !collapsed && (comment.canEdit || comment.canDelete) && (
                        <div className="absolute right-0 top-0 hidden group-hover:flex gap-1 bg-stone-50 rounded-lg p-1 shadow-sm border border-stone-100">
                             {comment.canEdit && (
                                <button onClick={() => { setIsEditing(true); setEditContent(comment.content); }} className="p-1 text-stone-400 hover:text-stone-700 hover:bg-white rounded">
                                    <Pencil size={12} />
                                </button>
                             )}
                             {comment.canDelete && (
                                <button onClick={handleDeleteClick} className="p-1 text-stone-400 hover:text-rose-600 hover:bg-white rounded">
                                    <Trash2 size={12} />
                                </button>
                             )}
                        </div>
                    )}

                    {isEditing ? (
                         <div className="bg-stone-50 p-2 rounded-xl border border-stone-200">
                             <textarea 
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                                className="w-full bg-transparent text-sm outline-none text-stone-700 resize-none"
                                rows={2}
                             />
                             <div className="flex justify-end gap-2 mt-2">
                                 <button onClick={() => setIsEditing(false)} className="p-1 text-stone-500 hover:bg-stone-200 rounded"><X size={14}/></button>
                                 <button onClick={handleEditSubmit} disabled={isSaving} className="p-1 text-red-900 hover:bg-red-100 rounded">
                                     {isSaving ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
                                 </button>
                             </div>
                         </div>
                    ) : (
                        <div onClick={() => setCollapsed(!collapsed)} className="cursor-pointer pr-10">
                            <p className={`text-stone-700 text-sm leading-relaxed inline ${collapsed ? 'italic text-stone-400' : ''}`}>
                                {collapsed ? 'Comment collapsed' : comment.content}
                            </p>
                        </div>
                    )}

                    {!collapsed && !isEditing && (
                        <>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center bg-stone-50 rounded-lg p-0.5 border border-stone-100">
                                    <button 
                                        onClick={() => handleVoteClick(VoteType.Upvote)}
                                        className={`p-1 rounded hover:bg-stone-200 transition-colors ${comment.currentUserVote === VoteType.Upvote ? 'text-orange-600' : 'text-stone-400'}`}
                                    >
                                        <ArrowBigUp size={20} className={comment.currentUserVote === VoteType.Upvote ? 'fill-current' : ''} />
                                    </button>
                                    <span className={`text-xs font-bold w-6 text-center ${
                                        comment.currentUserVote === VoteType.Upvote ? 'text-orange-600' : 
                                        comment.currentUserVote === VoteType.Downvote ? 'text-red-900' : 'text-stone-600'
                                    }`}>
                                        {score}
                                    </span>
                                    <button 
                                        onClick={() => handleVoteClick(VoteType.Downvote)}
                                        className={`p-1 rounded hover:bg-stone-200 transition-colors ${comment.currentUserVote === VoteType.Downvote ? 'text-red-900' : 'text-stone-400'}`}
                                    >
                                        <ArrowBigDown size={20} className={comment.currentUserVote === VoteType.Downvote ? 'fill-current' : ''} />
                                    </button>
                                </div>

                                {canReply && (
                                    <button 
                                        onClick={() => setIsReplying(!isReplying)}
                                        className="flex items-center gap-1 text-xs font-bold text-stone-500 hover:bg-stone-100 px-2 py-1 rounded transition-colors"
                                    >
                                        <MessageSquare size={14} /> Reply
                                    </button>
                                )}
                            </div>

                            {isReplying && (
                                <form onSubmit={handleSubmitReply} className="mt-3 flex gap-2">
                                    <div className="w-0.5 bg-stone-200 mx-3"></div>
                                    <div className="flex-1">
                                        <textarea
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder={`Replying to ${comment.authorName}...`}
                                            className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-900 min-h-[80px]"
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button 
                                                type="button" 
                                                onClick={() => setIsReplying(false)}
                                                className="text-xs font-bold text-stone-500 hover:text-stone-700 px-3 py-1.5"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit"
                                                disabled={!replyContent.trim()}
                                                className="bg-red-900 text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-red-800 disabled:opacity-50"
                                            >
                                                Reply
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </>
                    )}
                </div>

                {!collapsed && hasReplies && (
                    <div className="relative">
                        {replies.map(reply => (
                            <CommentItem 
                                key={reply.id} 
                                comment={reply} 
                                currentUser={currentUser}
                                depth={depth + 1}
                                onReply={onReply}
                                onVote={onVote}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, currentUser }) => {
    const [comments, setComments] = useState<CommentDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [rootComment, setRootComment] = useState('');

    useEffect(() => {
        loadComments();
    }, [postId]);

    const loadComments = async () => {
        setLoading(true);
        const res = await commentService.getCommentsByPostId(postId);
        if(res.success && res.data) {
            setComments(res.data);
        }
        setLoading(false);
    };

    const updateCommentInTree = (list: CommentDto[], commentId: string, updater: (c: CommentDto) => CommentDto | null): CommentDto[] => {
        return list
            .map(c => {
                if (c.id === commentId) {
                    return updater(c);
                }
                const replies = c.replies || [];
                if (replies.length > 0) {
                    return { ...c, replies: updateCommentInTree(replies, commentId, updater) };
                }
                return c;
            })
            .filter((c): c is CommentDto => c !== null);
    };

    const appendReplyToTree = (list: CommentDto[], parentId: string, newReply: CommentDto): CommentDto[] => {
        return list.map(c => {
            if (c.id === parentId) {
                const replies = c.replies || [];
                return { ...c, replies: [...replies, newReply] };
            }
            const replies = c.replies || [];
            if (replies.length > 0) {
                return { ...c, replies: appendReplyToTree(replies, parentId, newReply) };
            }
            return c;
        });
    };

    const handleAddComment = async (parentId: string | undefined, content: string) => {
        const res = await commentService.addComment({
            postId,
            parentCommentId: parentId,
            content
        });

        if(res.success && res.data) {
            if (parentId) {
                setComments(prev => appendReplyToTree(prev, parentId, res.data!));
            } else {
                setComments(prev => [...prev, res.data!]);
            }
        } else {
            alert("Failed to post comment");
        }
    };

    const handleEditComment = async (commentId: string, content: string) => {
        const res = await commentService.updateComment(commentId, content);
        if (res.success && res.data) {
             setComments(prev => updateCommentInTree(prev, commentId, c => ({...c, content })));
        } else {
             alert("Failed to update comment");
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if(!confirm("Are you sure you want to delete this comment?")) return;
        
        const prevComments = [...comments];
        setComments(prev => updateCommentInTree(prev, commentId, () => null));

        const res = await commentService.deleteComment(commentId);
        if (!res.success) {
             alert("Failed to delete comment");
             setComments(prevComments);
        }
    };

    const handleVote = async (commentId: string, type: VoteType) => {
        setComments(prev => updateCommentInTree(prev, commentId, c => {
            const currentVote = c.currentUserVote;
            let newScore = c.score ?? 0;
            let newUp = c.upvoteCount ?? 0;
            let newDown = c.downvoteCount ?? 0;

            if (currentVote === VoteType.Upvote) { newUp--; newScore--; }
            if (currentVote === VoteType.Downvote) { newDown--; newScore++; }

            if (type === VoteType.Upvote) { newUp++; newScore++; }
            if (type === VoteType.Downvote) { newDown++; newScore--; }

            return { 
                ...c, 
                currentUserVote: type, 
                score: newScore,
                upvoteCount: newUp,
                downvoteCount: newDown
            };
        }));

        await commentService.voteComment(commentId, type);
    };

    return (
        <div className="pt-4 border-t border-stone-100 mt-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-stone-200 shrink-0 overflow-hidden">
                    {currentUser.profilePictureUrl ? (
                         <img src={currentUser.profilePictureUrl} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-500 font-bold text-xs">{currentUser.firstName?.charAt(0)}</div>
                    )}
                </div>
                <div className="flex-1 relative">
                    <input 
                        type="text" 
                        value={rootComment}
                        onChange={(e) => setRootComment(e.target.value)}
                        placeholder="Add to the discussion..." 
                        className="w-full bg-stone-50 border border-stone-200 rounded-full py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-900 pr-10"
                        onKeyDown={(e) => {
                            if(e.key === 'Enter' && rootComment.trim()) {
                                handleAddComment(undefined, rootComment);
                                setRootComment('');
                            }
                        }}
                    />
                    <button 
                        onClick={() => {
                            if(rootComment.trim()) {
                                handleAddComment(undefined, rootComment);
                                setRootComment('');
                            }
                        }}
                        disabled={!rootComment.trim()}
                        className="absolute right-1.5 top-1.5 p-1.5 bg-red-900 text-white rounded-full hover:bg-red-800 disabled:opacity-0 transition-all"
                    >
                        <Send size={12} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-stone-300" />
                </div>
            ) : (
                <div className="space-y-1">
                    {comments.length === 0 ? (
                        <p className="text-center text-stone-400 text-sm py-4 italic">No comments yet. Be the first!</p>
                    ) : (
                        comments.map(comment => (
                            <CommentItem 
                                key={comment.id} 
                                comment={comment} 
                                currentUser={currentUser}
                                depth={0}
                                onReply={handleAddComment}
                                onVote={handleVote}
                                onEdit={handleEditComment}
                                onDelete={handleDeleteComment}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
