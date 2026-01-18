import Tabs from '../../../Components/ui/Tabs';

import PersonalTab from './Tabs/Personal';
import SecurityTab from './Tabs/Security';
import AccountTab from './Tabs/Account';
import AppSettingTab from './Tabs/AppSetting';
import Button from '../../../Components/ui/Button';
import { useNavigate } from 'react-router-dom';
import AnimatedBg from '../../../Components/ui/AnimatedBg';
import FloatingParticles from '../../../Components/ui/FloatingParticles';

const Index = () => {
    const navigate = useNavigate();

    const tabItems = [
        { label: 'Personal Info', content: <PersonalTab />, icon: 'user' },
        { label: 'Account Settings', content: <AccountTab />, icon: 'settings' },
        { label: 'Security', content: <SecurityTab />, icon: 'shield' },
        { label: 'App Settings', content: <AppSettingTab />, icon: 'settings-2' },
    ];

    return (
        <div className="relative min-h-screen w-full bg-[#0a0a0f] text-white overflow-x-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 z-0">
                <AnimatedBg />
                <FloatingParticles />
            </div>

            <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <Button
                            onClick={() => navigate('/user/dashboard')}
                            variant={'ghost'}
                            className="bg-white/5 hover:bg-white/10 text-white border-white/5 transition-all duration-300"
                            icon={'move-left'}
                        />
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tighter">
                                Account<span className="text-indigo-500">Settings</span>
                            </h1>
                            <p className="text-sm text-gray-500 font-medium mt-1">
                                Manage your personal information, security, and preferences
                            </p>
                        </div>
                    </div>
                </div>

                {/* Settings Card */}
                <div className="rounded-[2rem] bg-[#0B0C10]/60 backdrop-blur-2xl border border-white/5 shadow-2xl overflow-hidden">
                    <div className="p-2 md:p-4">
                        <Tabs orientation="vertical" variant="premium" tabs={tabItems} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;
