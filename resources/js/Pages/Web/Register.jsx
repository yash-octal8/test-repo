import { useState } from "react";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { useNavigate } from 'react-router-dom';
import AnimateBg from '../../Components/ui/animate-bg';

export default function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });

    const navigate =  useNavigate();
    
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        console.log("Register Submitted", form);
    };

    const handleLogin = () => navigate('/login');
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <AnimateBg/>
            <Card className="w-full max-w-md shadow-xl z-10 !border-gray-600">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">Create an Account</CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className='flex flex-col gap-3'>
                            <label className="text-sm font-medium block">Full Name</label>
                            <Input
                                name="name"
                                type="text"
                                placeholder="Enter your full name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className='flex flex-col gap-3'>
                            <label className="text-sm font-medium block">Email</label>
                            <Input
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className='flex flex-col gap-3'>
                            <label className="text-sm font-medium block">Password</label>
                            <Input
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full text-base py-2">Register</Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account? <button 
                        onClick={handleLogin} className="text-primary cursor-pointer underline">Login</button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
