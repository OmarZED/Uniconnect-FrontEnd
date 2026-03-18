
import React, { useState } from 'react';
import { LoginDto } from '../types';
import { LogIn, BookOpen } from 'lucide-react';

interface LoginProps {
  onLogin: (data: LoginDto) => void;
  onRegisterClick: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onRegisterClick }) => {
  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(formData);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-100">
        <div className="bg-red-900 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-xl backdrop-blur-sm mb-4 text-white">
            <BookOpen size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-red-100 mt-2">Sign in to UniConnect</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-red-900 focus:border-red-900 outline-none transition-all"
              placeholder="jane.doe@university.edu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-red-900 focus:border-red-900 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 text-red-900 border-gray-300 rounded focus:ring-red-900"
              />
              Remember me
            </label>
            <a href="#" className="text-sm text-red-900 hover:text-red-800 font-medium">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-red-900 hover:bg-red-800 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <LogIn size={20} />
            Sign In
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-stone-500">
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={onRegisterClick} 
                className="text-red-900 hover:text-red-800 font-medium"
              >
                Create Profile
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
