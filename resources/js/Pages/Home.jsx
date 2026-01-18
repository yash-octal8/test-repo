import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, animate } from "framer-motion";
import {
    Video,
    UserPlus2,
    SparklesIcon,
    MessageSquare,
    Globe,
    Users,
    Zap,
    Heart,
    Shield,
    Mic,
    Camera,
    Star,
    MessageCircle,
    ArrowRight,
    ChevronRight,
    Play,
    Rocket
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimatedBg from '../Components/ui/AnimatedBg';
import FloatingParticles from '../Components/ui/FloatingParticles';
import Header from '../Layouts/Header';
import listenApi from '../Utils/Api';
import { useSelector, useDispatch } from 'react-redux';
import { __listenSetUser } from '../Store/AuthSlice';

const Home = () => {
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    const containerRef = useRef(null);
    const heroRef = useRef(null);
    const isInView = useInView(heroRef, { once: true });
    const user = useSelector(state => state.auth?.user);
    const isAuthenticated = useSelector(state => state.auth?.isAuthenticated);
    const _dispatch = useDispatch();

    // Parallax effects
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

    // Spring animation for smoothness
    const springY = useSpring(y, { stiffness: 100, damping: 30 });

    // Floating animation for particles
    const floatingVariants = {
        float: {
            y: ["0%", "-30%", "0%"],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    // Glitch text animation
    const glitchVariants = {
        initial: { opacity: 1 },
        animate: {
            opacity: [1, 0.9, 1],
            x: [0, -2, 2, -2, 2, 0],
            transition: {
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 3
            }
        }
    };

    // Handle text chat
    const handleTextChat = () => {
        if (isAuthenticated) {
            navigate('/user/dashboard');
            return;
        }

        listenApi.post('guest-login', { guest_uid: user?.guest_uid }).
            then(response => {
                const data = response?.data;
                const payload = {
                    token: data?.token,
                    user: data?.user,
                };
                _dispatch(__listenSetUser(payload));

                navigate('/user/dashboard');
            });
    };

    // Animated counter for stats
    const Counter = ({ end, duration = 2 }) => {
        const [count, setCount] = useState(0);
        const ref = useRef(null);
        const isInView = useInView(ref, { once: true });

        useEffect(() => {
            if (isInView) {
                animate(0, end, {
                    duration,
                    onUpdate: (value) => setCount(Math.floor(value))
                });
            }
        }, [isInView, end, duration]);

        return <span ref={ref}>{count.toLocaleString()}+</span>;
    };

    return (
        <div className="bg-[#0a0a0f] text-white min-h-screen overflow-hidden">
            {/* Animated Background Gradient */}
            <AnimatedBg />

            {/* Floating Particles */}
            <FloatingParticles />
            {/* --------------------- NAVBAR --------------------- */}
            <Header />

            {/* --------------------- HERO SECTION --------------------- */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6 md:px-20 pt-32">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    {/* Animated Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8 }}
                        className="mb-8"
                    >
                        <motion.div
                            variants={glitchVariants}
                            initial="initial"
                            animate="animate"
                            className="inline-block"
                        >
                            <SparklesIcon className="inline-block w-8 h-8 mr-3 text-purple-400" />
                        </motion.div>
                        <span className="px-4 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300">
                            Meet Random People
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 50 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
                    >
                        <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                            Connect
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                            With Random People
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 50 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto"
                    >
                        Meet interesting strangers, share photos and videos with privacy and connections through anonymous text and video chats.
                    </motion.p>

                    {/* Animated Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="grid grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto"
                    >
                        {[
                            { value: <Counter end={50000} />, label: 'Active Users', icon: Users },
                            { value: <Counter end={1000000} />, label: 'Connections Made', icon: Heart },
                            { value: <Counter end={150} />, label: 'Countries', icon: Globe },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all"
                            >
                                <stat.icon className="w-10 h-10 text-purple-400 mx-auto mb-4" />
                                <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                    {stat.value}
                                </div>
                                <div className="text-gray-400 mt-2">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                    >
                        <motion.button
                            onClick={() => handleTextChat()}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group px-8 py-4 cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-xl shadow-purple-500/25 flex items-center gap-3 hover:shadow-purple-500/40 transition-all"
                        >
                            <MessageSquare className="w-6 h-6" />
                            <span className="text-lg font-semibold">Start Text Chat</span>
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full hover:bg-white/20 transition-all flex items-center gap-3"
                        >
                            <Video className="w-6 h-6" />
                            <span className="text-lg font-semibold">Video Chat</span>
                            <Play className="w-5 h-5" />
                        </motion.button>
                    </motion.div>

                    {/* Floating Chat Bubbles */}
                    <div className="absolute top-1/6 left-10 z-0">
                        <motion.div
                            variants={floatingVariants}
                            animate="float"
                            className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl backdrop-blur-sm border border-purple-500/30 p-4"
                        >
                            <MessageCircle className="w-8 h-8 text-purple-400" />
                        </motion.div>
                    </div>
                    <div className="absolute bottom-1/4 right-10 z-0">
                        <motion.div
                            variants={floatingVariants}
                            animate="float"
                            transition={{ delay: 1 }}
                            className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl backdrop-blur-sm border border-blue-500/30 p-4"
                        >
                            <Users className="w-10 h-10 text-blue-400" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --------------------- FEATURES SECTION --------------------- */}
            <section className="py-32 px-6 md:px-20 relative">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Amazing Features
                            </span>
                            <br />
                            <span className="text-white">That Make You Love Us</span>
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Experience the future of social connections with our cutting-edge features
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Shield,
                                title: "Secure & Private",
                                desc: "End-to-end encryption and anonymous chatting",
                                gradient: "from-purple-500/20 to-pink-500/20",
                                color: "purple"
                            },
                            {
                                icon: Globe,
                                title: "Global Connections",
                                desc: "Meet people from 150+ countries worldwide",
                                gradient: "from-blue-500/20 to-cyan-500/20",
                                color: "blue"
                            },
                            {
                                icon: SparklesIcon,
                                title: "Smart Matching",
                                desc: "AI-powered matching based on interests",
                                gradient: "from-green-500/20 to-emerald-500/20",
                                color: "green"
                            },
                            {
                                icon: Camera,
                                title: "HD Video Chat",
                                desc: "Crystal clear video quality with filters",
                                gradient: "from-red-500/20 to-orange-500/20",
                                color: "red"
                            },
                            {
                                icon: Mic,
                                title: "Voice Messages",
                                desc: "Send voice notes in text chats",
                                gradient: "from-yellow-500/20 to-amber-500/20",
                                color: "yellow"
                            },
                            {
                                icon: Zap,
                                title: "Lightning Fast",
                                desc: "Instant connections with no delays",
                                gradient: "from-indigo-500/20 to-purple-500/20",
                                color: "indigo"
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className="group relative p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                                <div className="relative z-10">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}>
                                        <feature.icon className={`w-8 h-8 text-${feature.color}-400`} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-gray-300">{feature.desc}</p>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: "100%" }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className="h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent mt-6"
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --------------------- HOW IT WORKS --------------------- */}
            <section className="py-32 px-6 md:px-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                How It Works
                            </span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: "01", title: "Sign Up", desc: "Quick registration, no email needed", icon: UserPlus2 },
                            { step: "02", title: "Choose Mode", desc: "Pick text or video chat", icon: Video },
                            { step: "03", title: "Find Match", desc: "Connect with interesting people", icon: Users },
                            { step: "04", title: "Start Chatting", desc: "Share stories and make friends", icon: MessageSquare },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="relative group"
                            >
                                <div className="relative p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm border border-white/10">
                                    <div className="text-6xl font-bold text-white/10 mb-4">{item.step}</div>
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-6">
                                        <item.icon className="w-8 h-8 text-cyan-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                                    <p className="text-gray-300">{item.desc}</p>
                                </div>
                                {i < 3 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-cyan-500/50 to-blue-500/50" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --------------------- TESTIMONIALS --------------------- */}
            <section className="py-32 px-6 md:px-20 relative">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            What Our <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Users Say</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: "Alex Johnson", role: "Traveler", text: "Met amazing people from Japan and Brazil. Best app ever!", avatar: "AJ" },
                            { name: "Samantha Lee", role: "Student", text: "Made real friends during lockdown. This app saved my sanity!", avatar: "SL" },
                            { name: "Marcus Chen", role: "Developer", text: "As an introvert, this is the perfect way to socialize!", avatar: "MC" },
                        ].map((testimonial, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -10 }}
                                className="relative group p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm border border-white/10"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                                        <span className="text-xl font-bold">{testimonial.avatar}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold">{testimonial.name}</h4>
                                        <p className="text-purple-400">{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className="text-gray-300 italic">"{testimonial.text}"</p>
                                <div className="flex gap-1 mt-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --------------------- CTA SECTION --------------------- */}
            <section className="py-32 px-6 md:px-20 relative">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative rounded-4xl overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-pink-600/30 to-blue-600/30" />
                        <div className="relative z-10 p-12 md:p-20 text-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
                            />
                            <h2 className="text-4xl md:text-6xl font-bold mb-6">
                                Ready to <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Connect?</span>
                            </h2>
                            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                                Join thousands of people making meaningful connections every day
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleTextChat}
                                className="group px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all text-xl font-bold flex items-center gap-3 mx-auto"
                            >
                                <Rocket className="w-6 h-6 group-hover:rotate-45 transition-transform" />
                                Start Chatting Now
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                            </motion.button>
                            <p className="text-gray-400 mt-6">No registration required • Free forever • Instant start</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --------------------- FOOTER --------------------- */}
            <footer className="py-12 px-6 md:px-20 border-t border-white/10 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                                TalkerGuys
                            </div>
                            <p className="text-gray-400">Connecting strangers, creating friendships worldwide.</p>
                        </div>
                        {['Product', 'Company', 'Legal', 'Connect'].map((section, i) => (
                            <div key={i}>
                                <h4 className="text-lg font-bold mb-4">{section}</h4>
                                <ul className="space-y-2">
                                    {['Link 1', 'Link 2', 'Link 3', 'Link 4'].map((link, j) => (
                                        <li key={j}>
                                            <a href="#" className="text-gray-400 hover:text-white transition">
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-400">
                        © 2025 TalkerGuys. All rights reserved. Made with ❤️ for the world.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
