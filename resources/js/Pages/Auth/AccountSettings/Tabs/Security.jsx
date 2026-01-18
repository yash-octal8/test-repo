import React, { useState, useEffect } from 'react';
import {
    Shield,
    Eye,
    EyeOff,
    Lock,
    Globe,
    Users,
    Phone,
    PhoneOff,
    AlertCircle,
    Trash2,
    ChevronDown,
    Crown,
    UserCheck,
    UserX,
    Check,
    X
} from 'lucide-react';
import { Switch } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import Button from '../../../../Components/ui/Button';
import Listbox from '../../../../Components/ui/Listbox';
import DialogBox from '../../../../Components/DialogBox';
import listenApi from '../../../../Utils/Api';
import { __listenUpdateUser } from '../../../../Store/AuthSlice';
import iziToast from 'izitoast';

const SecurityTab = () => {
    const user = useSelector(state => state?.auth?.user);
    const _dispatch = useDispatch();

    const [badgeSettings, setBadgeSettings] = useState({
        isPremium: user?.is_premium || false,
        visibility: user?.extra_info?.badge_visibility || 'everyone',
    });

    const [interestsVisibility, setInterestsVisibility] = useState(user?.extra_info?.interests_visibility || 'everyone');
    const [allowFriendRequests, setAllowFriendRequests] = useState(user?.extra_info?.allow_friend_requests ?? true);
    const [allowCalls, setAllowCalls] = useState(user?.extra_info?.allow_calls ?? true);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    useEffect(() => {
        if (user) {
            setBadgeSettings({
                isPremium: user?.extra_info?.is_premium || false,
                visibility: user?.extra_info?.badge_visibility || 'everyone',
            });
            setInterestsVisibility(user?.extra_info?.interests_visibility || 'everyone');
            setAllowFriendRequests(user?.extra_info?.allow_friend_requests ?? true);
            setAllowCalls(user?.extra_info?.allow_calls ?? true);
        }
    }, [user]);

    const updateSecuritySetting = (setting, value) => {
        const payload = { [setting]: value };
        listenApi.post('update-profile', payload).then(res => {
            const updatedUser = res.data?.data?.user;
            _dispatch(__listenUpdateUser(updatedUser));
            iziToast.success({
                title: 'Updated',
                position: 'topRight',
                message: 'Security setting updated successfully',
                timeout: 2000
            });
        }).catch(err => {
            iziToast.error({
                title: 'Error',
                position: 'topRight',
                message: 'Failed to update setting',
            });
        });
    };

    const visibilityOptions = [
        { id: 1, value: 'everyone', label: 'Everyone', icon: Globe, description: 'Visible to all users', color: 'text-green-600 bg-green-50' },
        { id: 2, value: 'friends', label: 'Friends Only', icon: Users, description: 'Only your approved friends', color: 'text-blue-600 bg-blue-50' },
        { id: 3, value: 'nobody', label: 'Nobody', icon: EyeOff, description: 'Hidden from everyone', color: 'text-gray-600 bg-gray-50' },
    ];


    const handleBadgeVisibilityChange = (value) => {
        if (!badgeSettings.isPremium) return;
        setBadgeSettings(prev => ({ ...prev, visibility: value }));
        updateSecuritySetting('badge_visibility', value);
    };

    const handleUpgradePremium = () => {
        setBadgeSettings(prev => ({ ...prev, isPremium: true }));
    };

    const handleAccountDeletion = () => {
        if (deleteConfirmText === 'DELETE') {
            console.log('Account deletion confirmed');
            setShowDeleteConfirmation(false);
            setDeleteConfirmText('');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    const shakeAnimation = {
        shake: {
            x: [0, -10, 10, -10, 10, 0],
            transition: { duration: 0.5 }
        }
    };

    const pulseAnimation = {
        pulse: {
            scale: [1, 1.05, 1],
            transition: { duration: 1, repeat: Infinity }
        }
    };
    const mainClassOfCard = `p-4 md:p-8`;
    const basicCardClass = `bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/[0.08] transition-all duration-300 shadow-xl`;

    return (
        <motion.div
            className={`${mainClassOfCard} space-y-5`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Badge Visibility Section */}
            <motion.div
                variants={itemVariants}
                className={`${basicCardClass} ${badgeSettings.isPremium ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5'}`}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className={`p-3 rounded-xl ${badgeSettings.isPremium ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-white/5 border border-white/10'}`}
                        >
                            {badgeSettings.isPremium ? (
                                <Crown className="w-6 h-6 text-white" />
                            ) : (
                                <Shield className="w-6 h-6 text-gray-400" />
                            )}
                        </motion.div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-300">Badge Visibility</h3>
                            <p className="text-sm text-gray-200">Set who can see your profile badges</p>
                        </div>
                    </div>

                    {!badgeSettings.isPremium && (
                        <Button
                            variant={'secondary'}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white border-none"
                            onClick={handleUpgradePremium}
                            icon={'zap'}>
                            Get Premium
                        </Button>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-200">Visibility Settings</p>
                            <p className="text-sm text-gray-300">Changes might only be visible after a refresh</p>
                        </div>

                        <Listbox
                            value={badgeSettings.visibility}
                            onChange={handleBadgeVisibilityChange}
                            options={visibilityOptions}
                            disabled={!badgeSettings.isPremium}
                            className="w-56"
                        />
                    </div>

                    {!badgeSettings.isPremium && (
                        <motion.div
                            variants={shakeAnimation}
                            animate="shake"
                            className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/20"
                        >
                            <div className="flex items-start gap-3">
                                <motion.div
                                    animate={pulseAnimation.animate}
                                >
                                    <Lock className="w-5 h-5 text-purple-100 flex-shrink-0 mt-0.5" />
                                </motion.div>
                                <div>
                                    <p className="text-sm font-medium text-gray-300 leading-relaxed">
                                        This feature is available for <span className="text-indigo-400 font-black">Premium</span> users only
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Upgrade to customize who can see your achievement badges and unlock exclusive features.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Interests Visibility Section */}
            <motion.div
                variants={itemVariants}
                className={basicCardClass}
            >
                <div className="flex items-center gap-3 mb-6">
                    <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl"
                    >
                        <Eye className="w-6 h-6 text-gray-400" />
                    </motion.div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-200">Interests Visibility</h3>
                        <p className="text-sm text-gray-300">Set who can see your interests</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-200">Visibility Settings</p>
                            <p className="text-sm text-gray-300">Changes might only be visible after a refresh</p>
                        </div>

                        <Listbox
                            value={interestsVisibility}
                            onChange={(value) => {
                                setInterestsVisibility(value);
                                updateSecuritySetting('interests_visibility', value);
                            }}
                            options={visibilityOptions}
                            className="w-56"
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/20">
                            <div className="flex items-start gap-3">
                                <Eye className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-300">
                                    {interestsVisibility === 'everyone' && "Your interests are visible to everyone on the platform."}
                                    {interestsVisibility === 'friends' && "Only your approved friends can see your interests list."}
                                    {interestsVisibility === 'nobody' && "Your interests are hidden from everyone."}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Friend Requests Section */}
            <motion.div
                variants={itemVariants}
                className={basicCardClass}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`p-3 rounded-xl ${allowFriendRequests ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-white/5 border border-white/10'}`}
                        >
                            {allowFriendRequests ? (
                                <UserCheck className="w-6 h-6 text-white" />
                            ) : (
                                <UserX className="w-6 h-6 text-gray-400" />
                            )}
                        </motion.div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-200">Friend Requests</h3>
                            <p className="text-sm text-gray-300">Allow strangers to send you friend requests</p>
                        </div>
                    </div>

                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Switch
                            checked={allowFriendRequests}
                            onChange={(value) => {
                                setAllowFriendRequests(value);
                                updateSecuritySetting('allow_friend_requests', value);
                            }}
                            className={`
                relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300
                focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                ${allowFriendRequests ? 'bg-indigo-600' : 'bg-white/10'}
              `}
                        >
                            <span className="sr-only">Toggle friend requests</span>
                            <motion.span
                                layout
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className={`
                  inline-block h-6 w-6 transform rounded-full bg-white shadow-lg
                  ${allowFriendRequests ? 'translate-x-7' : 'translate-x-0.5'}
                `}
                            />
                        </Switch>
                    </motion.div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={allowFriendRequests ? 'enabled' : 'disabled'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`p-4 rounded-2xl border ${allowFriendRequests ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white/[0.02] border-white/5'}`}
                    >
                        <div className="flex items-start gap-3">
                            {allowFriendRequests ? (
                                <>
                                    <UserCheck className="w-5 h-5 text-gray-100 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-100">Friend requests are enabled</p>
                                        <p className="text-sm text-gray-300 mt-1">
                                            Anyone can send you friend requests. You'll receive notifications and can accept or decline each request.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <UserX className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Friend requests are disabled</p>
                                        <p className="text-sm text-gray-700 mt-1">
                                            Only people with your direct link or mutual friends can send requests. This reduces spam and unwanted requests.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Calls Section */}
            <motion.div
                variants={itemVariants}
                className={basicCardClass}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`p-3 rounded-xl ${allowCalls ? 'bg-gradient-to-br from-gray-300 to-gray-500' : 'bg-gradient-to-br from-gray-400 to-gray-500'}`}
                        >
                            {allowCalls ? (
                                <Phone className="w-6 h-6 text-white" />
                            ) : (
                                <PhoneOff className="w-6 h-6 text-white" />
                            )}
                        </motion.div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-200">Calls</h3>
                            <p className="text-sm text-gray-200">Disabling this will prevent you from receiving calls</p>
                        </div>
                    </div>

                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Switch
                            checked={allowCalls}
                            onChange={(value) => {
                                setAllowCalls(value);
                                updateSecuritySetting('allow_calls', value);
                            }}
                            className={`
                relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300
                focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                ${allowCalls ? 'bg-indigo-600' : 'bg-white/10'}
              `}
                        >
                            <span className="sr-only">Toggle calls</span>
                            <motion.span
                                layout
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className={`
                  inline-block h-6 w-6 transform rounded-full bg-white shadow-lg
                  ${allowCalls ? 'translate-x-7' : 'translate-x-0.5'}
                `}
                            />
                        </Switch>
                    </motion.div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={allowCalls ? 'calls-enabled' : 'calls-disabled'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`p-4 rounded-2xl border ${allowCalls ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-red-500/5 border-red-500/20'}`}
                    >
                        <div className="flex items-start gap-3">
                            {allowCalls ? (
                                <>
                                    <Phone className="w-5 h-5 text-gray-200 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-100">Calls are enabled</p>
                                        <p className="text-sm text-gray-200 mt-1">
                                            Friends and contacts can call you. You'll receive notifications for incoming calls and can choose to answer or decline.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <PhoneOff className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-100">Calls are disabled</p>
                                        <p className="text-sm text-gray-200 mt-1">
                                            You won't receive any calls. People trying to call you will see that calls are unavailable. You can still make outgoing calls.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Account Removal Section */}
            <motion.div
                variants={itemVariants}
                className={basicCardClass}
            >
                <div className="flex items-center gap-3 mb-6">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl"
                    >
                        <Trash2 className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Account Removal</h3>
                        <p className="text-sm text-gray-500 font-medium">Permanently delete your account</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="p-5 bg-red-500/5 rounded-2xl border border-red-500/20"
                    >
                        <div className="flex items-start gap-4">
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                            </motion.div>
                            <div>
                                <p className="text-lg font-black text-red-500 mb-3 tracking-tight">Warning: This action is irreversible</p>
                                <ul className="space-y-2 text-gray-400">
                                    {[
                                        "All your data will be permanently deleted within 30 days",
                                        "You will lose access to all your content and connections",
                                        "This action cannot be undone or recovered",
                                        "Your username will become available for others to use",
                                        "Any active subscriptions will be cancelled immediately"
                                    ].map((item, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start gap-2 text-sm font-medium"
                                        >
                                            <X className="w-4 h-4 text-red-500/50 flex-shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    <div className="flex justify-end">
                        <Button
                            variant={'secondary'}
                            className="bg-red-500 hover:bg-red-600 text-white border-none shadow-lg shadow-red-500/20"
                            icon={'trash-2'}
                            onClick={() => setShowDeleteConfirmation(true)}
                        >
                            Delete Account
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Delete Confirmation Modal */}
            <DialogBox
                isOpen={showDeleteConfirmation}
                variant={'dark'}
                maxWidth={'max-w-2xl'}
                title={' Update Profile'}
            >
                <div className="text-center mb-6">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-block p-4 bg-red-500/10 rounded-full mb-4 border border-red-500/20"
                    >
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </motion.div>
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Delete Account?</h3>
                    <p className="text-red-500 font-bold uppercase text-[10px] tracking-[0.2em]">This action is irreversible</p>
                </div>

                <div className="mb-8">
                    <p className="text-gray-400 text-center mb-6 font-medium leading-relaxed">
                        Are you absolutely sure you want to permanently delete your account? All your personal data, messages, and connections will be lost forever.
                    </p>

                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="p-5 bg-white/[0.02] rounded-3xl border border-white/5 shadow-inner"
                    >
                        <p className="text-[10px] uppercase tracking-widest font-black text-red-500/80 mb-3 flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Type "DELETE" to confirm
                        </p>
                        <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="Enter confirmation text"
                            className="w-full px-4 py-3 text-center text-lg font-black bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-red-500/50 text-white placeholder-gray-600 transition-all uppercase"
                        />
                    </motion.div>
                </div>

                <div className="flex gap-4">
                    <Button
                        onClick={() => {
                            setShowDeleteConfirmation(false);
                            setDeleteConfirmText('');
                        }}
                        variant={'ghost'}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-2xl h-12 font-bold"
                    >
                        Cancel
                    </Button>

                    <Button
                        variant={deleteConfirmText === 'DELETE' ? 'secondary' : 'ghost'}
                        onClick={handleAccountDeletion}
                        disabled={deleteConfirmText !== 'DELETE'}
                        className={`flex-1 rounded-2xl h-12 font-black transition-all ${deleteConfirmText === 'DELETE'
                            ? 'bg-red-500 hover:bg-red-600 text-white border-none shadow-lg shadow-red-500/20'
                            : 'bg-white/5 text-gray-600 cursor-not-allowed border-none'
                            }`}
                    >
                        {deleteConfirmText === 'DELETE' ? (
                            <div className="flex items-center gap-2 uppercase tracking-tight">
                                <Trash2 className="w-4 h-4" />
                                Confirm Deletion
                            </div>
                        ) : (
                            <span className="text-[10px] uppercase tracking-widest whitespace-nowrap">Awaiting Confirmation</span>
                        )}
                    </Button>
                </div>
            </DialogBox>
        </motion.div>
    );
};

export default SecurityTab;
