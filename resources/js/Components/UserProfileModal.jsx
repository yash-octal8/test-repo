import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, UserX, ShieldAlert, Trash2 } from 'lucide-react';
import UserAvatar from './UserAvatar';

const UserProfileModal = ({ isOpen, onClose, user, onStartChat, onRemoveFriend, onBlockUser, onUnblockUser, onDeleteChat, isOnline, onAddFriend, isFriend }) => {
    if (!user) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-[#0B0C10] w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-white/5"
                    >
                        {/* Header/Cover */}
                        <div className="h-28 bg-indigo-600 relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all backdrop-blur-md"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Profile Info */}
                        <div className="px-6 pb-6 -mt-10 relative text-center">
                            <div className="inline-block relative mb-3">
                                <div className="p-1 bg-[#1e1f22] rounded-full">
                                    <UserAvatar
                                        src={user.profile_image}
                                        size="xl"
                                        isActive={isOnline}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 mb-6">
                                <h2 className="text-lg font-bold text-white">{user.name}</h2>
                                <p className="text-[10px] text-gray-400 font-mono">ID: {user.id || '6891c7dbb2ae05db4ad984be'}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => {
                                        if (isFriend) {
                                            if (onRemoveFriend) onRemoveFriend(user.id);
                                        } else {
                                            if (onAddFriend) onAddFriend();
                                        }
                                        onClose();
                                    }}
                                    className={`flex-1 ${isFriend ? 'bg-red-500 hover:bg-red-600' : 'bg-[#5865F2] hover:bg-[#4752c4]'} text-white py-2.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                                    disabled={user.is_blocked}
                                >
                                    {isFriend ? 'Remove Friend' : 'Add Friend'}
                                </button>
                                <button
                                    onClick={() => {
                                        onStartChat(user.id);
                                        onClose();
                                    }}
                                    className="w-10 flex items-center justify-center bg-[#2b2d31] hover:bg-[#35373c] text-gray-400 rounded-md transition-colors"
                                >
                                    <MessageSquare size={16} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">CHITCHAT JOIN DATE</p>
                                    <p className="text-xs text-gray-300 font-bold">05/08/2025</p>
                                </div>

                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">INTERESTS</p>
                                    <div className="bg-[#111214] rounded-lg p-4 flex flex-col items-center justify-center gap-2 border border-white/5">
                                        <div className="w-8 h-8 rounded-full border-2 border-gray-600 flex items-center justify-center">
                                            <ShieldAlert size={14} className="text-gray-400" />
                                        </div>
                                        <p className="text-xs text-gray-400 font-bold">Hidden</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/5">
                                <div className="mt-6 pt-4 border-t border-white/5">
                                    {user.is_blocked ? (
                                        <button
                                            onClick={() => { onUnblockUser(user.id); onClose(); }}
                                            className="text-gray-400 text-xs font-bold hover:underline"
                                        >
                                            Unblock
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => { onBlockUser(user.id); onClose(); }}
                                            className="text-red-500 text-xs font-bold hover:underline"
                                        >
                                            Block
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UserProfileModal;
