import { motion } from 'framer-motion';
import Button from '../../../../Components/ui/Button';
import React from 'react';

const AccountTab = () => {
    const mainClassOfCard = `p-4 md:p-8`;

    return (
        <>
            <motion.div
                variants={{
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
                }}
                className={mainClassOfCard}>
                <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/5 rounded-[2rem] backdrop-blur-xl">
                    <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
                        <Button variant={'ghost'} className="text-indigo-400" icon={'lock'} />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Account Protection</h2>
                    <p className="text-gray-500 text-sm mb-8 text-center max-w-xs">
                        Your account is currently protected. You can unlock advanced features here.
                    </p>
                    <Button variant={'secondary'} className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-600/20" icon={'lock'}>
                        Unlock Account
                    </Button>
                </div>

            </motion.div>
        </>
    )
};
export default AccountTab;
