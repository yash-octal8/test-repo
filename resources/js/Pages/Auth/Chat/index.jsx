import React, { useState, useRef, useEffect } from 'react';
import {
    SkipForward,
    Send,
    Image as ImageIcon,
    Smile,
    Gift,
    Mic,
    Camera,
    Crown,
    Users,
    User,
    AlertCircle,
    Shield,
    Clock,
    X,
    Zap,
    MessageCircle,
    VolumeX,
    Volume2,
    Phone,
    Video,
    Lock,
    Puzzle,
    Sparkles,
    UserPlus,
    Bell,
    History,
    MoreVertical,
    HeartCrack,
    FlagTriangleRight,
    Search,
    UserCheck,
    UserX,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Sparkle,
    Music,
    Palette,
    Globe,
    Heart,
    ThumbsUp,
    File as FileIcon,
    Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useParams, useNavigate, useOutletContext } from 'react-router-dom';
import listenApi from '../../../Utils/Api';
import { setPendingRequests, setFollowers, updatePreferences } from '../../../Store/ChatSlice';
import Button from '../../../Components/ui/Button';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import { initEcho } from '../../../bootstrap';
import UserProfileModal from '../../../Components/UserProfileModal';
import Male from '../../../Components/Icon/Male';
import Female from '../../../Components/Icon/Female';
import VideoChatDialog from '../Components/VideoChatDialog';
import ManageInterestDialog from '../Components/ManageInterestDialog';
import VoiceCallDialog from './Components/VoiceCallDialog';
import VideoCallDialog from './Components/VideoCallDialog';
import { __listenUpdateUser } from '../../../Store/AuthSlice';
import DialogBox from '../../../Components/DialogBox';
import RadioButtonGroup from '../../../Components/RadioButtonGroup';
import EmojiPicker from 'emoji-picker-react';

