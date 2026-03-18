
import React, { useState } from 'react';
import { RegisterDto, UserRole } from '../types';
import { UserPlus, BookOpen, ChevronRight } from 'lucide-react';

interface RegisterProps {
  onRegister: (data: RegisterDto) => void;
  onLoginClick: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegister, onLoginClick }) => {
  const [formData, setFormData] = useState<RegisterDto>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: UserRole.STUDENT
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'role' ? parseInt(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(formData);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-100">
        <div className="bg-red-900 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900 to-red-950 opacity-90"></div>
          <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-xl backdrop-blur-sm mb-4 text-white shadow-lg shadow-red-900/20">
                <BookOpen size={32} />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Join UniConnect</h1>
              <p className="text-red-100 mt-2 font-medium">Start your academic journey today</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 focus:border-red-900 focus:ring-0 outline-none transition-all font-bold text-stone-700 bg-stone-50 focus:bg-white"
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 focus:border-red-900 focus:ring-0 outline-none transition-all font-bold text-stone-700 bg-stone-50 focus:bg-white"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 focus:border-red-900 focus:ring-0 outline-none transition-all font-bold text-stone-700 bg-stone-50 focus:bg-white"
              placeholder="jane.doe@university.edu"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 focus:border-red-900 focus:ring-0 outline-none transition-all font-bold text-stone-700 bg-stone-50 focus:bg-white"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Role</label>
            <div className="relative">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-100 focus:border-red-900 focus:ring-0 outline-none transition-all appearance-none bg-stone-50 focus:bg-white font-bold text-stone-700"
              >
                <option value={UserRole.STUDENT}>Student</option>
                <option value={UserRole.TEACHER}>Teacher</option>
                <option value={UserRole.DEPARTMENT_MANAGER}>Department Manager</option>
                <option value={UserRole.DEAN}>Dean</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-stone-400">
                <ChevronRight className="rotate-90" size={18} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-900 hover:bg-red-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-200 hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 mt-6"
          >
            <UserPlus size={20} />
            Create Account
          </button>

          <div className="text-center mt-4">
            <button type="button" onClick={onLoginClick} className="text-sm text-red-900 hover:text-red-800 font-bold">
              Already have an account? Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
