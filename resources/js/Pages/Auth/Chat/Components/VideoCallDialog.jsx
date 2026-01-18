import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Camera, CameraOff, User, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VideoCallDialog = ({
    isOpen,
    onClose,
    partner,
    callStatus, // 'calling', 'incoming', 'connected', 'ended'
    onAccept,
    onReject,
    onEnd,
    isMuted,
    onToggleMute,
    isCameraOff,
    onToggleCamera,
    localVideoRef,
    remoteVideoRef
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            >
                <div className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                    {/* Remote Video (Main) */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        {callStatus === 'connected' ? (
                            <>
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                {/* Overlay if partner's camera is off (WIP: needs signaling) */}
                            </>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-indigo-500/20 p-1 mb-4">
                                    <div className="w-full h-full rounded-full bg-gray-800 overflow-hidden border-2 border-indigo-500/30 flex items-center justify-center">
                                        {partner?.profile_image ? (
                                            <img src={partner.profile_image} className="w-full h-full object-cover" alt={partner.name} />
                                        ) : (
                                            <User size={40} className="text-gray-500" />
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-white">{partner?.name || 'Stranger'}</h3>
                                <p className="text-sm text-gray-400 mt-2">
                                    {callStatus === 'calling' && 'Calling...'}
                                    {callStatus === 'incoming' && 'Incoming video call...'}
                                    {callStatus === 'ended' && 'Call ended'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Local Video (Picture-in-Picture) */}
                    {callStatus === 'connected' && (
                        <div className="absolute top-6 right-6 w-32 md:w-48 aspect-video bg-gray-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl z-10">
                            {isCameraOff ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                    <CameraOff size={24} className="text-gray-500" />
                                </div>
                            ) : (
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover mirror"
                                />
                            )}
                        </div>
                    )}

                    {/* Controls Overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="flex items-center justify-center gap-4 md:gap-6">
                            {callStatus === 'incoming' ? (
                                <>
                                    <button
                                        onClick={onReject}
                                        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20 transition-all"
                                    >
                                        <PhoneOff size={28} />
                                    </button>
                                    <button
                                        onClick={onAccept}
                                        className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-500/20 transition-all animate-bounce"
                                    >
                                        <Phone size={28} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={onToggleMute}
                                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md'}`}
                                    >
                                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                                    </button>

                                    <button
                                        onClick={onToggleCamera}
                                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isCameraOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md'}`}
                                    >
                                        {isCameraOff ? <CameraOff size={24} /> : <Camera size={24} />}
                                    </button>

                                    <button
                                        onClick={onEnd}
                                        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20 transition-all"
                                    >
                                        <PhoneOff size={28} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <style>{`
                    .mirror {
                        transform: scaleX(-1);
                    }
                `}</style>
            </motion.div>
        </AnimatePresence>
    );
};

export default VideoCallDialog;