const Index = () => {
    console.log("Chat Index Rendering");
    const { user } = useSelector((state) => state.auth);
    const chatState = useSelector((state) => state.chat);
    const preferences = chatState?.preferences || {
        interestsEnabled: true,
        interests: [],
        interestInput: '',
        maxDuration: '∞',
        genderFilter: 'both',
    };
    const dispatch = useDispatch();
    const pendingRequests = Array.isArray(chatState?.pendingRequests) ? chatState.pendingRequests : [];
    const followers = Array.isArray(chatState?.followers) ? chatState.followers : [];
    const params = useParams();
    const navigate = useNavigate();
    const { setIsSidebarOpen } = useOutletContext() || {};
    const [status, setStatus] = useState('idle');
    const [isOpenVideoChatDialog, setIsOpenVideoChatDialog] = useState(!!user?.videoChatDialog);
    const [openManageModel, setOpenManageModel] = useState(false);
    const [showGenderModal, setShowGenderModal] = useState(!user?.extra_info?.gender);
    const [theme, setTheme] = useState('dark');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGiftMenu, setShowGiftMenu] = useState(false);
    const [showMediaMenu, setShowMediaMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSkipConfirm, setShowSkipConfirm] = useState(false);
    const [isPartnerTyping, setIsPartnerTyping] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [hasPartnerSkipped, setHasPartnerSkipped] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [historyList, setHistoryList] = useState([]);

    const genderOptions = [
        { name: 'Male', value: 'male', icon: <Male /> },
        { name: 'Female', value: 'female', icon: <Female /> },
    ];
    const [selectedGender, setSelectedGender] = useState(genderOptions[0]);
    const [setupStep, setSetupStep] = useState(1);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (user && !user.extra_info?.gender) {
            setShowGenderModal(true);
        }
    }, [user]);

    const handleGenderSubmit = () => {
        setSetupStep(2);
    }

    const handleCompleteSetup = () => {
        listenApi.post('update-profile', { gender: selectedGender.value }).then(res => {
            if (res?.data?.data?.user) {
                dispatch(__listenUpdateUser(res?.data?.data?.user))
            }
            setShowGenderModal(false);
        });
    }

    const [strangerInfo, setStrangerInfo] = useState(null);
    const [sessionId, setSessionId] = useState(params.sessionId || null);
    const [sessionType, setSessionType] = useState('random');
    const [messageInput, setMessageInput] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [attachmentPreview, setAttachmentPreview] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [gifs, setGifs] = useState([]);
    const [gifSearch, setGifSearch] = useState('');

    // Voice Call State
    const [callStatus, setCallStatus] = useState(null); // 'calling', 'incoming', 'connected', 'ended'
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [callType, setCallType] = useState('voice'); // 'voice', 'video'
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingIntervalRef = useRef(null);
    const [messages, setMessages] = useState([]);

    const subscribedSessionRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const lastTypingSentRef = useRef(0);
    const cameraInputRef = useRef(null);
    const location = useLocation();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);


    // Gifts data
    const gifts = [
        { id: 1, name: 'Rose', emoji: '🌹', price: 10, color: 'text-red-400' },
        { id: 2, name: 'Coffee', emoji: '☕', price: 5, color: 'text-amber-400' },
        { id: 3, name: 'Heart', emoji: '💖', price: 20, color: 'text-pink-400' },
        { id: 4, name: 'Star', emoji: '⭐', price: 15, color: 'text-yellow-400' },
        { id: 5, name: 'Crown', emoji: '👑', price: 50, color: 'text-purple-400' },
        { id: 6, name: 'Fire', emoji: '🔥', price: 25, color: 'text-orange-400' },
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async (sid) => {
        try {
            const response = await listenApi.get(`chat/messages/${sid}`);
            if (response.data.success) {
                const formattedMessages = response.data.messages.map(m => ({
                    id: m.id,
                    text: m.message,
                    sender: m.sender_id === user.id ? 'me' : 'stranger',
                    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    attachment: m.attachment_url,
                    attachmentType: m.attachment_type
                }));
                setMessages(formattedMessages);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    useEffect(() => {
        if (location.state?.directSession) {
            console.log(location.state);
            const { session, partner } = location.state.directSession;
            console.log("Loading direct session:", session.session_id);
            setSessionId(session.session_id);
            setSessionType('direct');
            setStrangerInfo(partner);
            setStatus('connected');
            fetchMessages(session.session_id);
            subscribeToChatRoom(session.session_id);
            fetchFollowers();
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (status === 'idle') {
            setMessages([]);
        }
    }, [status]);

    // 1. Check Status on Mount & Listen for User Events
    useEffect(() => {
        if (!user) return;

        initEcho();
        fetchPendingRequests();

        const userChannel = window.Echo.private(`user.${user.id}`);

        userChannel.listen('.chat.started', (e) => {
            console.log('Chat started event →', e);
            setSessionId(e.session_id);
            setSessionType(e.type || 'random');
            setStrangerInfo(e.partner);
            setStatus('connected');
            setMessages(prev => {
                const filtered = prev.filter(m => m.type !== 'alert' || m.text !== 'Looking for new match...');
                return [...filtered, {
                    id: Date.now(),
                    type: 'system',
                    text: '🎉 Connected with ',
                    highlight: e.partner.name,
                    suffix: '! Say hi! 👋'
                }];
            });
            subscribeToChatRoom(e.session_id);
        });

        userChannel.listen('.chat.ended', (e) => {
            console.log('Chat ended event on user channel →', e);
            handleChatEnded(e.session_id, e.ended_by);
        });

        userChannel.listen('.follow.request.sent', (e) => {
            console.log('Follow Request Received in Chat Page', e);
            fetchPendingRequests();
            iziToast.info({
                title: 'New Connection Request',
                message: `${e.sender?.name || 'Someone'} wants to connect with you! 💌`,
                position: 'topRight'
            });
        });

        userChannel.listen('.follow.request.updated', (e) => {
            console.log('Follow Request Updated in Chat Page', e);
            fetchPendingRequests();
            if (e.status === 'accepted') {
                const isMeReceiver = e.receiver?.id === user.id;
                if (!isMeReceiver) {
                    iziToast.success({
                        title: 'Connection Accepted! ✨',
                        message: `${e.receiver?.name} accepted your request!`,
                        position: 'topRight'
                    });
                }
            }
        });

        const checkInitialStatus = async () => {
            if (params.sessionId && !sessionId) {
                // Logic to join/restore specific session would go here
            }

            try {
                const response = await listenApi.get('chat/status');
                if (response.data.success) {
                    if (response.data.in_chat) {
                        const activeSessionId = response.data.session_id;
                        setSessionId(activeSessionId);
                        setSessionType(response.data.type || 'random');
                        setStrangerInfo(response.data.partner);
                        setStatus('connected');
                        subscribeToChatRoom(activeSessionId);
                        fetchFollowers();

                        if (params.sessionId !== activeSessionId) {
                            navigate(`/chat/new/${activeSessionId}`, { replace: true });
                        }
                    } else if (response.data.is_searching) {
                        setStatus('looking');
                        setMessages([{
                            id: Date.now(),
                            type: 'alert',
                            text: '🔍 Searching for your next chat partner...',
                            action: 'Cancel'
                        }]);
                    } else {
                        if (params.sessionId) {
                            navigate('/chat/new', { replace: true });
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to check chat status", error);
            }
        };

        checkInitialStatus();

        return () => {
            userChannel.stopListening('.chat.started');
            userChannel.stopListening('.chat.ended');
            userChannel.stopListening('.follow.request.sent');
            userChannel.stopListening('.follow.request.updated');

            stopLooking();

            if (subscribedSessionRef.current) {
                window.Echo.leave(`chat.${subscribedSessionRef.current}`);
            }
        };
    }, [user]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                if (e.key === 'Escape') {
                    e.target.blur();
                }
                return;
            }

            if (e.key === 'Escape') {
                if (status === 'connected') {
                    handleSkip(false);
                } else if (status === 'looking') {
                    stopLooking();
                }
            } else if (e.key === 'Enter') {
                if (status === 'idle') {
                    startLooking();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status, sessionId, showSkipConfirm]);

    const fetchPendingRequests = async () => {
        try {
            const response = await listenApi.get('follow/requests');
            dispatch(setPendingRequests(Array.isArray(response.data) ? response.data : []));
        } catch (error) {
            console.error("Failed to fetch pending requests", error);
        }
    };

    const fetchFollowers = async () => {
        try {
            const response = await listenApi.get('follow/friends');
            dispatch(setFollowers(Array.isArray(response.data) ? response.data : []));
        } catch (error) {
            console.error("Failed to fetch friends", error);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            await listenApi.post('follow/respond', {
                follow_id: requestId,
                status: 'accepted'
            });
            fetchPendingRequests();
            fetchFollowers();
            iziToast.success({
                title: 'Connected! 🤝',
                message: 'You are now connected!'
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            await listenApi.post('follow/respond', {
                follow_id: requestId,
                status: 'rejected'
            });
            fetchPendingRequests();
            iziToast.info({
                title: 'Request Declined',
                message: 'Connection request declined.'
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleBlockRequest = async (requestId) => {
        try {
            await listenApi.post('follow/respond', {
                follow_id: requestId,
                status: 'blocked'
            });
            fetchPendingRequests();
            iziToast.error({
                title: 'User Blocked',
                message: 'User has been blocked.'
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendFollowRequest = async () => {
        if (!strangerInfo) return;
        try {
            const res = await listenApi.post('follow/request', {
                receiver_id: strangerInfo.id
            });
            iziToast.success({
                title: 'Request Sent! 💫',
                message: 'Connection request sent!'
            });
        } catch (err) {
            console.error(err);
            iziToast.error({
                title: 'Error',
                message: err.response?.data?.message || 'Failed to send request'
            });
        }
    };

    const handleRemoveFriend = async (friendId) => {
        if (!confirm('Are you sure you want to remove this connection?')) return;
        try {
            const response = await listenApi.post('follow/remove', { friend_id: friendId });
            if (response.data.success) {
                iziToast.success({
                    title: 'Removed',
                    message: 'Connection removed.'
                });
                fetchFollowers();
                if (strangerInfo?.id === friendId) setIsProfileModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to remove friend", error);
            iziToast.error({
                title: 'Error',
                message: 'Failed to remove connection'
            });
        }
    };

    const handleBlockUser = async (userId) => {
        if (!confirm('Are you sure you want to block this user?')) return;
        try {
            const response = await listenApi.post('follow/block', { user_id: userId });
            if (response.data.success) {
                iziToast.success({
                    title: 'Blocked',
                    message: 'User blocked successfully.'
                });
                fetchFollowers();
                if (strangerInfo?.id === userId) {
                    setIsProfileModalOpen(false);
                    if (status === 'connected') handleSkip();
                }
            }
        } catch (error) {
            console.error("Failed to block user", error);
            iziToast.error({
                title: 'Error',
                message: 'Failed to block user'
            });
        }
    };

    const handleDeleteChatByFriendId = async (friendId) => {
        if (!confirm('Are you sure you want to delete chat history?')) return;
        try {
            const response = await listenApi.delete(`chat/delete-by-friend/${friendId}`);
            if (response.data.success) {
                iziToast.success({
                    title: 'Deleted',
                    message: 'Chat history cleared.'
                });
                if (strangerInfo?.id === friendId) {
                    setMessages([]);
                    setIsProfileModalOpen(false);
                }
            }
        } catch (error) {
            console.error("Failed to delete chat", error);
            iziToast.error({
                title: 'Error',
                message: 'Failed to delete chat'
            });
        }
    };

    const handleChatEnded = (chatSessionId, endedBy) => {
        console.log(`Handling chat ended for session ${chatSessionId}, ended by ${endedBy}`);
        const wasStranger = endedBy !== user.id;

        if (subscribedSessionRef.current === chatSessionId || sessionId === chatSessionId) {
            setHasPartnerSkipped(true);
            setMessages(prev => [...prev, {
                id: Date.now(),
                type: 'system',
                text: wasStranger ? '💔 Your chat partner has ended the conversation.' : 'You have ended the chat.'
            }]);

            subscribedSessionRef.current = null;
            setShowSkipConfirm(false);
            stopLooking();

            iziToast.info({
                title: 'Chat Ended',
                message: wasStranger ? 'Your match partner disconnected.' : 'You disconnected from chat.',
                position: 'topRight'
            });
        }

        window.Echo.leave(`chat.${chatSessionId}`);
    };

    const subscribeToChatRoom = (chatSessionId) => {
        if (!chatSessionId) return;

        console.log(`Subscribing to chat room: ${chatSessionId}`);

        if (subscribedSessionRef.current && subscribedSessionRef.current !== chatSessionId) {
            console.log(`Leaving previous session: ${subscribedSessionRef.current}`);
            window.Echo.leave(`chat.${subscribedSessionRef.current}`);
        }

        subscribedSessionRef.current = chatSessionId;
        const chatChannel = window.Echo.join(`chat.${chatSessionId}`);

        chatChannel
            .listen('.message.sent', (e) => {
                console.log('Message received →', e);
                const newMessage = {
                    id: e.message.id,
                    text: e.message.message,
                    sender: e.message.sender_id === user.id ? 'me' : 'stranger',
                    time: new Date(e.message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    attachment: e.message.attachment_url,
                    attachmentType: e.message.attachment_type
                };
                setMessages(prev => {
                    if (prev.some(m => m.id === newMessage.id)) return prev;
                    return [...prev, newMessage];
                });

                if (e.message.sender_id !== user.id) {
                    listenApi.post(`chat/read/${chatSessionId}`).catch(err => console.error("Failed to mark as read", err));
                }
            })
            .listen('.chat.ended', (e) => {
                console.log('Chat ended event on chat channel →', e);
                handleChatEnded(chatSessionId, e.ended_by);
            })
            .listenForWhisper('typing', (e) => {
                console.log('Partner is typing...', e);
                setIsPartnerTyping(true);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => {
                    setIsPartnerTyping(false);
                }, 3000);
            })
            .listen('.call.initiated', (e) => {
                const isIncoming = e.caller_id !== user.id;
                if (isIncoming) {
                    setCallStatus('incoming');
                    setCallType(e.type || 'voice');
                    setIsCallModalOpen(true);
                }
            })
            .listen('.call.responded', (e) => {
                console.log('Call response...', e);
                if (e.action === 'accept') {
                    setCallStatus('connected');
                    // Only the caller initiates the WebRTC offer to avoid race conditions
                    if (callStatus === 'calling') {
                        startWebRTC(true);
                    } else {
                        startWebRTC(false);
                    }
                } else if (e.action === 'reject') {
                    iziToast.info({ title: 'Call Rejected', message: 'Partner rejected the call' });
                    cleanupCall();
                } else if (e.action === 'end') {
                    iziToast.info({ title: 'Call Ended', message: 'Partner ended the call' });
                    cleanupCall();
                }
            })
            .listen('.call.signaled', (e) => {
                console.log('WebRTC signal...', e);
                handleWebRTCSignal(e.signal);
            });
    };

    const handleWebRTCSignal = async (signal) => {
        if (!peerConnectionRef.current) return;

        try {
            if (signal.type === 'offer') {
                await peerConnectionRef.current.setRemoteDescription(new window.RTCSessionDescription(signal.offer));
                const answer = await peerConnectionRef.current.createAnswer();
                await peerConnectionRef.current.setLocalDescription(answer);
                sendWebRTCSignal({ type: 'answer', answer });
            } else if (signal.type === 'answer') {
                await peerConnectionRef.current.setRemoteDescription(new window.RTCSessionDescription(signal.answer));
            } else if (signal.type === 'candidate') {
                await peerConnectionRef.current.addIceCandidate(new window.RTCIceCandidate(signal.candidate));
            }
        } catch (error) {
            console.error("Error handling WebRTC signal:", error);
        }
    };

    const handleTyping = () => {
        if (!sessionId || status !== 'connected') return;

        const now = Date.now();
        if (now - lastTypingSentRef.current < 2000) return;

        lastTypingSentRef.current = now;
        window.Echo.join(`chat.${sessionId}`)
            .whisper('typing', {
                user_id: user.id
            });
    };

    const startLooking = async () => {
        try {
            console.log("Starting chat search...");
            setStatus('looking');
            setShowSkipConfirm(false);
            setMessages([{
                id: Date.now(),
                type: 'alert',
                text: '🔍 Searching for interesting people...',
                action: 'Cancel'
            }]);
            setStrangerInfo(null);
            setSessionId(null);

            const response = await listenApi.post('chat/start');
            console.log("Start chat response:", response.data);

            if (response.data.success) {
                if (response.data.session) {
                    setSessionId(response.data.session.session_id);
                    setSessionType('random');
                    setStrangerInfo(response.data.partner);
                    setStatus('connected');
                    setMessages(prev => {
                        const filtered = prev.filter(m => m.type !== 'alert' || m.text !== '🔍 Searching for interesting people...');
                        return [...filtered, {
                            id: Date.now(),
                            type: 'system',
                            text: '🎉 Connected with ',
                            highlight: response.data.partner.name,
                            suffix: '! Start chatting! 💬'
                        }];
                    });

                    navigate(`/chat/new/${response.data.session.session_id}`, { replace: true });
                    subscribeToChatRoom(response.data.session.session_id);
                } else if (response.data.status === 'waiting') {
                    console.log('Waiting for partner...');
                }
            } else {
                console.error("Failed to start chat:", response.data.message);
                setStatus('idle');
                iziToast.error({
                    title: 'Error',
                    message: response.data.message || 'Failed to start chat'
                });
            }
        } catch (error) {
            console.error("Error starting chat:", error);
            setStatus('idle');
            iziToast.error({
                title: 'Error',
                message: 'Something went wrong. Please try again.'
            });
        }
    };

    const stopLooking = async () => {
        try {
            setStatus('idle');
            await listenApi.post('chat/stop');
        } catch (error) {
            console.error("Error stopping chat:", error);
        }
    };

    const initiateCall = async (type = 'voice') => {
        const isConnected = status === 'connected' || status === 'direct';
        if (!sessionId || !isConnected) return;

        setCallStatus('calling');
        setCallType(type);
        setIsCallModalOpen(true);

        try {
            await listenApi.post('chat/call/initiate', { session_id: sessionId, type });
        } catch (error) {
            console.error("Failed to initiate call", error);
            setCallStatus(null);
            setIsCallModalOpen(false);
            iziToast.error({ title: 'Error', message: 'Failed to initiate call' });
        }
    };

    const acceptCall = async () => {
        try {
            await listenApi.post('chat/call/respond', { session_id: sessionId, action: 'accept' });
            setCallStatus('connected');
            startWebRTC(false); // Recipient doesn't initiate offer
        } catch (error) {
            console.error("Failed to accept call", error);
        }
    };

    const rejectCall = async () => {
        try {
            await listenApi.post('chat/call/respond', { session_id: sessionId, action: 'reject' });
            setCallStatus(null);
            setIsCallModalOpen(false);
        } catch (error) {
            console.error("Failed to reject call", error);
        }
    };

    const endCall = async () => {
        try {
            await listenApi.post('chat/call/respond', { session_id: sessionId, action: 'end' });
            cleanupCall();
        } catch (error) {
            console.error("Failed to end call", error);
            cleanupCall();
        }
    };

    const cleanupCall = () => {
        setCallStatus(null);
        setIsCallModalOpen(false);
        setCallType('voice');
        setIsMuted(false);
        setIsCameraOff(false);
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
    };

    const startWebRTC = async (isCaller = false) => {
        try {
            const constraints = {
                audio: true,
                video: callType === 'video'
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            localStreamRef.current = stream;

            // Attach local stream to video ref if video call
            if (callType === 'video' && localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            peerConnectionRef.current = new window.RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            stream.getTracks().forEach(track => {
                peerConnectionRef.current.addTrack(track, stream);
            });

            peerConnectionRef.current.onicecandidate = (event) => {
                if (event.candidate) {
                    sendWebRTCSignal({ type: 'candidate', candidate: event.candidate });
                }
            };

            peerConnectionRef.current.ontrack = (event) => {
                remoteStreamRef.current = event.streams[0];
                if (callType === 'video') {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStreamRef.current;
                    }
                } else {
                    const audio = new Audio();
                    audio.srcObject = remoteStreamRef.current;
                    audio.play();
                }
            };

            if (isCaller) {
                const offer = await peerConnectionRef.current.createOffer();
                await peerConnectionRef.current.setLocalDescription(offer);
                sendWebRTCSignal({ type: 'offer', offer });
            }
        } catch (error) {
            console.error("WebRTC Error:", error);
            let errorMessage = 'WebRTC failed';
            if (error.name === 'NotAllowedError') {
                errorMessage = `Permission denied. Please enable ${callType === 'video' ? 'microphone and camera' : 'microphone'} access.`;
            } else if (error.name === 'NotFoundError') {
                errorMessage = `No ${callType === 'video' ? 'camera/microphone' : 'microphone'} found.`;
            }
            iziToast.error({ title: 'Error', message: errorMessage });
            cleanupCall();
        }
    };

    const sendWebRTCSignal = async (data) => {
        try {
            await listenApi.post('chat/call/signal', { session_id: sessionId, signal: data });
        } catch (error) {
            console.error("Failed to send WebRTC signal", error);
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleInputChange = (e) => {
        setMessageInput(e.target.value);
        handleTyping();
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const audioFile = new File([audioBlob], `voice_message_${Date.now()}.wav`, { type: 'audio/wav' });
                setAttachment(audioFile);
                setAttachmentPreview('audio');

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingDuration(0);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error("Error starting recording:", error);
            let errorMessage = 'Could not access microphone';
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage = 'Microphone access was denied. Please enable it in your browser settings and ensure you have a microphone connected.';
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                errorMessage = 'No microphone found on your device. Please connect a microphone and try again.';
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                errorMessage = 'Microphone is already in use by another application.';
            }
            iziToast.error({ title: 'Microphone Error', message: errorMessage, position: 'topRight' });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(recordingIntervalRef.current);
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toString().padStart(2, '0');
        return mins + ':' + secs;
    };


    const handleRemoveAttachment = () => {
        setAttachment(null);
        setAttachmentPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSendMessage = async (gifUrl = null) => {
        const isConnected = status === 'connected' || status === 'direct';
        if (!gifUrl && (!messageInput.trim() && !attachment) || !sessionId || !isConnected) return;

        const text = gifUrl ? '' : messageInput;
        const currentAttachment = gifUrl ? null : attachment;

        if (!gifUrl) {
            setMessageInput('');
            setAttachment(null);
            setAttachmentPreview(null);
        }

        // Refocus input after sending
        inputRef.current?.focus();

        try {
            const formData = new FormData();
            formData.append('session_id', sessionId);

            if (gifUrl) {
                formData.append('message', gifUrl);
            } else {
                if (text.trim()) formData.append('message', text);
                if (currentAttachment) formData.append('attachment', currentAttachment);
            }

            await listenApi.post('chat/send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch (error) {
            console.error("Failed to send message", error);
            setMessageInput(text);
            // Restore message input on failure
            if (!gifUrl) {
                setMessageInput(text);
                setAttachment(currentAttachment);
            }
            iziToast.error({ title: 'Error', message: 'Failed to send message' });
        }
    };

    const fetchGifs = async (query = '') => {
        try {
            const apiKey = 'dc6zaTOxFJmzC'; // Public beta key
            const endpoint = query
                ? 'https://api.giphy.com/v1/gifs/search?api_key=' + apiKey + '&q=' + encodeURIComponent(query) + '&limit=20'
                : 'https://api.giphy.com/v1/gifs/trending?api_key=' + apiKey + '&limit=20';

            const response = await fetch(endpoint);
            const data = await response.json();
            setGifs(data.data || []);
        } catch (error) {
            console.error("Failed to fetch GIFs", error);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await listenApi.get('chat/history');
            if (response.data.success) {
                setHistoryList(response.data.history);
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    useEffect(() => {
        if (showHistory) {
            fetchHistory();
        }
    }, [showHistory]);

    useEffect(() => {
        if (showGifPicker || showMediaMenu) {
            fetchGifs(gifSearch);
        }
    }, [showGifPicker, showMediaMenu, gifSearch]);

    const handlePreferenceChange = async (key, value) => {
        dispatch(updatePreferences({ [key]: value }));

        try {
            await listenApi.post('save-preferences', {
                interests: preferences.interests,
                match_with_interests: key === 'interestsEnabled' ? value : preferences.interestsEnabled,
                prefer_gender: key === 'genderFilter' ? value : preferences.genderFilter,
            });
        } catch (error) {
            console.error("Failed to save preferences", error);
        }
    };

    const handleSkip = async (autoStart = false) => {
        if (!sessionId) {
            if (autoStart) startLooking();
            return;
        }

        try {
            const response = await listenApi.post('chat/skip');

            if (response.data.success) {
                console.log("Skip successful, waiting for ChatEnded event...");

                if (autoStart) {
                    setTimeout(() => {
                        setHasPartnerSkipped(false);
                        startLooking();
                    }, 500);
                }
            }
        } catch (error) {
            console.error("Error skipping:", error);
            setStatus('idle');
            setSessionId(null);
            setStrangerInfo(null);
            setHasPartnerSkipped(false);
            setShowSkipConfirm(false);
            setMessages([]);

            if (subscribedSessionRef.current) {
                window.Echo.leave(`chat.${subscribedSessionRef.current}`);
                subscribedSessionRef.current = null;
            }

            if (autoStart) startLooking();
        }
    };

    // Handle emoji selection
    const handleEmojiClick = (emojiData) => {
        setMessageInput(prev => prev + emojiData.emoji);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    // Handle GIF selection
    const handleGifSelect = async (gif) => {
        const isConnected = status === 'connected' || status === 'direct';
        if (!sessionId || !isConnected) return;

        try {
            await listenApi.post('chat/send', {
                session_id: sessionId,
                message: `[GIF]`,
                attachment_url: gif.images.fixed_height.url,
                attachment_type: 'gif'
            });
            setShowMediaMenu(false);
            // iziToast.success({
            //     title: 'GIF Sent!',
            //     message: 'GIF has been sent successfully!',
            //     position: 'topRight'
            // });
        } catch (error) {
            console.error("Failed to send GIF", error);
            iziToast.error({
                title: 'Error',
                message: 'Failed to send GIF'
            });
        }
    };

    // Handle gift sending
    const handleSendGift = async (gift) => {
        const isConnected = status === 'connected' || status === 'direct';
        if (!sessionId || !isConnected) return;

        try {
            await listenApi.post('chat/send', {
                session_id: sessionId,
                message: `Sent ${gift.emoji} ${gift.name} as a gift!`,
                is_gift: true,
                gift_id: gift.id
            });
            setShowGiftMenu(false);
            // iziToast.success({
            //     title: 'Gift Sent! 🎁',
            //     message: `You sent ${gift.emoji} ${gift.name} to ${strangerInfo?.name}`,
            //     position: 'topRight'
            // });
        } catch (error) {
            console.error("Failed to send gift", error);
            iziToast.error({
                title: 'Error',
                message: 'Failed to send gift'
            });
        }
    };

    // Handle media upload
    const handleMediaUpload = async (file, type) => {
        const isConnected = status === 'connected' || status === 'direct';
        if (!sessionId || !isConnected) return;

        const formData = new FormData();
        formData.append('session_id', sessionId);
        formData.append('attachment', file);
        formData.append('attachment_type', type);

        try {
            const response = await listenApi.post('chat/send-media', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // if (response.data.success) {
            //     setShowMediaMenu(false);
            //     iziToast.success({
            //         title: 'Media Sent!',
            //         message: 'Your media has been sent successfully!',
            //         position: 'topRight'
            //     });
            // }
        } catch (error) {
            console.error("Failed to send media", error);
            iziToast.error({
                title: 'Error',
                message: 'Failed to send media file'
            });
        }
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            let type = 'image';
            if (file.type.startsWith('video/')) type = 'video';
            else if (file.type.startsWith('audio/')) type = 'audio';
            handleMediaUpload(file, type);
        }
    };

    // Handle camera capture
    const handleCameraCapture = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleMediaUpload(file, 'image');
        }
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showEmojiPicker && !e.target.closest('.emoji-picker-container')) {
                setShowEmojiPicker(false);
            }
            if (showGiftMenu && !e.target.closest('.gift-menu-container')) {
                setShowGiftMenu(false);
            }
            if (showMediaMenu && !e.target.closest('.media-menu-container')) {
                setShowMediaMenu(false);
            }
            if (showNotifications && !e.target.closest('.notifications-container')) {
                setShowNotifications(false);
            }
            if (showHistory && !e.target.closest('.history-container')) {
                setShowHistory(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showEmojiPicker, showGiftMenu, showMediaMenu, showNotifications]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isPartnerTyping]);

    return (
        <div className={`min-h-screen text-gray-100 font-sans flex flex-col w-full overflow-hidden relative`}>
            {/* Header */}
            <header className={`h-16 flex items-center justify-between px-4 md:px-6 ${theme === 'dark' ? 'bg-black/30 backdrop-blur-xl border-b border-white/10' : 'bg-white/80 backdrop-blur-xl border-b border-gray-200'} z-50 relative`}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen && setIsSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-full hover:bg-white/10 text-white transition-colors -ml-2"
                    >
                        <Menu size={24} />
                    </button>
                    <div className={`w-10 h-10 rounded-full ${theme === 'dark' ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'} flex items-center justify-center shadow-lg shrink-0`}>
                        <MessageCircle size={22} className="text-white" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="font-bold text-lg text-white truncate">Partner Chat</h1>
                        <p className="text-xs text-gray-300 truncate">
                            {status === 'idle' ? 'Ready to connect' :
                                status === 'looking' ? 'Finding someone...' :
                                    `Chatting with ${strangerInfo?.name || 'Partner'}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className={`hidden md:block p-2 rounded-full ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        <Palette size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-800'} />
                    </button>

                    <div className="relative notifications-container">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`p-2 rounded-full ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} relative`}
                        >
                            <Bell size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-800'} />
                            {pendingRequests.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {pendingRequests.length}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className={`absolute right-0 top-full mt-2 w-80 ${theme === 'dark' ? 'bg-gray-900/95 backdrop-blur-xl' : 'bg-white/95 backdrop-blur-xl'} rounded-xl shadow-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} overflow-hidden z-50`}
                                >
                                    <div className="p-4 border-b border-white/10">
                                        <h3 className="font-bold text-white">Notifications</h3>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {pendingRequests.length === 0 ? (
                                            <div className="p-6 text-center">
                                                <Bell size={32} className="text-gray-400 mx-auto mb-3" />
                                                <p className="text-gray-400">No new notifications</p>
                                            </div>
                                        ) : (
                                            pendingRequests.map(req => (
                                                <div key={req.id} className="p-4 border-b border-white/5 hover:bg-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                                            {req.sender?.name?.[0]}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-white">{req.sender?.name}</p>
                                                            <p className="text-sm text-gray-400">Wants to connect</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleAcceptRequest(req.id)}
                                                                className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded-lg text-sm"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectRequest(req.id)}
                                                                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                                                            >
                                                                Ignore
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={() => setIsProfileModalOpen(true)}
                        disabled={!strangerInfo}
                        className={`p-2 rounded-full ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} disabled:opacity-50`}
                    >
                        <User size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-800'} />
                    </button>

                    <button
                        className="text-gray-400 hover:text-gray-200 transition"
                        onClick={() => initiateCall('voice')}
                        disabled={status !== 'connected' && status !== 'direct'}
                    >
                        <Phone size={20} className={(status !== 'connected' && status !== 'direct') ? 'opacity-50' : ''} />
                    </button>

                    <button
                        className="text-gray-400 hover:text-gray-200 transition"
                        onClick={() => initiateCall('video')}
                        disabled={status !== 'connected' && status !== 'direct'}
                    >
                        <Video size={20} className={(status !== 'connected' && status !== 'direct') ? 'opacity-50' : ''} />
                    </button>

                    <div className="relative history-container hidden md:block">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className={`p-2 rounded-full ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                        >
                            <History size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-800'} />
                        </button>

                        <AnimatePresence>
                            {showHistory && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className={`absolute right-0 top-full mt-2 w-80 ${theme === 'dark' ? 'bg-gray-900/95 backdrop-blur-xl' : 'bg-white/95 backdrop-blur-xl'} rounded-xl shadow-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} overflow-hidden z-50`}
                                >
                                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                        <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>History</h3>
                                        <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                        {historyList.length === 0 ? (
                                            <div className="p-6 text-center">
                                                <History size={32} className="text-gray-400 mx-auto mb-3" />
                                                <p className="text-gray-400">No chat history</p>
                                            </div>
                                        ) : (
                                            historyList.map((session, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`p-4 border-b ${theme === 'dark' ? 'border-white/5 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'} cursor-pointer transition-colors`}
                                                    onClick={() => {
                                                        setStrangerInfo(session.partner);
                                                        setIsProfileModalOpen(true);
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg">
                                                            {session.partner.name?.[0]}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                                                {session.partner.name}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                                <Clock size={12} />
                                                                <span>{session.ended_at ? new Date(session.ended_at).toLocaleDateString() : 'Active'}</span>
                                                                {session.partner.gender && (
                                                                    <span className="capitalize">• {session.partner.gender}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Anonymous Banner */}
                {user?.anonymous && (
                    <div className="bg-gradient-to-r from-amber-600 to-orange-600 py-2 px-4 text-center text-white text-sm">
                        <span>🎭 Using anonymous account - </span>
                        <button className="underline font-medium">Claim your account</button>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {/* Idle State */}
                    {status === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="flex-1 flex flex-col items-center justify-center p-6 relative z-10"
                        >
                            <div className="w-full max-w-lg">
                                {/* Welcome Card */}
                                <div className={`rounded-2xl p-6 md:p-8 ${theme === 'dark' ? 'bg-black/30 backdrop-blur-xl border border-white/10' : 'bg-white/80 backdrop-blur-xl border border-gray-200'} shadow-2xl mb-8`}>
                                    <div className="text-center mb-8">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                                            <MessageCircle size={32} className="text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-3">Chat with Partners 🌍</h2>
                                        <p className="text-gray-300">Connect with random people from around the world!</p>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                        <div className={`text-center p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
                                            <div className="text-xl font-bold text-purple-400">1M+</div>
                                            <div className="text-sm text-gray-400">Active Users</div>
                                        </div>
                                        <div className={`text-center p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
                                            <div className="text-xl font-bold text-blue-400">85%</div>
                                            <div className="text-sm text-gray-400">Match Rate</div>
                                        </div>
                                        <div className={`text-center p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
                                            <div className="text-xl font-bold text-green-400">24/7</div>
                                            <div className="text-sm text-gray-400">Active</div>
                                        </div>
                                    </div>

                                    {/* Interests */}
                                    <div className="mb-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-semibold text-white">Your Interests</h3>
                                            <button
                                                onClick={() => setOpenManageModel(true)}
                                                className="text-sm text-purple-400 hover:text-purple-300"
                                            >
                                                Manage
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {preferences.interests?.slice(0, 5).map((interest, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm"
                                                >
                                                    {interest}
                                                </span>
                                            ))}
                                            {(!preferences.interests || preferences.interests.length === 0) && (
                                                <p className="text-gray-400 text-sm">Add interests to find better matches</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Start Chat Button */}
                                    <button
                                        onClick={startLooking}
                                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl text-lg font-bold shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-3"
                                    >
                                        <MessageSquare size={22} />
                                        Start Random Chat
                                        <Sparkle size={16} />
                                    </button>

                                    <p className="text-center text-gray-400 text-sm mt-4">
                                        Press <kbd className="px-2 py-1 bg-black/30 rounded">Enter</kbd> to start • <kbd className="px-2 py-1 bg-black/30 rounded">ESC</kbd> to skip
                                    </p>
                                </div>

                                {/* Quick Options */}
                                <div className="flex justify-center gap-4">
                                    <Button
                                        size={'lg'}
                                        icon={'video'}
                                        variant={'purple'}
                                        onClick={() => setIsOpenVideoChatDialog(true)}
                                    >
                                        Video Chat
                                    </Button>
                                    <Button
                                        icon={'users'}
                                        size={'lg'}
                                        variant={'secondary'}
                                        onClick={() => setOpenManageModel(true)}
                                    >
                                        Preferences
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Looking State */}
                    {status === 'looking' && (
                        <motion.div
                            key="looking"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center p-6"
                        >
                            <div className="text-center max-w-md">
                                <div className="relative w-32 h-32 mx-auto mb-8">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping opacity-20"></div>
                                    <div className="absolute inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                                        <Users size={48} className="text-white animate-pulse" />
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-4">Finding a chat partner...</h3>
                                <p className="text-gray-300 mb-8">We're searching for someone interesting for you to chat with</p>

                                <div className="flex justify-center gap-2 mb-8">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce"
                                            style={{ animationDelay: `${i * 200}ms` }}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={stopLooking}
                                    className="px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 rounded-xl font-medium"
                                >
                                    Cancel Search
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Chat Ended State */}
                    {hasPartnerSkipped && (
                        <motion.div
                            key="skipped"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center p-6"
                        >
                            <div className="text-center max-w-md">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6">
                                    <HeartCrack size={32} className="text-red-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Chat Ended</h3>
                                <p className="text-gray-300 mb-8">
                                    {messages.find(m => m.text?.includes('partner'))?.text || 'Your chat partner has disconnected.'}
                                </p>
                                <div className="space-y-4">
                                    <button
                                        onClick={() => {
                                            setHasPartnerSkipped(false);
                                            startLooking();
                                        }}
                                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-medium"
                                    >
                                        Find New Partner
                                    </button>
                                    <button
                                        onClick={() => setOpenManageModel(true)}
                                        className="w-full py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 rounded-xl font-medium"
                                    >
                                        Adjust Preferences
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Chat Connected State */}
                    {(status === 'connected' || status === 'direct') && !hasPartnerSkipped && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Chat Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                <div className="max-w-3xl mx-auto space-y-4">
                                    {messages.map((msg, idx) => {
                                        const isMe = msg.sender === 'me';
                                        const isSystem = msg.type === 'system';

                                        if (isSystem) {
                                            return (
                                                <div key={msg.id || idx} className="text-center my-4">
                                                    <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full text-sm text-purple-300">
                                                        {msg.text} {msg.highlight && (
                                                            <span className="font-bold text-white">{msg.highlight}</span>
                                                        )} {msg.suffix}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <motion.div
                                                key={msg.id || idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-3`}
                                            >
                                                {!isMe && (
                                                    <div
                                                        className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 transition-transform"
                                                        onClick={() => setIsProfileModalOpen(true)}
                                                    >
                                                        {strangerInfo?.name?.[0]}
                                                    </div>
                                                )}

                                                <div className={`max-w-[70%] ${isMe ? 'order-first' : ''}`}>
                                                    {!isMe && (
                                                        <div className="text-xs text-gray-400 mb-1 ml-1">
                                                            {strangerInfo?.name}
                                                        </div>
                                                    )}
                                                    <div className={`rounded-2xl p-4 ${isMe
                                                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-tr-none'
                                                        : theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'
                                                        }`}>
                                                        {(msg.attachmentType === 'image' || msg.attachmentType === 'gif') && msg.attachment && (
                                                            <div
                                                                className="mb-2 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                                                onClick={() => setPreviewImage(msg.attachment)}
                                                            >
                                                                <img src={msg.attachment} alt="attachment" className="max-w-full h-auto" />
                                                            </div>
                                                        )}
                                                        {msg.attachment && msg.attachmentType === 'video' && (
                                                            <div className="mb-2 rounded-lg overflow-hidden">
                                                                <video src={msg.attachment} controls className="max-w-full h-auto" />
                                                            </div>
                                                        )}
                                                        {msg.attachment && msg.attachmentType === 'audio' && (
                                                            <div className="mb-2">
                                                                <audio src={msg.attachment} controls className="w-full max-w-[240px]" />
                                                            </div>
                                                        )}
                                                        {msg.text && !(msg.attachmentType === 'gif' && msg.text.startsWith('[GIF:')) && <p className="text-white text-sm">{msg.text}</p>}
                                                        <p className={`text-xs mt-2 ${isMe ? 'text-white/70' : 'text-gray-400'} text-right`}>
                                                            {msg.time}
                                                        </p>
                                                    </div>
                                                </div>

                                                {isMe && (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                                                        {user?.name?.[0]}
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}

                                    {isPartnerTyping && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                                {strangerInfo?.name?.[0]}
                                            </div>
                                            <div className="bg-white/10 rounded-2xl rounded-tl-none px-4 py-3">
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
            {/* Call Dialogs */}
            {callType === 'voice' ? (
                <VoiceCallDialog
                    isOpen={isCallModalOpen}
                    onClose={cleanupCall}
                    partner={strangerInfo}
                    callStatus={callStatus}
                    onAccept={acceptCall}
                    onReject={rejectCall}
                    onEnd={endCall}
                    isMuted={isMuted}
                    onToggleMute={() => {
                        const newMuted = !isMuted;
                        setIsMuted(newMuted);
                        if (localStreamRef.current) {
                            localStreamRef.current.getAudioTracks().forEach(track => track.enabled = !newMuted);
                        }
                    }}
                />
            ) : (
                <VideoCallDialog
                    isOpen={isCallModalOpen}
                    onClose={cleanupCall}
                    partner={strangerInfo}
                    callStatus={callStatus}
                    onAccept={acceptCall}
                    onReject={rejectCall}
                    onEnd={endCall}
                    isMuted={isMuted}
                    onToggleMute={() => {
                        const newMuted = !isMuted;
                        setIsMuted(newMuted);
                        if (localStreamRef.current) {
                            localStreamRef.current.getAudioTracks().forEach(track => track.enabled = !newMuted);
                        }
                    }}
                    isCameraOff={isCameraOff}
                    onToggleCamera={() => {
                        const newCameraOff = !isCameraOff;
                        setIsCameraOff(newCameraOff);
                        if (localStreamRef.current) {
                            localStreamRef.current.getVideoTracks().forEach(track => track.enabled = !newCameraOff);
                        }
                    }}
                    localVideoRef={localVideoRef}
                    remoteVideoRef={remoteVideoRef}
                />
            )}

            <div className="p-3 md:p-4 bg-[#2b2d31] flex items-center gap-2 md:gap-3 shrink-0 border-t border-[#1e1f22]">
                <Button
                    variant='secondary'
                    size='lg'
                    onClick={() => handleSkip(false)}
                    title="Stop (ESC)"
                    className="shrink-0 aspect-square flex items-center justify-center !px-0 w-12"
                >
                    ESC
                </Button>

                {status === 'idle' || hasPartnerSkipped ? (
                    <Button
                        variant='purple'
                        size='lg'
                        onClick={() => {
                            setHasPartnerSkipped(false);
                            startLooking();
                        }}
                        className="shrink-0 whitespace-nowrap bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-none"
                    >
                        START CHAT
                    </Button>
                ) : (
                    <div className="flex gap-2 shrink-0">
                        <Button
                            variant='roseGradient'
                            onClick={() => handleSkip(true)}
                            className="whitespace-nowrap"
                        >
                            SKIP
                        </Button>
                        {followers.some(f => f.id === strangerInfo?.id) ? (
                            <Button
                                onClick={() => handleRemoveFriend(strangerInfo?.id)}
                                disabled={!strangerInfo}
                                variant='secondary'
                                icon={'user-minus'}
                                className="hidden sm:flex"
                            >
                                Unfollow
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSendFollowRequest}
                                disabled={!strangerInfo}
                                variant='rose'
                                icon={'user-plus'}
                                className="hidden sm:flex"
                            >
                                Follow
                            </Button>
                        )}
                    </div>
                )}

                <div className="flex-1 flex flex-col gap-2 min-w-0">
                    {attachmentPreview && (
                        <div className="relative w-20 h-20 bg-[#2b2d31] rounded-lg border border-[#5865F2] overflow-hidden group">
                            {attachmentPreview === 'video' ? (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-800">
                                    <Video size={24} />
                                </div>
                            ) : attachmentPreview === 'audio' ? (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-800">
                                    <Mic size={24} />
                                </div>
                            ) : (
                                <img src={attachmentPreview} className="w-full h-full object-cover" alt="preview" />
                            )}
                            <button
                                onClick={handleRemoveAttachment}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            ref={inputRef}
                            value={messageInput}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            disabled={status !== 'connected' && status !== 'direct'}
                            placeholder={status === 'connected' || status === 'direct'
                                ? `Message...`
                                : "Connect to start chatting..."}
                            className={`flex-1 px-4 py-3 rounded-xl ${theme === 'dark' ? 'bg-white/10 border-white/10 focus:border-purple-500' : 'bg-gray-100 border-gray-200 focus:border-purple-400'} border focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-purple-500/20' : 'focus:ring-purple-400/20'} transition-all disabled:opacity-50 min-w-0`}
                        />
                        <div className="hidden sm:flex items-center gap-2 text-gray-400">
                            <div className="relative gift-menu-container">
                                <button
                                    onClick={() => {
                                        setShowGiftMenu(!showGiftMenu);
                                        setShowEmojiPicker(false);
                                        setShowMediaMenu(false);
                                        setShowGifPicker(false);
                                    }}
                                    disabled={status !== 'connected' && status !== 'direct'}
                                    className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} disabled:opacity-50`}
                                    title="Send Gifts"
                                >
                                    <Gift size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-800'} />
                                </button>
                                {/* Gift Menu */}
                                <AnimatePresence>
                                    {showGiftMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className={`absolute bottom-full mb-2 w-64 ${theme === 'dark' ? 'bg-gray-900/95 backdrop-blur-xl' : 'bg-white/95 backdrop-blur-xl'} rounded-xl shadow-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} p-3`}
                                        >
                                            <h4 className="font-medium text-white mb-3">Send a Gift 🎁</h4>
                                            <div className="grid grid-cols-3 gap-3">
                                                {gifts.map((gift) => (
                                                    <button
                                                        key={gift.id}
                                                        onClick={() => handleSendGift(gift)}
                                                        className="flex flex-col items-center p-3 bg-white/5 hover:bg-white/10 rounded-lg"
                                                    >
                                                        <span className={`text-2xl ${gift.color}`}>{gift.emoji}</span>
                                                        <span className="text-xs mt-1">{gift.name}</span>
                                                        <span className="text-xs text-yellow-400 mt-1">⭐{gift.price}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="relative emoji-picker-container">
                                <button
                                    onClick={() => {
                                        setShowEmojiPicker(!showEmojiPicker);
                                        setShowMediaMenu(false);
                                        setShowGiftMenu(false);
                                        setShowGifPicker(false);
                                    }}
                                    disabled={status !== 'connected' && status !== 'direct'}
                                    className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} disabled:opacity-50`}
                                    title="Emojis"
                                >
                                    <Smile size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-800'} />
                                </button>
                            </div>

                            <div className="relative media-menu-container">
                                <button
                                    onClick={() => {
                                        setShowMediaMenu(!showMediaMenu);
                                        setShowEmojiPicker(false);
                                        setShowGiftMenu(false);
                                        setShowGifPicker(false);
                                    }}
                                    disabled={status !== 'connected' && status !== 'direct'}
                                    className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} disabled:opacity-50`}
                                    title="Media & Quick GIFs"
                                >
                                    <ImageIcon size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-800'} />
                                </button>

                                {/* Media Menu */}
                                <AnimatePresence>
                                    {showMediaMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className={`absolute bottom-full mb-2 w-64 ${theme === 'dark' ? 'bg-gray-900/95 backdrop-blur-xl' : 'bg-white/95 backdrop-blur-xl'} rounded-xl shadow-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} p-3`}
                                        >
                                            <div className="mb-3">
                                                <h4 className="font-medium text-white mb-2">Send Media</h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <label className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer">
                                                        <ImageIcon size={18} />
                                                        <span className="text-sm">Photo/Video</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*,video/*"
                                                            ref={fileInputRef}
                                                            onChange={handleFileSelect}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                    <label className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer">
                                                        <Camera size={18} />
                                                        <span className="text-sm">Camera</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            capture="user"
                                                            ref={cameraInputRef}
                                                            onChange={handleCameraCapture}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-medium text-white mb-2">Quick GIF</h4>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {gifs.slice(0, 8).map((gif) => (
                                                        <button
                                                            key={gif.id}
                                                            onClick={() => handleGifSelect(gif)}
                                                            className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform"
                                                        >
                                                            <img
                                                                src={gif.images.fixed_height_small.url}
                                                                alt={gif.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={status !== 'connected' && status !== 'direct'}
                                className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} disabled:opacity-50 ${isRecording ? 'text-red-500 animate-pulse' : ''}`}
                                title="Voice Message"
                            >
                                <Mic size={20} className={!isRecording ? (theme === 'dark' ? 'text-white' : 'text-gray-800') : ''} />
                            </button>

                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!messageInput.trim() || (status !== 'connected' && status !== 'direct')}
                                className={`p-3 rounded-xl ${messageInput.trim() && (status === 'connected' || status === 'direct')
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                    : theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'
                                    } transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                                title="Send Message"
                            >
                                <Send size={20} className="text-white" />
                            </button>
                        </div>
                    </div>
                    {showEmojiPicker && (
                        <div className="absolute bottom-20 right-4 z-[200]">
                            <EmojiPicker
                                onEmojiClick={handleEmojiClick}
                                theme={theme === 'dark' ? 'dark' : 'light'}
                                height={350}
                                width={300}
                            />
                        </div>
                    )}
                    {showGifPicker && (
                        <div className="absolute bottom-16 right-4 z-[200] w-72 bg-[#1e1f22] rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                            <div className="p-3 border-b border-white/5">
                                <input
                                    type="text"
                                    placeholder="Search GIFs..."
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#5865F2] focus:ring-0"
                                    value={gifSearch}
                                    onChange={(e) => setGifSearch(e.target.value)}
                                />
                            </div>
                            <div className="h-64 overflow-y-auto p-2 grid grid-cols-2 gap-2 custom-scrollbar">
                                {gifs.map(gif => (
                                    <div
                                        key={gif.id}
                                        className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-gray-800"
                                        onClick={() => {
                                            handleSendMessage(gif.images.fixed_height.url);
                                            setShowGifPicker(false);
                                        }}
                                    >
                                        <img src={gif.images.fixed_height_small.url} className="w-full h-full object-cover" alt={gif.title} />
                                    </div>
                                ))}
                                {gifs.length === 0 && (
                                    <div className="col-span-2 py-8 text-center text-gray-500 text-xs">No GIFs found</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Preview Modal */}
            <DialogBox
                isOpen={!!previewImage}
                setIsOpen={() => setPreviewImage(null)}
                title="Image Preview"
                variant="dark"
                maxWidth="max-w-4xl"
                actions={
                    <>
                        <Button variant="dark" onClick={() => setPreviewImage(null)}>
                            Close
                        </Button>
                    </>
                }
            >
                <div className="flex items-center justify-center p-2">
                    <img src={previewImage} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
                </div>
            </DialogBox >

            <UserProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={strangerInfo}
                onStartChat={() => { }}
                onAddFriend={handleSendFollowRequest}
                onRemoveFriend={handleRemoveFriend}
                onBlockUser={handleBlockUser}
                onDeleteChat={() => handleDeleteChatByFriendId(strangerInfo?.id)}
                isOnline={true}
                isFriend={followers.some(f => f.id === strangerInfo?.id)}
            />

            <VideoChatDialog
                open={isOpenVideoChatDialog}
                setOpen={setIsOpenVideoChatDialog}
                handleStartChat={() => {
                    dispatch(__listenUpdateUser({ videoChatDialog: false }));
                    setIsOpenVideoChatDialog(false);
                }}
            />

            <ManageInterestDialog
                open={openManageModel}
                setOpen={setOpenManageModel}
                handleSubmit={() => setOpenManageModel(false)}
            />

            {/* Gender Selection Modal */}
            <DialogBox
                maxWidth='max-w-md'
                variant={'gray'}
                isOpen={showGenderModal}
                title={setupStep === 1 ? 'Before you start...' : ''}
                setIsOpen={setShowGenderModal}
                actions={
                    setupStep === 1 ?
                        <>
                            <Button
                                className={'w-full'}
                                variant={'purple'}
                                onClick={handleGenderSubmit}>
                                I AGREE, LET'S GO!
                            </Button>
                            <div className={'pt-3 !text-xs text-gray-400'}>
                                Already have an account? <span className={'text-purple-400'}>Login</span>
                            </div>
                        </>
                        : ''
                }
            >
                {
                    setupStep === 1 ?
                        <>
                            <div className={'text-base text-gray-200'}>
                                Select your gender so we can match you with the right people.
                            </div>
                            <div className={'text-gray-300 font-bold pt-3'}>I am:</div>

                            <div className={'py-5'}>
                                <RadioButtonGroup
                                    options={genderOptions}
                                    valueKey="name"
                                    selected={selectedGender}
                                    onChange={(val) => {
                                        console.log('Selected Gender:', val);
                                        setSelectedGender(val);
                                    }}
                                    label="Choose Gender"
                                />
                            </div>
                            <div className={'!text-xs text-gray-400'}>
                                *You cannot change your gender after you register.
                            </div>

                            <div className='pt-2'>
                                I'm at least <span className={'text-red-400'}> 18 years old </span>
                                and have read and agree to the
                                <span className={'text-purple-400'}> Terms of Service </span> and
                                <span className={'text-purple-400'}> Privacy Policy </span>
                            </div>
                        </>
                        :
                        <>
                            <div>Are You Human?</div>
                            <div>Please complete the captcha below to continue.</div>
                            <Button
                                className={'w-full mt-4'}
                                variant={'purple'}
                                onClick={handleCompleteSetup}>
                                Captcha WIP Click to skip
                            </Button>
                        </>
                }
            </DialogBox>

            {/* Add CSS for animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .animation-delay-1000 {
                    animation-delay: 1s;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            `}</style>
        </div >
    );
};

export default Index;
