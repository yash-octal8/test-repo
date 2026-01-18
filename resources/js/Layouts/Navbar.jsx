import { useDispatch, useSelector } from 'react-redux';
import listenApi from '../Utils/Api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    MessageSquare,
    History,
    Puzzle,
    Sparkles,
    AlertCircle,
    Crown,
    Search,
    Pencil as PencilIcon,
    X,
    Trash2,
    MoreVertical,
    ShieldAlert,
    UserX,
    Users,
    Volume2
} from 'lucide-react';
import { initEcho } from '../bootstrap';
import { DynamicIcon } from 'lucide-react/dynamic';
import UserAvatar from '../Components/UserAvatar';
import UserProfileModal from '../Components/UserProfileModal';
import Toggle from '../Components/ui/Toggle';
import Input from '../Components/Form/Input';
import Tabs from '../Components/ui/Tabs';
import AnimatedBg from '../Components/ui/AnimatedBg';
import FloatingParticles from '../Components/ui/FloatingParticles';
import {
    setFollowers,
    setPastMatches,
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
    setPendingRequests,
    updatePreferences,
    incrementUnreadCount
} from '../Store/ChatSlice';
import { __listenLogout } from '../Store/AuthSlice';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const Navbar = ({ isOpen, onClose }) => {
    const user = useSelector(state => state.auth?.user);
    const chatState = useSelector(state => state.chat);
    const followers = Array.isArray(chatState?.followers) ? chatState.followers : [];
    const pastMatches = Array.isArray(chatState?.pastMatches) ? chatState.pastMatches : [];
    const onlineUsers = Array.isArray(chatState?.onlineUsers) ? chatState.onlineUsers : [];
    const preferences = chatState?.preferences || {
        interestsEnabled: true,
        interests: [],
        interestInput: '',
        maxDuration: '∞',
        genderFilter: 'both',
    };
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [interestInput, setInterestInput] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Chat');

    useEffect(() => {
        if (!user) return;

        fetchFollowers();
        fetchMatchHistory();
        fetchPendingRequests();

        // Ensure Echo is initialized with the latest token
        initEcho();

        // Presence Channel for Online Status
        const presenceChannel = window.Echo.join('online-users');
        presenceChannel
            .here((users) => {
                console.log('Online users list (raw):', users);
                // Handle both array and object responses
                const usersArray = Array.isArray(users) ? users : Object.values(users);
                console.log('Online users list (processed):', usersArray);
                dispatch(setOnlineUsers(usersArray));
            })
            .joining((user) => {
                console.log('User joined presence channel:', user);
                dispatch(addOnlineUser(user));
            })
            .leaving((user) => {
                console.log('User left presence channel:', user);
                dispatch(removeOnlineUser(user));
            })
            .error((error) => {
                console.error('Presence channel error:', error);
            });

        // Listen for Follow Requests on user's private channel
        const userChannel = window.Echo.private(`user.${user.id}`);

        userChannel.listen('.follow.request.sent', (e) => {
            console.log('Follow Request Received in Navbar', e);
            fetchPendingRequests();
            iziToast.show({
                theme: 'dark',
                icon: 'icon-person',
                title: e.sender?.name || 'Someone',
                message: 'sent you a friend request.',
                position: 'topRight',
                image: e.sender?.profile_image || null,
                imageWidth: 50,
                layout: 2,
                backgroundColor: '#1e1f22',
                titleColor: '#fff',
                messageColor: '#9ca3af',
                buttons: [
                    ['<button><b>Chat</b></button>', async function (instance, toast) {
                        instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                        // Logic to start chat or accept request then start chat
                        // For now, we'll just navigate to chat if they are friends, or maybe just open profile
                        // But usually "Chat" implies accepting. Let's assume this is just a notification and "Chat" might need them to be friends first.
                        // Actually, the screenshot shows "Inbox" style.
                        // Let's stick to the request notification for now.
                        // If it's a request, we probably want to "View" or "Accept".
                        // But the user asked for "Chat" button.
                        // If I click Chat on a request, it implies accepting.
                        // Let's just open the profile for now so they can accept/chat.
                        openProfile(e.sender);
                    }, true],
                    ['<button>Dismiss</button>', function (instance, toast) {
                        instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                    }]
                ],
            });
        });

        userChannel.listen('.follow.request.updated', (e) => {
            console.log('Follow Request Updated in Navbar', e);
            fetchPendingRequests();

            // Always fetch followers to update the list, regardless of who accepted
            fetchFollowers();

            if (e.status === 'accepted') {
                const isMeReceiver = e.receiver?.id === user.id;
                // If I sent the request and it was accepted, notify me
                if (!isMeReceiver) {
                    iziToast.success({
                        title: 'Follow Request Accepted',
                        message: `${e.receiver?.name} accepted your follow request!`,
                        position: 'topRight'
                    });
                }
            }
        });

        userChannel.listen('.message.sent', (e) => {
            console.log('New message received in Navbar:', e);
            if (e.message && e.message.sender_id) {
                dispatch(incrementUnreadCount(e.message.sender_id));
            }
            fetchFollowers();
            fetchMatchHistory();
        });

        // Optional: Show a toast if not in that chat
        // We can check the current URL or a global state
        // if (window.location.pathname !== '/user/start-chat') {
        //     iziToast.info({
        //         title: `New message from ${e.message.sender.name}`,
        //         message: e.message.message,
        //         position: 'topRight',
        //         onClick: () => navigate('/user/start-chat', { state: { directSession: { session: { session_id: e.message.chat_session_id }, partner: e.message.sender } } })
        //     });
        // }
        userChannel.listen('.chat.started', (e) => {
            console.log('Chat Started in Navbar:', e);
            fetchMatchHistory();
        });

        userChannel.listen('.chat.ended', (e) => {
            console.log('Chat Ended in Navbar:', e);
            fetchMatchHistory();
        });



        return () => {
            window.Echo.leave('online-users');
            userChannel.stopListening('.follow.request.sent');
            userChannel.stopListening('.follow.request.updated');
            userChannel.stopListening('.message.sent');
            userChannel.stopListening('.chat.started');
        };
    }, [user]);

    const fetchFollowers = async () => {
        try {
            const response = await listenApi.get('follow/friends');
            console.log('Friends list fetched:', response.data);
            // Backend returns array directly
            dispatch(setFollowers(Array.isArray(response.data) ? response.data : []));
        } catch (error) {
            console.error("Failed to fetch friends", error);
        }
    };

    const fetchMatchHistory = async () => {
        try {
            const response = await listenApi.get('chat/history');
            if (response.data.success) {
                dispatch(setPastMatches(Array.isArray(response.data.history) ? response.data.history : []));
            }
        } catch (error) {
            console.error("Failed to fetch match history", error);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const response = await listenApi.get('follow/requests');
            // Backend returns array directly
            dispatch(setPendingRequests(Array.isArray(response.data) ? response.data : []));
        } catch (error) {
            console.error("Failed to fetch pending requests", error);
        }
    };

    const handlePreferenceChange = async (key, value) => {
        const newPreferences = { ...preferences, [key]: value };
        dispatch(updatePreferences({ [key]: value }));

        try {
            await listenApi.post('save-preferences', {
                interests: preferences.interests, // Assuming interests is an array in Redux
                match_with_interests: key === 'interestsEnabled' ? value : preferences.interestsEnabled,
                prefer_gender: key === 'genderFilter' ? value : preferences.genderFilter,
            });
        } catch (error) {
            console.error("Failed to save preferences", error);
        }
    };

    const tabItems = [
        {
            label: 'Chat',
            icon: 'message-square',
            content: (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Direct Messages</h3>
                    </div>
                    <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {pastMatches.filter(match => match.status === 'active').length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-xs text-gray-600 italic">No active matches.</p>
                            </div>
                        ) : (
                            pastMatches
                                .filter(match => match.status === 'active')
                                .slice(0, 15)
                                .map((match, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
                                        onClick={() => openProfile(match.partner)}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden border border-white/5 group-hover:border-indigo-500/30 transition-colors shrink-0">
                                            {match.partner?.profile_image ? (
                                                <img src={match.partner.profile_image} alt={match.partner.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                    <User size={14} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-gray-300 truncate group-hover:text-white transition-colors">{match.partner?.name || 'Stranger'}</h4>
                                            <p className="text-[9px] text-green-500 font-medium truncate">Matched Now</p>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            ),
        },
        {
            label: 'Friends',
            icon: 'users',
            content: (
                <div className="space-y-4">
                    <div className="px-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                            <input
                                placeholder="Search friends..."
                                className="w-full bg-black/40 border border-white/5 text-xs text-white pl-9 pr-4 py-2.5 rounded-xl focus:border-indigo-500/50 focus:ring-0 transition-all placeholder-gray-600"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Friends</h3>
                        <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] text-green-500 font-bold">
                                {followers.filter(f => Array.isArray(onlineUsers) && onlineUsers.some(u => String(u.id) === String(f.id))).length}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {followers.filter(f => Array.isArray(onlineUsers) && onlineUsers.some(u => String(u.id) === String(f.id))).length === 0 ? (
                            <div className="py-12 text-center opacity-30">
                                <Users size={40} className="mx-auto mb-3 text-gray-400" />
                                <p className="text-xs text-gray-400">No friends online.</p>
                            </div>
                        ) : (
                            followers
                                .filter(friend => Array.isArray(onlineUsers) && onlineUsers.some(u => String(u.id) === String(friend.id)))
                                .map((friend) => {
                                    // We know they are online because of the filter
                                    const isOnline = true;
                                    return (
                                        <div
                                            key={friend.id}
                                            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-white/5"
                                            onClick={() => openProfile(friend)}
                                        >
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-white/5 group-hover:border-indigo-500/30 transition-colors">
                                                    {friend.profile_image ? (
                                                        <img src={friend.profile_image} alt={friend.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                            <User size={18} />
                                                        </div>
                                                    )}
                                                </div>
                                                {isOnline && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-[3px] border-[#0B0C10]"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{friend.name}</h4>
                                                    {friend.unread_count > 0 && (
                                                        <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg shadow-indigo-600/20">
                                                            {friend.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-[10px] font-bold uppercase tracking-wider ${isOnline ? 'text-green-500' : 'text-gray-600'}`}>
                                                    {isOnline ? 'Online' : 'Offline'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </div>
            ),
        },
    ];

    const handleStartDirectChat = async (friendId) => {
        try {
            const response = await listenApi.post('chat/dm/start', { friend_id: friendId });
            console.log(response.data);
            if (response.data.success) {
                const friend = followers.find(f => f.id === friendId) || selectedUser;
                setIsProfileModalOpen(false);
                navigate(`/chat/new/${response.data?.session?.session_id}`, {
                    state: {
                        directSession: {
                            session: response.data.session,
                            partner: friend
                        }
                    }
                });
            }
        } catch (error) {
            console.error("Failed to start direct chat", error);
            iziToast.error({ title: 'Error', message: 'Failed to start chat' });
        }
    };

    const handleDeleteChat = async (sessionId) => {
        if (!confirm('Are you sure you want to delete this chat history?')) return;
        try {
            const response = await listenApi.delete(`chat/delete/${sessionId}`);
            if (response.data.success) {
                iziToast.success({ title: 'Deleted', message: 'Chat history deleted.' });
                fetchMatchHistory();
            }
        } catch (error) {
            console.error("Failed to delete chat", error);
            iziToast.error({ title: 'Error', message: 'Failed to delete chat' });
        }
    };

    const handleDeleteChatByFriendId = async (friendId) => {
        if (!confirm('Are you sure you want to delete chat history with this friend?')) return;
        try {
            const response = await listenApi.delete(`chat/delete-by-friend/${friendId}`);
            if (response.data.success) {
                iziToast.success({ title: 'Deleted', message: 'Chat history deleted.' });
                fetchMatchHistory();
            }
        } catch (error) {
            console.error("Failed to delete chat", error);
            iziToast.error({ title: 'Error', message: 'Failed to delete chat' });
        }
    };

    const handleRemoveFriend = async (friendId) => {
        if (!confirm('Are you sure you want to remove this friend?')) return;
        try {
            const response = await listenApi.post('follow/remove', { friend_id: friendId });
            if (response.data.success) {
                iziToast.success({ title: 'Removed', message: 'Friend removed.' });
                fetchFollowers();
            }
        } catch (error) {
            console.error("Failed to remove friend", error);
            iziToast.error({ title: 'Error', message: 'Failed to remove friend' });
        }
    };

    const handleAddFriend = async () => {
        if (!selectedUser) return;
        try {
            const res = await listenApi.post('follow/request', {
                receiver_id: selectedUser.id
            });
            iziToast.success({ title: 'Success', message: 'Follow request sent!' });
        } catch (err) {
            console.error(err);
            iziToast.error({
                title: 'Error',
                message: err.response?.data?.message || 'Failed to send follow request'
            });
        }
    };

    const handleBlockUser = async (userId) => {
        if (!confirm('Are you sure you want to block this user?')) return;
        try {
            const response = await listenApi.post('follow/block', { user_id: userId });
            if (response.data.success) {
                iziToast.success({ title: 'Blocked', message: 'User blocked.' });
                // Refresh followers and history
                fetchFollowers();
                fetchMatchHistory();
                setIsProfileModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to block user", error);
            iziToast.error({ title: 'Error', message: 'Failed to block user' });
        }
    };

    const handleUnblockUser = async (userId) => {
        if (!confirm('Are you sure you want to unblock this user?')) return;
        try {
            const response = await listenApi.post('follow/unblock', { user_id: userId });
            if (response.data.success) {
                iziToast.success({ title: 'Unblocked', message: 'User unblocked.' });
                // Refresh followers and history
                fetchFollowers();
                fetchMatchHistory();
                setIsProfileModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to unblock user", error);
            iziToast.error({ title: 'Error', message: 'Failed to unblock user' });
        }
    };

    const openProfile = (user) => {
        setSelectedUser(user);
        setIsProfileModalOpen(true);
    };

    const handleAccountSetting = () => {
        navigate('/user/account');
    }

    const handleLogOut = async () => {
        await listenApi.post('logout').then(res => {
            dispatch(__listenLogout());
            navigate('/')
        });
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <div className={`
                fixed lg:relative z-50 
                w-[85vw] sm:w-[280px] lg:w-[300px] min-h-full 
                flex flex-col p-4 lg:p-6 
                bg-[#0a0a0f] border-r border-white/5 shadow-2xl
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Close Button Mobile */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white lg:hidden"
                >
                    <X size={20} />
                </button>

                {/* Animated Background Gradient */}
                <AnimatedBg />

                {/* Floating Particles */}
                <FloatingParticles />
                {/* Logo Section */}
                <div className="relative z-10 flex items-center justify-between mb-8 mt-2 lg:mt-0">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <MessageSquare size={18} className="text-white fill-current" />
                        </div>
                        <h1 className="text-lg font-black text-white tracking-tighter">
                            Talker<span className="text-indigo-500">.Guy</span>
                        </h1>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="relative z-10 flex gap-2 mb-8">
                    <button
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'Chat' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        onClick={() => setActiveTab('Chat')}
                    >
                        <MessageSquare size={14} />
                        Chat
                    </button>
                    <button
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'Friends' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        onClick={() => setActiveTab('Friends')}
                    >
                        <Users size={14} />
                        Friends
                        {followers.reduce((acc, curr) => acc + (Number(curr.unread_count) || 0), 0) > 0 && (
                            <span className="ml-1 bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                {followers.reduce((acc, curr) => acc + (Number(curr.unread_count) || 0), 0)}
                            </span>
                        )}
                    </button>
                </div>

                {/* Sidebar Content */}
                <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-1">
                    <div className="space-y-6">
                        {activeTab === 'Chat' ? tabItems[0].content : tabItems[1].content}

                        {/* Preferences Section */}
                        {/* Preferences Section - REMOVED (Moved to Chat/index.jsx) */}
                    </div>
                </div>

                {/* User Profile Section */}
                <div className="relative z-10 mt-auto pt-4 border-t border-white/5 bg-[#0B0C10]">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0" onClick={handleAccountSetting}>
                            <UserAvatar
                                src={user?.profile_image || null}
                                size={'sm'}
                                className='!border-none'
                            />
                            <div className='flex flex-col min-w-0'>
                                <span className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors truncate">{user?.name}</span>
                                <span className={'text-[10px] text-gray-600 font-bold uppercase tracking-wider'}>Free</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button className="p-2 text-gray-600 hover:text-white transition-colors">
                                <Volume2 size={16} />
                            </button>
                            <button className="p-2 text-gray-600 hover:text-white transition-colors" onClick={handleAccountSetting}>
                                <MoreVertical size={16} />
                            </button>
                            <button
                                onClick={handleLogOut}
                                className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                                title="Logout"
                            >
                                <DynamicIcon name={'log-out'} size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div >
            <UserProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={selectedUser}
                onStartChat={handleStartDirectChat}
                onRemoveFriend={handleRemoveFriend}
                onBlockUser={handleBlockUser}
                onDeleteChat={handleDeleteChatByFriendId}
                onAddFriend={handleAddFriend}
                onUnblockUser={handleUnblockUser}
                isFriend={followers.some(f => f.id === selectedUser?.id)}
                isOnline={selectedUser && onlineUsers.some(u => Number(u.id) === Number(selectedUser.id))}
            />
        </>
    );
};

export default Navbar;
