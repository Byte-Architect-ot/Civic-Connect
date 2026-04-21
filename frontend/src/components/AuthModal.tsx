import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, User as UserIcon, Lock, Mail, Phone, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import { User, UserRole } from '../types';
import { apiRegister, apiLogin } from '../api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'signin' | 'signup';
  onLogin: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode, onLogin }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [role, setRole] = useState<'Citizen' | 'Staff'>('Citizen');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    referralKey: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password || formData.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    if (mode === 'signup' && formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (mode === 'signup' && formData.phone && !/^[+]?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (role === 'Staff' && !formData.referralKey) {
      newErrors.referralKey = 'Admin key is required for authority signup/login';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Map frontend role to backend role
  const mapRoleToBackend = (r: 'Citizen' | 'Staff'): 'user' | 'admin' => {
    return r === 'Staff' ? 'admin' : 'user';
  };

  // Map backend role to frontend role
  const mapRoleToFrontend = (r: string): UserRole => {
    return r === 'admin' ? 'Staff' : 'Citizen';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      let backendUser: any;

      if (mode === 'signup') {
        backendUser = await apiRegister({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: mapRoleToBackend(role),
          adminKey: role === 'Staff' ? formData.referralKey : undefined,
          phone: formData.phone || undefined
        });
      } else {
        backendUser = await apiLogin(formData.email, formData.password);
      }

      // Transform to frontend User type
      const frontendUser: User = {
        id: backendUser.id || backendUser._id,
        name: backendUser.name,
        role: mapRoleToFrontend(backendUser.role),
        avatar: backendUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${backendUser.name}`,
        email: backendUser.email,
        phone: backendUser.phone || undefined,
        address: backendUser.address || undefined,
        joinedAt: backendUser.joinedAt || backendUser.createdAt || new Date().toISOString(),
        reportsCount: 0,
        resolvedCount: 0
      };

      onLogin(frontendUser);
      handleClose();
    } catch (error: any) {
      setErrors({ general: error.message || 'Authentication failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', phone: '', referralKey: '', password: '' });
    setErrors({});
    setIsLoading(false);
    onClose();
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setErrors({});
    setFormData({ name: '', email: '', phone: '', referralKey: '', password: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 z-10"
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100 mx-auto mb-4">
              <Shield size={32} />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-2">
              {mode === 'signin' 
                ? 'Sign in to access your NagrikSetu account' 
                : 'Join the community and make a difference'}
            </p>
          </div>

          {/* Role Selection */}
          <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => setRole('Citizen')}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                role === 'Citizen' 
                  ? 'bg-white text-blue-600 shadow-md' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserIcon size={16} />
              Citizen
            </button>
            <button
              type="button"
              onClick={() => setRole('Staff')}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                role === 'Staff' 
                  ? 'bg-white text-blue-600 shadow-md' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Shield size={16} />
              Authority
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Signup Only) */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    disabled={isLoading}
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border-2 ${
                      errors.name ? 'border-rose-300 bg-rose-50' : 'border-transparent'
                    } focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-sm`}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                {errors.name && (
                  <p className="text-rose-600 text-xs font-medium flex items-center gap-1 ml-1">
                    <AlertCircle size={12} />
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  disabled={isLoading}
                  className={`w-full pl-12 pr-4 py-3 bg-slate-50 border-2 ${
                    errors.email ? 'border-rose-300 bg-rose-50' : 'border-transparent'
                  } focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-sm`}
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {errors.email && (
                <p className="text-rose-600 text-xs font-medium flex items-center gap-1 ml-1">
                  <AlertCircle size={12} />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className={`w-full pl-12 pr-4 py-3 bg-slate-50 border-2 ${
                    errors.password ? 'border-rose-300 bg-rose-50' : 'border-transparent'
                  } focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-sm`}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              {errors.password && (
                <p className="text-rose-600 text-xs font-medium flex items-center gap-1 ml-1">
                  <AlertCircle size={12} />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Phone Field (Signup Only) */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    disabled={isLoading}
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border-2 ${
                      errors.phone ? 'border-rose-300 bg-rose-50' : 'border-transparent'
                    } focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-sm`}
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                {errors.phone && (
                  <p className="text-rose-600 text-xs font-medium flex items-center gap-1 ml-1">
                    <AlertCircle size={12} />
                    {errors.phone}
                  </p>
                )}
              </div>
            )}

            {/* Admin Key (Staff Only) */}
            {role === 'Staff' && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  Admin Key <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="Enter admin key"
                    disabled={isLoading}
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border-2 ${
                      errors.referralKey ? 'border-rose-300 bg-rose-50' : 'border-transparent'
                    } focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-sm`}
                    value={formData.referralKey}
                    onChange={e => setFormData({ ...formData, referralKey: e.target.value })}
                  />
                </div>
                {errors.referralKey ? (
                  <p className="text-rose-600 text-xs font-medium flex items-center gap-1 ml-1">
                    <AlertCircle size={12} />
                    {errors.referralKey}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 font-medium ml-1">
                    Admin key: <code className="px-2 py-0.5 bg-slate-100 rounded font-mono">CIVIC_ADMIN_2026</code>
                  </p>
                )}
              </div>
            )}

            {/* General Error */}
            {errors.general && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-50 border-2 border-rose-200 rounded-xl text-rose-700 text-sm font-medium flex items-start gap-3"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                {errors.general}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          {/* Switch Mode */}
          <div className="mt-8 text-center">
            <button
              onClick={switchMode}
              disabled={isLoading}
              className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-50"
            >
              {mode === 'signin' 
                ? "Don't have an account? Sign Up" 
                : "Already have an account? Sign In"}
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
            <p className="text-xs font-bold text-blue-900 mb-2">ℹ️ Info</p>
            <div className="space-y-1 text-xs text-blue-700 font-medium">
              <p>Register as <strong>Citizen</strong> to report issues</p>
              <p>Register as <strong>Authority</strong> to manage issues</p>
              <p>Authority admin key: <code className="px-1 py-0.5 bg-blue-100 rounded font-mono">CIVIC_ADMIN_2026</code></p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};