import React, { useState } from 'react';
import { Tag, Lock, Mail } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

const DEMO_EMAIL = "hire-me@anshumat.org";
const DEMO_PASS = "HireMe@2025!";

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === DEMO_EMAIL && password === DEMO_PASS) {
      onLogin();
    } else {
      setError('Wrong credentials. Check README.');
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASS);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
       <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border-t-8 border-slate-700">
          <div className="text-center mb-8">
             <div className="inline-flex p-3 bg-slate-100 rounded-full mb-3 border-2 border-slate-200">
                <Tag className="w-8 h-8 text-slate-700" />
             </div>
             <h1 className="text-2xl font-bold text-slate-800">Login System</h1>
             <p className="text-slate-500 text-sm mt-1">Coupon Management Service API</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
             {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm text-center">
                   {error}
                </div>
             )}
             
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <div className="relative">
                   <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                   <input 
                     type="email" 
                     className="w-full border border-gray-300 pl-9 p-2 rounded focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all bg-white text-gray-900"
                     placeholder="Enter email..."
                     value={email}
                     onChange={e => setEmail(e.target.value)}
                   />
                </div>
             </div>
             
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <div className="relative">
                   <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                   <input 
                     type="password" 
                     className="w-full border border-gray-300 pl-9 p-2 rounded focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all bg-white text-gray-900"
                     placeholder="Enter password..."
                     value={password}
                     onChange={e => setPassword(e.target.value)}
                   />
                </div>
             </div>

             <button type="submit" className="w-full bg-slate-700 text-white py-2.5 rounded font-semibold hover:bg-slate-800 transition-colors shadow-sm mt-2">
                Login
             </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
             <button onClick={fillDemo} className="text-xs text-blue-600 hover:text-blue-800 hover:underline">
                [Dev Mode] Click to auto-fill credentials
             </button>
          </div>
       </div>
       <div className="mt-8 text-center text-gray-400 text-xs">
          <p>Assignment: Coupon Management</p>
          <p className="mt-1">Developed for Final Evaluation</p>
       </div>
    </div>
  );
}