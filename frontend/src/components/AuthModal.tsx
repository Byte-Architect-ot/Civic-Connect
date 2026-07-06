import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Shield, User as UserIcon, Lock, Mail, Phone, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import { User, UserRole } from '../types';
import { apiRegister, apiLogin } from '../api';
import { useTranslation } from 'react-i18next';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'signin' | 'signup';
  onLogin: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode, onLogin }) => {
  const { t } = useTranslation();
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

  const mapRoleToBackend = (r: 'Citizen' | 'Staff'): 'user' | 'admin' => {
    return r === 'Staff' ? 'admin' : 'user';
  };

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

      const frontendUser: User = {
        id: backendUser.id || backendUser._id,
        name: backendUser.name,
        role: mapRoleToFrontend(backendUser.role),
        avatar: backendUser.avatar || `${import.meta.env.VITE_DICEBEAR_API_URL}?seed=${backendUser.name}`,
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
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="relative w-full max-w-md bg-white rounded-3xl sm:rounded-4xl shadow-soft-xl overflow-hidden max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 z-10"
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        <div className="p-5 sm:p-6">
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-soft-lg mx-auto mb-3">
              <Shield size={24} />
            </div>
            <h2 className="text-2xl font-display font-bold tracking-tight">
              {mode === 'signin' ? t('Welcome Back') : t('Create Account')}
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              {mode === 'signin' 
                ? t('Sign in to access your account')
                : t('Join the community and make a difference')}
            </p>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-full mb-5">
            <button
              type="button"
              onClick={() => setRole('Citizen')}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 min-h-[44px] rounded-full text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-slate-900 outline-none active:scale-[0.97] ${
                role === 'Citizen' 
                  ? 'bg-white text-slate-900 shadow-soft' 
                  : 'text-slate-500'
              }`}
            >
              <UserIcon size={14} />
              {t('Citizen')}
            </button>
            <button
              type="button"
              onClick={() => setRole('Staff')}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 min-h-[44px] rounded-full text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-slate-900 outline-none active:scale-[0.97] ${
                role === 'Staff' 
                  ? 'bg-white text-slate-900 shadow-soft' 
                  : 'text-slate-500'
              }`}
            >
              <Shield size={14} />
              {t('Authority')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide ml-1">
                  {t('Full Name')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    placeholder={t('Enter your full name')}
                    disabled={isLoading}
                    className={`w-full pl-10 pr-3 py-2.5 min-h-[44px] bg-slate-50 border-2 ${
                      errors.name ? 'border-rose-300 bg-rose-50' : 'border-transparent'
                    } focus:border-slate-900 rounded-xl outline-none transition-all text-sm`}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                {errors.name && (
                  <p className="text-rose-600 text-[10px] flex items-center gap-1 ml-1">
                    <AlertCircle size={10} />
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide ml-1">
                {t('Email Address')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  placeholder={t('name@example.com')}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-3 py-2.5 min-h-[44px] bg-slate-50 border-2 ${
                    errors.email ? 'border-rose-300 bg-rose-50' : 'border-transparent'
                  } focus:border-slate-900 rounded-xl outline-none transition-all text-sm`}
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {errors.email && (
                <p className="text-rose-600 text-[10px] flex items-center gap-1 ml-1">
                  <AlertCircle size={10} />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide ml-1">
                {t('Password')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  placeholder={t('Enter your password')}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-3 py-2.5 min-h-[44px] bg-slate-50 border-2 ${
                    errors.password ? 'border-rose-300 bg-rose-50' : 'border-transparent'
                  } focus:border-slate-900 rounded-xl outline-none transition-all text-sm`}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              {errors.password && (
                <p className="text-rose-600 text-[10px] flex items-center gap-1 ml-1">
                  <AlertCircle size={10} />
                  {errors.password}
                </p>
              )}
            </div>

            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide ml-1">
                  {t('Phone Number')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="tel"
                    placeholder={t('+91 98765 43210')}
                    disabled={isLoading}
                    className={`w-full pl-10 pr-3 py-2.5 min-h-[44px] bg-slate-50 border-2 ${
                      errors.phone ? 'border-rose-300 bg-rose-50' : 'border-transparent'
                    } focus:border-slate-900 rounded-xl outline-none transition-all text-sm`}
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                {errors.phone && (
                  <p className="text-rose-600 text-[10px] flex items-center gap-1 ml-1">
                    <AlertCircle size={10} />
                    {errors.phone}
                  </p>
                )}
              </div>
            )}

            {role === 'Staff' && (
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide ml-1">
                  {t('Admin Key')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="password"
                    required
                    placeholder={t('Enter admin key')}
                    disabled={isLoading}
                    className={`w-full pl-10 pr-3 py-2.5 min-h-[44px] bg-slate-50 border-2 ${
                      errors.referralKey ? 'border-rose-300 bg-rose-50' : 'border-transparent'
                    } focus:border-slate-900 rounded-xl outline-none transition-all text-sm`}
                    value={formData.referralKey}
                    onChange={e => setFormData({ ...formData, referralKey: e.target.value })}
                  />
                </div>
                {errors.referralKey ? (
                  <p className="text-rose-600 text-[10px] flex items-center gap-1 ml-1">
                    <AlertCircle size={10} />
                    {errors.referralKey}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 ml-1 mt-1">
                    {t('Authority admin key:')} <code className="px-1.5 py-0.5 bg-slate-100 rounded font-mono">CIVIC_ADMIN_2026</code>
                  </p>
                )}
              </div>
            )}

            {errors.general && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-50 border-2 border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2"
              >
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                {errors.general}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 min-h-[48px] bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 shadow-soft-lg transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-5"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('Processing...')}
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  {mode === 'signin' ? t('Sign In') : t('Create Account')}
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={switchMode}
              disabled={isLoading}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-all disabled:opacity-50 py-2 min-h-[44px] active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none rounded-lg px-2"
            >
              {mode === 'signin' 
                ? t("Don't have an account? Sign Up") 
                : t("Already have an account? Sign In")}
            </button>
          </div>

          <div className="mt-5 p-3 bg-slate-100 rounded-xl">
            <p className="text-[10px] font-semibold text-slate-700 mb-1 uppercase">Info</p>
            <div className="space-y-0.5 text-[10px] text-slate-600">
              <p>{t('Register as Citizen to report issues')}</p>
              <p>{t('Register as Authority to manage issues')}</p>
              <p>{t('Authority admin key:')} <code className="px-1 py-0.5 bg-white rounded font-mono">CIVIC_ADMIN_2026</code></p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};