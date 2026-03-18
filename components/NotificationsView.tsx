
import React from 'react';
import { Notification } from '../types';
import { Heart, MessageCircle, UserPlus, Info, Users, Clock } from 'lucide-react';

interface NotificationsViewProps {
    notifications: Notification[];
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ notifications }) => {
    
    const getIcon = (type: string) => {
        switch(type) {
            case 'like': return <Heart size={18} className="text-white fill-current" />;
            case 'comment': return <MessageCircle size={18} className="text-white" />;
            case 'follow': return <UserPlus size={18} className="text-white" />;
            case 'group_invite': return <Users size={18} className="text-white" />;
            default: return <Info size={18} className="text-white" />;
        }
    };

    const getBgColor = (type: string) => {
        switch(type) {
            case 'like': return 'bg-red-900';
            case 'comment': return 'bg-stone-600';
            case 'follow': return 'bg-red-800';
            case 'group_invite': return 'bg-orange-600';
            default: return 'bg-stone-400';
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8">
            <div className="flex items-center justify-between mb-8">
                 <h2 className="text-3xl font-black text-stone-900 tracking-tight">Notifications</h2>
                 <button className="text-sm font-bold text-red-900 hover:text-red-800 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors">
                     Mark all as read
                 </button>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-3xl border border-stone-100">
                        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                            <Clock size={24} />
                        </div>
                        <p className="text-stone-500 font-medium">No notifications yet.</p>
                    </div>
                )}

                {notifications.map(notif => (
                    <div key={notif.id} className={`relative p-4 md:p-6 rounded-2xl flex items-start gap-4 transition-all hover:-translate-y-1 ${notif.isRead ? 'bg-white border border-stone-100 shadow-sm' : 'bg-red-50/50 border border-red-100 shadow-md'}`}>
                        <div className={`w-12 h-12 shrink-0 rounded-full ${getBgColor(notif.type)} flex items-center justify-center shadow-md`}>
                            {getIcon(notif.type)}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <p className="text-stone-800 leading-snug text-base">
                                    <span className="font-bold">{notif.actorName || 'System'}</span> {notif.message}
                                </p>
                                {!notif.isRead && <div className="w-2 h-2 rounded-full bg-red-600 shrink-0 mt-2"></div>}
                            </div>
                            <p className="text-xs font-bold text-stone-400 mt-2">
                                {new Date(notif.timestamp).toLocaleString()}
                            </p>
                            
                            {notif.type === 'group_invite' && (
                                <div className="mt-3 flex gap-3">
                                    <button className="px-4 py-1.5 bg-stone-900 text-white text-xs font-bold rounded-lg hover:bg-stone-800 transition-colors">Accept</button>
                                    <button className="px-4 py-1.5 bg-white border border-stone-200 text-stone-600 text-xs font-bold rounded-lg hover:bg-stone-50 transition-colors">Decline</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
