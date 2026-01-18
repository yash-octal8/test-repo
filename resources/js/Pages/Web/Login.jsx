import React, { useState, useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue, animate } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight, Chrome, Facebook, SparklesIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import listenApi from '../../Utils/Api';
import { useDispatch } from 'react-redux';
import { __listenSetUser } from '../../Store/AuthSlice';


const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const _dispatch = useDispatch();

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Initialize in center
    useEffect(() => {
        if (typeof window !== 'undefined') {
            mouseX.set(window.innerWidth / 2);
            mouseY.set(window.innerHeight / 2);
        }
    }, []);

    const handleMouseMove = ({ clientX, clientY, currentTarget }) => {
        let { left, top } = currentTarget.getBoundingClientRect();
        let xPosition = clientX - left;
        let yPosition = clientY - top;

        mouseX.set(xPosition);
        mouseY.set(yPosition);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await listenApi.post('login', {
                email,
                password,
            }).then(response => {
                const data = response?.data;
                console.error(data);
                const payload = {
                    token: data?.token,
                    user: data?.user,
                };
                _dispatch(__listenSetUser(payload));
            });
            navigate('/user/dashboard');
        } catch (err) {
            setError(err.response?.data?.message ||
                'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div
            className="min-h-screen bg-[#1F2128] flex items-center justify-center p-4 relative overflow-hidden group"
            onMouseMove={handleMouseMove}
        >
            {/* Interactive Glow Effect using Motion Template */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                          650px circle at ${mouseX}px ${mouseY}px,
                          rgba(129, 140, 248, 0.15),
                          transparent 80%
                        )
                      `,
                }}
            />
            {/* Static Background Glows (keep existing as fallback/base) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-[#2A2B36]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                        <LogIn className="text-white w-8 h-8" />
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-3xl font-bold bg-gradient-to-r from-purple-400 
                    to-pink-400 bg-clip-text text-transparent"
                    >
                        <SparklesIcon className="inline-block w-6 h-6 mr-2" />
                        TalkerGuys
                    </motion.div>
                    <p className="text-gray-400 text-sm">Continue to chatting</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#1F2128] border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-600"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#1F2128] border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-600"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center text-gray-400 cursor-pointer hover:text-gray-300">
                            <input type="checkbox" className="form-checkbox bg-[#1F2128] border-gray-700 rounded text-indigo-500 focus:ring-offset-0 focus:ring-0 mr-2" />
                            Remember me
                        </label>
                        <a href="#" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Forgot Password?</a>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Start in...' : 'Star Chat.'}
                        {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="my-8 flex items-center gap-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent flex-1" />
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
