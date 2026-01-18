import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceCallDialog = ({
    isOpen,
    onClose,
    partner,
    callStatus, // 'calling', 'incoming', 'connected', 'ended'
    onAccept,
    onReject,
    onEnd,
    isMuted,
    onToggleMute
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-sm bg-[#1e1f22] rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
                >
                    <div className="p-8 flex flex-col items-center">
                        {/* Partner Avatar */}
                        <div className="relative mb-6">
                            <div className="w-24 h-24 rounded-full bg-indigo-500/20 p-1">
                                <div className="w-full h-full rounded-full bg-gray-800 overflow-hidden border-2 border-indigo-500/30 flex items-center justify-center">
                                    {partner?.profile_image ? (
                                        <img src={partner.profile_image} className="w-full h-full object-cover" alt={partner.name} />
                                    ) : (
                                        <User size={40} className="text-gray-500" />
                                    )}
                                </div>
                            </div>
                            {callStatus === 'connected' && (
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-[#1e1f22] animate-pulse" />
                            )}
                        </div>

                        <h3 className="text-xl font-black text-white mb-1">{partner?.name || 'Stranger'}</h3>
                        <p className="text-sm text-gray-400 font-medium mb-8">
                            {callStatus === 'calling' && 'Calling...'}
                            {callStatus === 'incoming' && 'Incoming voice call...'}
                            {callStatus === 'connected' && 'In call'}
                            {callStatus === 'ended' && 'Call ended'}
                        </p>

                        {/* Controls */}
                        <div className="flex items-center gap-6">
                            {callStatus === 'incoming' ? (
                                <>
                                    <button
                                        onClick={onReject}
                                        className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20 transition-all"
                                    >
                                        <PhoneOff size={24} />
                                    </button>
                                    <button
                                        onClick={onAccept}
                                        className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-500/20 transition-all animate-bounce"
                                    >
                                        <Phone size={24} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={onToggleMute}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                                    >
                                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                                    </button>

                                    <button
                                        onClick={onEnd}
                                        className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20 transition-all"
                                    >
                                        <PhoneOff size={24} />
                                    </button>

                                    <button
                                        className="w-12 h-12 rounded-full bg-white/5 text-gray-300 hover:bg-white/10 flex items-center justify-center transition-all"
                                    >
                                        <Volume2 size={20} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default VoiceCallDialog;
