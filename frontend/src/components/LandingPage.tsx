import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, MapPin, Users, ArrowRight, CheckCircle2, 
  TrendingUp, Award, Clock, BarChart3, Zap, Globe, Lock
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { User } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from 'react-i18next';

interface LandingPageProps {
  onLogin: (user: User) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200 px-4 md:px-8 h-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <Shield size={24} className="md:w-7 md:h-7" />
          </div>
          <span className="font-black text-xl md:text-2xl tracking-tighter text-slate-900">NagrikSetu</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <LanguageSelector />
          <button 
            onClick={() => openAuth('signin')}
            className="hidden sm:block px-4 py-2 md:px-6 md:py-2.5 text-xs md:text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            {t('Sign In')}
          </button>
          <button 
            onClick={() => openAuth('signup')}
            className="px-4 py-2 md:px-6 md:py-3 bg-slate-900 text-white rounded-xl text-xs md:text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            {t('Get Started')}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-5rem)]">
          {/* Left Content */}
          <div className="p-6 md:p-12 lg:p-24 flex flex-col justify-center space-y-6 md:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-3 py-1.5 md:px-4 md:py-2 bg-blue-50 text-blue-600 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full mb-4 md:mb-6 border border-blue-100"
              >
                {t('Empowering Citizens, Improving Cities')}
              </motion.span>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] md:leading-[0.9] tracking-tighter text-slate-900 mb-6 md:mb-8"
              >
                {t('Bridge the Gap.')} <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 inline-block mt-2">
                  {t('Build the Future.')}
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-base md:text-xl text-slate-600 font-medium max-w-lg leading-relaxed mb-8 md:mb-10"
              >
                {t('NagrikSetu is a powerful crowdsourced civic issue reporting platform that connects citizens directly with local authorities for faster resolution and transparent governance.')}
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-3 md:gap-4"
              >
                <button 
                  onClick={() => openAuth('signup')}
                  className="flex items-center justify-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-blue-600 text-white rounded-2xl font-bold text-base md:text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95 group"
                >
                  {t('Get Started Now')}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center justify-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold text-base md:text-lg hover:bg-slate-50 transition-all"
                >
                  {t('Learn More')}
                </button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-4 md:gap-8 pt-8 md:pt-12 border-t border-slate-200"
            >
              <StatItem label={t('Active Users')} value="10k+" icon={<Users size={20} className="w-4 h-4 md:w-5 md:h-5" />} />
              <StatItem label={t('Issues Resolved')} value="5k+" icon={<CheckCircle2 size={20} className="w-4 h-4 md:w-5 md:h-5" />} />
              <StatItem label={t('Cities')} value="12+" icon={<Globe size={20} className="w-4 h-4 md:w-5 md:h-5" />} />
            </motion.div>
          </div>

          {/* Right Visual Section */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden flex items-center justify-center p-6 md:p-12 lg:p-24 min-h-[400px]">
            {/* Decorative Grid */}
            <div className="absolute inset-0 opacity-10" 
                 style={{ 
                   backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)', 
                   backgroundSize: '40px 40px' 
                 }} 
            />
            
            {/* Floating Cards */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative z-10 w-full max-w-sm md:max-w-lg"
            >
              {/* Main Card */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white rounded-3xl shadow-2xl p-5 md:p-8 space-y-4 md:space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                      <CheckCircle2 size={24} className="md:w-7 md:h-7" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-black text-slate-900">{t('Issue Resolved')}</p>
                      <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">{t('Miraj Road, Sangli')}</p>
                    </div>
                  </div>
                  <span className="text-[10px] md:text-xs font-bold text-slate-400">{t('2m ago')}</span>
                </div>
                
                <div className="h-32 md:h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl overflow-hidden flex items-center justify-center relative">
                  {/* Static SVG City Illustration */}
                  <svg viewBox="0 0 400 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                    <defs>
                      <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#dbeafe" />
                        <stop offset="100%" stopColor="#eff6ff" />
                      </linearGradient>
                    </defs>
                    <rect width="400" height="200" fill="url(#skyGrad)" />
                    <circle cx="340" cy="40" r="25" fill="#fbbf24" opacity="0.8" />
                    <ellipse cx="80" cy="35" rx="30" ry="12" fill="white" opacity="0.7" />
                    <ellipse cx="100" cy="30" rx="25" ry="10" fill="white" opacity="0.7" />
                    <ellipse cx="250" cy="50" rx="20" ry="8" fill="white" opacity="0.5" />
                    {/* Simplified buildings for performance/size */}
                    <rect x="20" y="80" width="50" height="90" rx="4" fill="#3b82f6" />
                    <rect x="80" y="100" width="40" height="70" rx="4" fill="#6366f1" />
                    <rect x="130" y="70" width="60" height="100" rx="4" fill="#2563eb" />
                    <rect x="200" y="90" width="45" height="80" rx="4" fill="#4f46e5" />
                    <rect x="260" y="110" width="35" height="60" rx="4" fill="#7c3aed" />
                    <rect x="310" y="95" width="55" height="75" rx="4" fill="#3b82f6" />
                    
                    {/* Road */}
                    <rect x="0" y="170" width="400" height="30" fill="#475569" />
                    <rect x="0" y="183" width="30" height="3" rx="1" fill="#fbbf24" />
                    <rect x="50" y="183" width="30" height="3" rx="1" fill="#fbbf24" />
                    <rect x="100" y="183" width="30" height="3" rx="1" fill="#fbbf24" />
                    <rect x="150" y="183" width="30" height="3" rx="1" fill="#fbbf24" />
                    <rect x="200" y="183" width="30" height="3" rx="1" fill="#fbbf24" />
                    <rect x="250" y="183" width="30" height="3" rx="1" fill="#fbbf24" />
                    <rect x="300" y="183" width="30" height="3" rx="1" fill="#fbbf24" />
                    <rect x="350" y="183" width="30" height="3" rx="1" fill="#fbbf24" />
                    
                    <circle cx="355" cy="130" r="16" fill="#22c55e" />
                    <path d="M347 130 L353 136 L363 124" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex -space-x-2">
                    {['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500'].map((color, i) => (
                      <div key={i} className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white ${color} flex items-center justify-center text-white text-[10px] md:text-xs font-bold`}>
                        {['S', 'A', 'M', 'R'][i]}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] md:text-xs font-bold text-slate-500">+42 {t('citizens upvoted')}</p>
                </div>
              </motion.div>

              {/* Floating Feature Cards */}
              <FloatingCard
                delay={1}
                position="top-left"
                icon={<MapPin size={16} className="md:w-[18px] md:h-[18px]" />}
                label={t('Real-time Tracking')}
                color="blue"
              />
              <FloatingCard
                delay={2}
                position="bottom-right"
                icon={<BarChart3 size={16} className="md:w-[18px] md:h-[18px]" />}
                label={t('Analytics Dashboard')}
                color="purple"
              />
              <FloatingCard
                delay={3}
                position="bottom-left"
                icon={<Zap size={16} className="md:w-[18px] md:h-[18px]" />}
                label={t('Instant Alerts')}
                color="amber"
              />
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 px-6 md:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block px-3 py-1.5 md:px-4 md:py-2 bg-blue-50 text-blue-600 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full mb-4"
              >
                {t('How it Works')}
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-4"
              >
                {t('Simple, Fast, Effective')}
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto"
              >
                {t('Three simple steps to make your voice heard and your city better.')}
              </motion.p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <FeatureCard 
                step="01"
                icon={<MapPin size={28} className="md:w-8 md:h-8" />}
                title={t('Report')}
                description={t('Spot a civic issue? Snap a photo, add details, tag the location, and submit your report in under a minute.')}
              />
              <FeatureCard 
                step="02"
                icon={<Shield size={28} className="md:w-8 md:h-8" />}
                title={t('Track')}
                description={t('Authorities verify your report and assign it to the relevant department. Track real-time updates.')}
              />
              <FeatureCard 
                step="03"
                icon={<CheckCircle2 size={28} className="md:w-8 md:h-8" />}
                title={t('Resolve')}
                description={t('Get notifications at every step until the issue is fully resolved. Transparency guaranteed.')}
              />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24 px-6 md:px-8 bg-slate-50">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="inline-block px-3 py-1.5 md:px-4 md:py-2 bg-blue-50 text-blue-600 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full mb-4 md:mb-6">
                {t('Why Choose NagrikSetu')}
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-4 md:mb-6">
                {t('Built for the Community')}
              </h2>
              <p className="text-base md:text-lg text-slate-600 font-medium mb-6 md:mb-8">
                {t('Our platform leverages the power of community engagement to drive real change in your neighborhood.')}
              </p>
              <div className="space-y-3 md:space-y-4">
                <BenefitItem icon={<TrendingUp size={18} className="md:w-5 md:h-5" />} label={t('Prioritization based on community upvotes')} />
                <BenefitItem icon={<Lock size={18} className="md:w-5 md:h-5" />} label={t('Secure and privacy-focused')} />
                <BenefitItem icon={<Award size={18} className="md:w-5 md:h-5" />} label={t('Transparent resolution tracking')} />
                <BenefitItem icon={<Clock size={18} className="md:w-5 md:h-5" />} label={t('24/7 reporting and monitoring')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <BenefitCard
                icon={<Users size={20} className="md:w-6 md:h-6" />}
                value="10,000+"
                label={t('Supported Citizens')}
                color="blue"
              />
              <BenefitCard
                icon={<CheckCircle2 size={20} className="md:w-6 md:h-6" />}
                value={t('Many')}
                label={t('Issues to get Resolved')}
                color="emerald"
              />
              <BenefitCard
                icon={<BarChart3 size={20} className="md:w-6 md:h-6" />}
                value="94%"
                label={t('Satisfaction Rate')}
                color="purple"
              />
              <BenefitCard
                icon={<Zap size={20} className="md:w-6 md:h-6" />}
                value={t('3 Days')}
                label={t('Avg Resolution')}
                color="amber"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 px-6 md:px-8 bg-gradient-to-br from-blue-600 to-indigo-600">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 md:mb-6 tracking-tight">
                {t('Ready to Make a Difference?')}
              </h2>
              <p className="text-base md:text-xl text-blue-100 font-medium mb-8 md:mb-10 max-w-2xl mx-auto">
                {t('Join thousands of active citizens working together to build better, safer, and cleaner communities.')}
              </p>
              <button 
                onClick={() => openAuth('signup')}
                className="inline-flex items-center gap-2 md:gap-3 px-6 py-3 md:px-10 md:py-5 bg-white text-blue-600 rounded-2xl font-black text-base md:text-lg hover:shadow-2xl transition-all active:scale-95 group"
              >
                {t('Start Reporting Issues')}
                <ArrowRight size={20} className="md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-10 md:py-12 px-6 md:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Shield size={20} className="md:w-6 md:h-6" />
              </div>
              <span className="font-black text-xl md:text-2xl">NagrikSetu</span>
            </div>
            <p className="text-sm md:text-base text-slate-400 font-medium mb-6">
              {t('Bridging citizens and authorities for a better tomorrow.')}
            </p>
            <p className="text-xs md:text-sm text-slate-500">
              {t('© 2026 NagrikSetu. All rights reserved.')}
            </p>
          </div>
        </footer>
      </main>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authMode}
        onLogin={onLogin}
      />
    </div>
  );
};

function StatItem({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1 md:gap-2 text-blue-600 mb-1 md:mb-2">
        {icon}
      </div>
      <p className="text-2xl md:text-3xl font-black text-slate-900 mb-1">{value}</p>
      <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
    </div>
  );
}

function FeatureCard({ step, icon, title, description }: { 
  step: string, 
  icon: React.ReactNode, 
  title: string, 
  description: string 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative p-6 md:p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all group"
    >
      <div className="absolute top-4 right-4 md:top-6 md:right-6 text-4xl md:text-6xl font-black text-slate-50 group-hover:text-blue-50 transition-colors">
        {step}
      </div>
      <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all relative z-10">
        {icon}
      </div>
      <h3 className="text-xl md:text-2xl font-black mb-2 md:mb-3 relative z-10">{title}</h3>
      <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed relative z-10">{description}</p>
    </motion.div>
  );
}

function FloatingCard({ 
  delay, 
  position, 
  icon, 
  label, 
  color 
}: { 
  delay: number, 
  position: string, 
  icon: React.ReactNode, 
  label: string, 
  color: 'blue' | 'purple' | 'amber' 
}) {
  const positions = {
    'top-left': '-top-6 -left-4 md:-top-8 md:-left-8',
    'bottom-right': '-bottom-6 -right-4 md:-bottom-8 md:-right-8',
    'bottom-left': '-bottom-10 -left-6 md:-bottom-12 md:-left-12'
  };

  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring" }}
      className={`absolute ${positions[position as keyof typeof positions]} bg-white p-2 md:p-4 rounded-xl md:rounded-2xl shadow-xl flex items-center gap-2 md:gap-3 border border-slate-100`}
    >
      <div className={`w-8 h-8 md:w-10 md:h-10 ${colors[color]} rounded-lg md:rounded-xl flex items-center justify-center`}>
        {icon}
      </div>
      <p className="text-[10px] md:text-sm font-bold whitespace-nowrap">{label}</p>
    </motion.div>
  );
}

function BenefitItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-2 md:gap-3 text-slate-700">
      <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-100 text-blue-600 rounded-md md:rounded-lg flex items-center justify-center shrink-0">
        {icon}
      </div>
      <p className="text-sm md:text-base font-medium">{label}</p>
    </div>
  );
}

function BenefitCard({ 
  icon, 
  value, 
  label, 
  color 
}: { 
  icon: React.ReactNode, 
  value: string, 
  label: string,
  color: 'blue' | 'emerald' | 'purple' | 'amber'
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`p-4 md:p-6 bg-gradient-to-br ${colors[color]} rounded-2xl md:rounded-3xl shadow-lg text-white`}
    >
      <div className="mb-2 md:mb-4">{icon}</div>
      <p className="text-2xl md:text-4xl font-black mb-1 md:mb-2">{value}</p>
      <p className="text-[10px] md:text-sm font-bold opacity-90 leading-tight">{label}</p>
    </motion.div>
  );
}