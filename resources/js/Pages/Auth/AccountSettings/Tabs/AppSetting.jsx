import React, { useState } from 'react';
import {
    Smile,
    Image as ImageIcon,
    Bell,
    BellOff,
    Smartphone,
    Sun,
    Moon,
    Palette,
    Eye,
    EyeOff,
    Volume2,
    VolumeX,
    Globe,
    Info,
    AlertCircle,
    Check,
    Sparkles,
    Zap,
    Settings2
} from 'lucide-react';
import { Switch } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import Button from '../../../../Components/ui/Button';
import listenApi from '../../../../Utils/Api';
import { __listenUpdateUser } from '../../../../Store/AuthSlice';
import iziToast from 'izitoast';

const AppSettingTab = () => {
    const user = useSelector(state => state?.auth?.user);
    const _dispatch = useDispatch();

    const [preferences, setPreferences] = useState({
        autoEmojis: user?.extra_info?.convert_emoticons ?? true,
        blurImages: user?.extra_info?.blur_images ?? false,
        notificationSound: user?.extra_info?.notification_sound ?? true,
        pushNotifications: user?.extra_info?.push_notifications ?? true,
        darkMode: user?.extra_info?.dark_mode ?? false,
    });

    const [showResetModal, setShowResetModal] = useState(false);

    // Sync state if user data updates externally
    React.useEffect(() => {
        if (user?.extra_info) {
            setPreferences({
                autoEmojis: user.extra_info.convert_emoticons ?? true,
                blurImages: user.extra_info.blur_images ?? false,
                notificationSound: user.extra_info.notification_sound ?? true,
                pushNotifications: user.extra_info.push_notifications ?? true,
                darkMode: user.extra_info.dark_mode ?? false,
            });
        }
    }, [user?.extra_info]);

    const updatePreference = (key, value) => {
        // Map frontend keys to backend keys
        const backendKeyMap = {
            autoEmojis: 'convert_emoticons',
            blurImages: 'blur_images',
            notificationSound: 'notification_sound',
            pushNotifications: 'push_notifications',
            darkMode: 'dark_mode',
        };

        const backendKey = backendKeyMap[key];
        const payload = { [backendKey]: value };

        listenApi.post('update-profile', payload).then(res => {
            const updatedUser = res.data?.data?.user;
            _dispatch(__listenUpdateUser(updatedUser));
            iziToast.success({
                title: 'Updated',
                position: 'topRight',
                message: 'Preference updated successfully',
                timeout: 2000
            });
        }).catch(err => {
            iziToast.error({
                title: 'Error',
                position: 'topRight',
                message: 'Failed to update preference',
            });
        });
    };

    const handleToggle = (key) => {
        const newValue = !preferences[key];
        setPreferences(prev => ({
            ...prev,
            [key]: newValue
        }));
        updatePreference(key, newValue);
    };

    const handleResetPreferences = () => {
        const defaults = {
            autoEmojis: true,
            blurImages: false,
            notificationSound: true,
            pushNotifications: true,
            darkMode: false,
        };

        setPreferences(defaults);

        // Reset in backend
        const payload = {
            convert_emoticons: true,
            blur_images: false,
            notification_sound: true,
            push_notifications: true,
            dark_mode: false,
        };

        listenApi.post('update-profile', payload).then(res => {
            const updatedUser = res.data?.data?.user;
            _dispatch(__listenUpdateUser(updatedUser));
            iziToast.success({
                title: 'Reset',
                position: 'topRight',
                message: 'Preferences reset to defaults',
            });
        });

        setShowResetModal(false);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1
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

    const cardVariants = {
        hover: {
            scale: 1.02,
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            transition: { type: "spring", stiffness: 400, damping: 25 }
        },
        tap: { scale: 0.98 }
    };

    const mainClassOfCard = `p-4 md:p-8`;
    const basicCardClass = `bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/[0.08] transition-all duration-300 shadow-xl`;

    return (
        <div className={mainClassOfCard}>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="p-3 bg-white/5 border border-white/10 rounded-2xl"
                        >
                            <Settings2 className="w-8 h-8 text-indigo-500" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Preferences</h1>
                            <p className="text-gray-500 font-medium mt-1">Customize your experience and app behavior</p>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                    {/* Left Column */}
                    <div className="space-y-8">
                        {/* Emoticon to Emoji */}
                        <motion.div
                            variants={itemVariants}
                            whileHover="hover"
                            whileTap="tap"
                            // variants={cardVariants}
                            className={basicCardClass}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        animate={preferences.autoEmojis ? {
                                            scale: [1, 1.1, 1]
                                        } : {}}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="p-3 bg-white/5 border border-white/10 rounded-xl"
                                    >
                                        <Smile className={`w-6 h-6 ${preferences.autoEmojis ? 'text-indigo-400' : 'text-gray-500'}`} />
                                    </motion.div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Auto Convert Emoticons</h3>
                                        <p className="text-sm text-gray-500 font-medium font-medium">Convert :) to 😃 automatically</p>
                                    </div>
                                </div>

                                <motion.div whileTap={{ scale: 0.95 }}>
                                    <Switch
                                        checked={preferences.autoEmojis}
                                        onChange={() => handleToggle('autoEmojis')}
                                        className={`
                      relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                      ${preferences.autoEmojis ? 'bg-indigo-600' : 'bg-white/10'}
                    `}
                                    >
                                        <span className="sr-only">Auto convert emoticons</span>
                                        <motion.span
                                            layout
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            className={`
                        inline-block h-6 w-6 transform rounded-full bg-white shadow-lg
                        ${preferences.autoEmojis ? 'translate-x-7' : 'translate-x-0.5'}
                      `}
                                        />
                                    </Switch>
                                </motion.div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    className={`mt-4 p-4 rounded-2xl border ${preferences.autoEmojis
                                        ? 'bg-indigo-500/10 border-indigo-500/20'
                                        : 'bg-white/[0.02] border-white/5'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <Info className={`w-5 h-5 ${preferences.autoEmojis ? 'text-indigo-400' : 'text-gray-500'} flex-shrink-0 mt-0.5`} />
                                        <div>
                                            <p className={`text-sm font-medium ${preferences.autoEmojis ? 'text-indigo-300' : 'text-gray-500'}`}>
                                                {preferences.autoEmojis
                                                    ? "Emoticons are automatically converted to emojis. For example: :) → 😃, :D → 😁"
                                                    : "Using native emojis only. Type :smile: to insert emojis manually."
                                                }
                                            </p>
                                            <div className="flex items-center gap-4 mt-4">
                                                <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                                                    <span className="text-lg text-white font-medium">:)</span>
                                                </div>
                                                <motion.div
                                                    animate={{ rotate: preferences.autoEmojis ? 0 : 180 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <Zap className="w-4 h-4 text-indigo-500/50" />
                                                </motion.div>
                                                <div className={`px-3 py-1.5 rounded-lg ${preferences.autoEmojis ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-white/5 border border-white/5'}`}>
                                                    <span className="text-lg">{preferences.autoEmojis ? '😃' : ':)'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>

                        {/* Blur Images */}
                        <motion.div
                            variants={itemVariants}
                            whileHover="hover"
                            whileTap="tap"
                            // variants={cardVariants}
                            className={basicCardClass}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        animate={preferences.blurImages ? {
                                            scale: [1, 1.05, 1]
                                        } : {}}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="p-3 bg-white/5 border border-white/10 rounded-xl"
                                    >
                                        {preferences.blurImages ? (
                                            <EyeOff className="w-6 h-6 text-indigo-400" />
                                        ) : (
                                            <ImageIcon className="w-6 h-6 text-gray-400" />
                                        )}
                                    </motion.div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Blur Images</h3>
                                        <p className="text-sm text-gray-500 font-medium">Blur images from other users by default</p>
                                    </div>
                                </div>

                                <motion.div whileTap={{ scale: 0.95 }}>
                                    <Switch
                                        checked={preferences.blurImages}
                                        onChange={() => handleToggle('blurImages')}
                                        className={`
                      relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                      ${preferences.blurImages ? 'bg-indigo-600' : 'bg-white/10'}
                    `}
                                    >
                                        <span className="sr-only">Blur images</span>
                                        <motion.span
                                            layout
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            className={`
                        inline-block h-6 w-6 transform rounded-full bg-white shadow-lg
                        ${preferences.blurImages ? 'translate-x-7' : 'translate-x-0.5'}
                      `}
                                        />
                                    </Switch>
                                </motion.div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={preferences.blurImages ? 'blur-enabled' : 'blur-disabled'}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`mt-4 p-4 rounded-2xl border ${preferences.blurImages
                                        ? 'bg-indigo-500/10 border-indigo-500/20'
                                        : 'bg-white/[0.02] border-white/5'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <Eye className={`w-5 h-5 ${preferences.blurImages ? 'text-gray-100' : 'text-gray-300'} flex-shrink-0 mt-0.5`} />
                                        <div>
                                            <p className={`text-sm font-medium ${preferences.blurImages ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {preferences.blurImages
                                                    ? "Images are blurred by default. Click to reveal them for better privacy."
                                                    : "Images are displayed clearly by default."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>

                        {/* Push Notifications */}
                        <motion.div
                            variants={itemVariants}
                            whileHover="hover"
                            whileTap="tap"
                            // variants={cardVariants}
                            className={basicCardClass}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        animate={preferences.pushNotifications ? {
                                            scale: [1, 1.1, 1]
                                        } : {}}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="p-3 bg-white/5 border border-white/10 rounded-xl"
                                    >
                                        <Smartphone className={`w-6 h-6 ${preferences.pushNotifications ? 'text-indigo-400' : 'text-gray-500'}`} />
                                    </motion.div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Push Notifications</h3>
                                        <p className="text-sm text-gray-500 font-medium">Receive site notifications</p>
                                    </div>
                                </div>

                                <motion.div whileTap={{ scale: 0.95 }}>
                                    <Switch
                                        checked={preferences.pushNotifications}
                                        onChange={() => handleToggle('pushNotifications')}
                                        className={`
                      relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                      ${preferences.pushNotifications ? 'bg-indigo-600' : 'bg-white/10'}
                    `}
                                    >
                                        <span className="sr-only">Push notifications</span>
                                        <motion.span
                                            layout
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            className={`
                        inline-block h-6 w-6 transform rounded-full bg-white shadow-lg
                        ${preferences.pushNotifications ? 'translate-x-7' : 'translate-x-0.5'}
                      `}
                                        />
                                    </Switch>
                                </motion.div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={preferences.pushNotifications ? 'push-enabled' : 'push-disabled'}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`mt-4 p-4 rounded-2xl border ${preferences.pushNotifications ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white/[0.02] border-white/5'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className={`w-5 h-5 text-gray-100 flex-shrink-0 mt-0.5`} />
                                        <div>
                                            <p className={`text-sm font-medium text-gray-100`}>
                                                {preferences.pushNotifications
                                                    ? "Push notifications are enabled. Make sure they're allowed in your browser settings."
                                                    : "Push notifications are disabled. You'll only see notifications within the app."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Notification Sound */}
                        <motion.div
                            variants={itemVariants}
                            whileHover="hover"
                            whileTap="tap"
                            // variants={cardVariants}
                            className={basicCardClass}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        animate={preferences.notificationSound ? {
                                            scale: [1, 1.1, 1]
                                        } : {}}
                                        transition={{ duration: 0.5, repeat: Infinity }}
                                        className="p-3 bg-white/5 border border-white/10 rounded-xl"
                                    >
                                        {preferences.notificationSound ? (
                                            <Volume2 className="w-6 h-6 text-indigo-400" />
                                        ) : (
                                            <VolumeX className="w-6 h-6 text-gray-500" />
                                        )}
                                    </motion.div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Notification Sound</h3>
                                        <p className="text-sm text-gray-500 font-medium font-medium">Sound for new messages</p>
                                    </div>
                                </div>

                                <motion.div whileTap={{ scale: 0.95 }}>
                                    <Switch
                                        checked={preferences.notificationSound}
                                        onChange={() => handleToggle('notificationSound')}
                                        className={`
                      relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                      ${preferences.notificationSound ? 'bg-indigo-600' : 'bg-white/10'}
                    `}
                                    >
                                        <span className="sr-only">Notification sound</span>
                                        <motion.span
                                            layout
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            className={`
                        inline-block h-6 w-6 transform rounded-full bg-white shadow-lg
                        ${preferences.notificationSound ? 'translate-x-7' : 'translate-x-0.5'}
                      `}
                                        />
                                    </Switch>
                                </motion.div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={preferences.notificationSound ? 'sound-enabled' : 'sound-disabled'}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`mt-4 p-4 rounded-2xl border ${preferences.notificationSound ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-red-500/5 border-red-500/20'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        {preferences.notificationSound ? (
                                            <Volume2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <VolumeX className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div>
                                            <p className={`text-sm font-medium ${preferences.notificationSound ? 'text-indigo-300' : 'text-red-400'}`}>
                                                {preferences.notificationSound
                                                    ? "Notification sounds are enabled. You'll hear a sound when receiving new messages."
                                                    : "Notification sounds are disabled. You'll only see visual notifications."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>

                        {/* Dark Mode */}
                        <motion.div
                            variants={itemVariants}
                            whileHover="hover"
                            whileTap="tap"
                            // variants={cardVariants}
                            className={basicCardClass}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="p-3 bg-white/5 border border-white/10 rounded-xl"
                                    >
                                        {preferences.darkMode ? (
                                            <Moon className="w-6 h-6 text-indigo-400" />
                                        ) : (
                                            <Sun className="w-6 h-6 text-yellow-500" />
                                        )}
                                    </motion.div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Dark Mode</h3>
                                        <p className="text-sm text-gray-500 font-medium">Toggle between light and dark themes</p>
                                    </div>
                                </div>

                                <motion.div whileTap={{ scale: 0.95 }}>
                                    <Switch
                                        checked={preferences.darkMode}
                                        onChange={() => handleToggle('darkMode')}
                                        className={`
                      relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                      ${preferences.darkMode ? 'bg-indigo-600' : 'bg-white/10'}
                    `}
                                    >
                                        <span className="sr-only">Dark mode</span>
                                        <motion.span
                                            layout
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            className={`
                        inline-block h-6 w-6 transform rounded-full bg-white shadow-lg
                        ${preferences.darkMode ? 'translate-x-7' : 'translate-x-0.5'}
                      `}
                                        />
                                    </Switch>
                                </motion.div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={preferences.darkMode ? 'dark-enabled' : 'light-enabled'}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`mt-4 p-4 rounded-2xl border 
                                    ${preferences.darkMode
                                            ? 'bg-indigo-500/10 border-indigo-500/20'
                                            : 'bg-white/[0.02] border-white/5'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <AlertCircle
                                            className={`w-5 h-5 ${preferences.darkMode ?
                                                'text-gray-400' : 'text-gray-200'}
                                                 flex-shrink-0 mt-0.5`} />
                                        <div>
                                            <p className={`text-sm font-medium ${preferences.darkMode ? 'text-gray-200' : 'text-gray-200'}`}>
                                                {preferences.darkMode
                                                    ? "Dark mode is enabled. Easier on the eyes in low-light conditions."
                                                    : "Light mode is enabled. Some features might be experimental in this mode."
                                                }
                                            </p>
                                            {!preferences.darkMode && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="mt-2 inline-flex items-center gap-1 px-2 py-1
                                                     bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded-full"
                                                >
                                                    <Sparkles className="w-3 h-3" />
                                                    <span>Experimental</span>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>

                        {/* Preview Card */}
                        <motion.div
                            variants={itemVariants}
                            className={basicCardClass}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                                    <Palette className="w-6 h-6 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Preview</h3>
                                    <p className="text-sm text-gray-500 font-medium font-medium">See your preferences in action</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className={`p-4 rounded-2xl border
                                ${preferences.darkMode ? 'bg-[#0B0C10] border-white/5 text-gray-300' : 'bg-white border-gray-100 text-gray-800'} shadow-xl`}>
                                    <p className="text-sm">
                                        {preferences.autoEmojis
                                            ? "Hello there! 😊 How are you doing today? 🚀"
                                            : "Hello there! :) How are you doing today? :rocket:"}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className={`w-16 h-16 rounded-lg overflow-hidden ${preferences.blurImages ? 'blur-md' : ''} bg-gradient-to-br from-gray-200 to-gray-400`} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-100">Profile Image</p>
                                        <p className="text-xs text-gray-200">
                                            {preferences.blurImages ? 'Blurred - Click to view' : 'Visible'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Reset Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5"
                >
                    <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-indigo-500/50" />
                        <p className="text-xs text-gray-500 font-medium">Changes are saved automatically to your profile</p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowResetModal(true)}
                        className="px-6 py-3 text-white font-bold text-xs uppercase tracking-widest rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex items-center gap-3"
                    >
                        <Settings2 size={14} />
                        Reset to Defaults
                    </motion.button>
                </motion.div>

                {/* Reset Confirmation Modal */}
                <AnimatePresence>
                    {showResetModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setShowResetModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                transition={{ type: "spring", damping: 25 }}
                                className="bg-[#0B0C10] border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl backdrop-blur-3xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="text-center mb-6">
                                    <div className="inline-block p-4 bg-red-500/10 rounded-full mb-4 border border-red-500/20">
                                        <AlertCircle className="w-12 h-12 text-red-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Reset Preferences?</h3>
                                    <p className="text-gray-500 font-medium">All your customized settings will be returned to their default state.</p>
                                </div>

                                <div className="space-y-3 mb-8">
                                    {Object.entries(preferences).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5">
                                            <span className="text-xs font-bold text-gray-400 capitalize flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${value ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-gray-600'}`} />
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${value ? 'text-indigo-400' : 'text-gray-600'}`}>
                                                {value ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        onClick={() => setShowResetModal(false)}
                                        variant={'ghost'}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-2xl h-12"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant={'secondary'}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none rounded-2xl h-12 shadow-lg shadow-red-500/20"
                                        onClick={handleResetPreferences}
                                    >
                                        Reset All
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
};

export default AppSettingTab;
