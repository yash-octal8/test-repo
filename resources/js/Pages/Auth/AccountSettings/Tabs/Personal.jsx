import React, { useState } from 'react';
import UserAvatar from '../../../../Components/UserAvatar';
import Button from '../../../../Components/ui/Button';
import { useSelector, useDispatch } from 'react-redux';
import listenApi from '../../../../Utils/Api';
import { __listenUpdateUser } from '../../../../Store/AuthSlice';
import moment from 'moment';
import RemoveAvatarModel from '../RemoveAvatarModel';
import UpdateProfileModel from '../UpdateProfileModel';
import iziToast from 'izitoast';

const PersonalTab = () => {
    // User profile state
    const user = useSelector(state => state?.auth?.user);
    const _dispatch = useDispatch();

    // UI state
    const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
    const [isOpenRemoveAvatarDialog, setIsOpenRemoveAvatarDialog] = useState(false);
    const [isBannerUpload, setIsBannerUpload] = useState(false);

    // Handle avatar upload
    const handleAvatarUpload = (event) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('profile_image', file);

        listenApi.post('update-profile', formData).then(res => {
            iziToast.success({
                title: 'Updated',
                position: 'topCenter',
                message: 'Successfully update profile image!',
            })
            const data = res.data?.data?.user;
            // data.profile_image = `${import.meta.env.VITE_APP_URL}/${data.profile_image}`;
            _dispatch(__listenUpdateUser(data));
        });
    };

    const handleCloseAvatarDialog = () => {
        setIsOpenRemoveAvatarDialog(false)
        setIsBannerUpload(false);
    }

    const handleRemoveAvatar = () => {
        listenApi.post('update-profile', {
            remove_profile: true
        }).then(res => {
            iziToast.success({
                title: 'Removed',
                position: 'topCenter',
                message: 'Successfully removed profile image!',
            })
            const data = res.data?.data?.user;
            _dispatch(__listenUpdateUser(data))
            setIsOpenRemoveAvatarDialog(false)
            setIsBannerUpload(false);
        });
    }

    const basicCardClass = `bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/[0.08] transition-all duration-300 shadow-xl`;
    const mainClassOfCard = `p-4 md:p-8`;

    return (
        <div className={mainClassOfCard}>
            <RemoveAvatarModel
                open={isOpenRemoveAvatarDialog}
                isBannerUpload={isBannerUpload}
                handleRemoveAvatar={handleRemoveAvatar}
                handleCloseAvatarDialog={handleCloseAvatarDialog}
            />
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Personal Info
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">
                        Manage your profile details and representation
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Avatar & Basic Info */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Avatar Card */}
                        <div className={basicCardClass}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">
                                    Profile Picture
                                </h2>
                            </div>

                            <div className="flex flex-col items-center">
                                <UserAvatar
                                    src={user?.profile_image}
                                    size={'2xl'}
                                    variant='rounded'
                                    className='!border-none'
                                />
                                <div className="mt-4 flex gap-2">
                                    <Button className={'!cursor-pointer relative'} variant="purple" icon="pencil">
                                        <input
                                            type="file"
                                            onChange={handleAvatarUpload}
                                            className="opacity-0
                                             !cursor-pointer
                                              absolute 
                                              top-0 h-full w-full"
                                        />
                                    </Button>
                                    <Button
                                        onClick={() => setIsOpenRemoveAvatarDialog(true)}
                                        variant={'secondary'}
                                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20"
                                        icon={'trash-2'}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Basic Info Card */}
                        <div className={basicCardClass}>
                            <h2 className="text-xl font-bold text-white mb-6">
                                Basic Information
                            </h2>
                            <div className="space-y-4">
                                {
                                    user?.email &&
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 px-1">Email</label>
                                        <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/5 group-hover:bg-white/10 transition-colors">
                                            <p className="text-sm font-medium text-gray-200">{user?.email}</p>
                                        </div>
                                    </div>
                                }
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 px-1">Gender</label>
                                    <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/5 group-hover:bg-white/10 transition-colors">
                                        <p className="text-sm font-medium text-gray-200">{user?.extra_info?.gender}</p>
                                    </div>
                                </div>
                                {
                                    user?.location &&
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 px-1">Location</label>
                                        <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/5 group-hover:bg-white/10 transition-colors">
                                            <p className="text-sm font-medium text-gray-200">{user?.location}</p>
                                        </div>
                                    </div>
                                }
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 px-1">Joining Date</label>
                                    <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/5 group-hover:bg-white/10 transition-colors">
                                        <p className="text-sm font-medium text-gray-200">{moment(user?.created_at).format('MMMM D, YYYY')}</p>
                                        <p className="text-xs text-indigo-500 font-bold mt-0.5">
                                            Joined {moment(user?.created_at).fromNow()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Banner & Username */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Username Card */}
                        <div className={basicCardClass}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">User Info</h2>
                                <Button
                                    variant={'secondary'}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-600/20"
                                    onClick={() => setIsUsernameModalOpen(true)}
                                    icon={'edit-2'}>
                                    Edit Profile
                                </Button>
                            </div>

                            <div className="flex items-center gap-4">
                                <UserAvatar
                                    src={user?.profile_image}
                                    variant='rounded'
                                    className='!border-none'
                                />
                                <div>
                                    <h3 className="text-2xl font-black text-white">{user?.name}</h3>
                                    <p className="text-gray-500 font-medium">This is your public display name</p>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                <p className="text-xs text-indigo-300 font-medium leading-relaxed">
                                    <span className="font-bold text-indigo-400">Note: </span>
                                    Changing your username will update your profile representation and might affect how others find you on the platform.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User profile Modal */}
                <UpdateProfileModel
                    open={isUsernameModalOpen}
                    user={{ ...user }}
                    setOpen={setIsUsernameModalOpen} />
            </div>
        </div>
    );
};

export default PersonalTab;
