import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Menu, SparklesIcon, X } from 'lucide-react';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const isAuthenticated = useSelector(state => state.auth?.isAuthenticated);
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleRedirectDashboard = () => {
        if (isAuthenticated) {
            navigate('/user/dashboard');
            return;
        }

        navigate('/start-new');

    }

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="fixed w-full py-4 lg:py-6 px-6 md:px-10 flex justify-between
                 items-center z-50 backdrop-blur-md bg-black/30 border-b 
                 border-white/10"
            >
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 
                        to-pink-400 bg-clip-text text-transparent"
                    >
                        <SparklesIcon className="inline-block w-5 h-5 md:w-6 md:h-6 mr-2" />
                        TalkerGuys
                    </motion.div>
                </div>

                {/* Desktop Menu */}
                <ul className="hidden lg:flex gap-10">
                    {['Home', 'Features', 'Community', 'About', 'Support'].map((item, i) => (
                        <motion.li
                            key={item}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.1 }}
                            className="relative group"
                        >
                            <a href="#" className="text-gray-300 hover:text-white transition">
                                {item}
                            </a>
                            <motion.div
                                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"
                                layoutId="underline"
                            />
                        </motion.li>
                    ))}
                </ul>

                <motion.button
                    onClick={handleRedirectDashboard}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="hidden sm:flex px-6 py-2.5 rounded-full bg-gradient-to-r
                     from-purple-600 to-pink-600 hover:from-purple-700 
                     hover:to-pink-700 transition-all shadow-lg
                     cursor-pointer 
                     shadow-purple-500/25 items-center justify-center font-medium text-sm md:text-base"
                >
                    {isAuthenticated ? 'Dashboard' : 'Get Started'}
                    <ArrowRight className="inline-block ml-2 w-4 h-4" />
                </motion.button>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="fixed top-[70px] left-0 w-full bg-[#0a0a0f] border-b border-white/10 z-40 lg:hidden overflow-hidden"
                    >
                        <ul className="flex flex-col p-6 gap-4">
                            {['Home', 'Features', 'Community', 'About', 'Support'].map((item, i) => (
                                <motion.li
                                    key={item}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <a
                                        href="#"
                                        className="block text-gray-300 hover:text-white transition py-2 text-lg font-medium"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item}
                                    </a>
                                </motion.li>
                            ))}
                            <li className="pt-4 border-t border-white/10">
                                <button
                                    onClick={() => {
                                        handleRedirectDashboard();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full px-6 py-3 rounded-xl bg-gradient-to-r
                                     from-purple-600 to-pink-600 text-white font-bold
                                     flex items-center justify-center gap-2"
                                >
                                    {isAuthenticated ? 'Dashboard' : 'Get Started'}
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </li>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
export default Header;
