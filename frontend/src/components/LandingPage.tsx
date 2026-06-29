import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, MapPin, ArrowRight, CheckCircle2, 
  Users, Globe, BarChart3, Clock, Lock, TrendingUp
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
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-6 md:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
            <Shield size={24} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">NagrikSetu</span>
        </div>
        
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <button 
            onClick={() => openAuth('signin')}
            className="hidden sm:block px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            {t('Sign In')}
          </button>
          <button 
            onClick={() => openAuth('signup')}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 shadow-soft-lg transition-all"
          >
            {t('Get Started')}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-20">
        <section className="px-6 md:px-8 py-24 md:py-32 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-full mb-6">
              {t('Empowering Citizens, Improving Cities')}
            </span>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-6">
              {t('Bridge the Gap.')} <br />
              {t('Build the Future.')}
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              {t('Report civic issues, track progress, and collaborate with authorities to build better communities')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => openAuth('signup')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full text-base font-semibold hover:bg-slate-800 shadow-soft-xl transition-all group"
              >
                {t('Get Started Now')}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-full text-base font-semibold hover:bg-slate-50 transition-all"
              >
                {t('Learn More')}
              </button>
            </div>

            {/* Simple stats */}
            <div className="grid grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto">
              <StatItem label={t('Active Users')} value="10k+" />
              <StatItem label={t('Issues Resolved')} value="5k+" />
              <StatItem label={t('Cities')} value="12+" />
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 md:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-full mb-4">
                {t('How it Works')}
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4">
                {t('Simple, Fast, Effective')}
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                {t('Three simple steps to make your voice heard')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                step="01"
                icon={<MapPin size={28} />}
                title={t('Report')}
                description={t('Snap a photo, add details, and submit your report in under a minute')}
              />
              <FeatureCard 
                step="02"
                icon={<Shield size={28} />}
                title={t('Track')}
                description={t('Authorities verify and assign reports. Track real-time updates')}
              />
              <FeatureCard 
                step="03"
                icon={<CheckCircle2 size={28} />}
                title={t('Resolve')}
                description={t('Get notifications at every step until issue resolution')}
              />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 px-6 md:px-8 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-full mb-6">
                  {t('Why Choose NagrikSetu')}
                </span>
                <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-6">
                  {t('Built for the Community')}
                </h2>
                <p className="text-lg text-slate-600 mb-8">
                  {t('Leverage community engagement to drive real change in your neighborhood')}
                </p>
                
                <div className="space-y-4">
                  <BenefitItem 
                    icon={<TrendingUp size={20} />} 
                    label={t('Community-driven prioritization')} 
                  />
                  <BenefitItem 
                    icon={<Lock size={20} />} 
                    label={t('Secure and privacy-focused')} 
                  />
                  <BenefitItem 
                    icon={<Clock size={20} />} 
                    label={t('24/7 reporting and monitoring')} 
                  />
                  <BenefitItem 
                    icon={<BarChart3 size={20} />} 
                    label={t('Transparent resolution tracking')} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <MetricCard value="10,000+" label={t('Active Citizens')} />
                <MetricCard value="5,000+" label={t('Issues Resolved')} />
                <MetricCard value="94%" label={t('Satisfaction Rate')} />
                <MetricCard value="3 Days" label={t('Avg Resolution')} />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 md:px-8 bg-slate-900 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 tracking-tight">
              {t('Ready to Make a Difference?')}
            </h2>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              {t('Join thousands of citizens building better communities')}
            </p>
            <button 
              onClick={() => openAuth('signup')}
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-slate-900 rounded-full font-semibold text-lg hover:shadow-soft-xl transition-all group"
            >
              {t('Start Reporting Issues')}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white py-12 px-6 md:px-8 border-t border-slate-200">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                <Shield size={20} />
              </div>
              <span className="font-display font-bold text-xl">NagrikSetu</span>
            </div>
            <p className="text-slate-600 mb-6">
              {t('Bridging citizens and authorities for a better tomorrow')}
            </p>
            <p className="text-sm text-slate-400">
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

/* Simple stat item */
function StatItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-3xl font-display font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

/* Feature card component */
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
      transition={{ duration: 0.4 }}
      className="relative p-8 bg-white rounded-4xl border-2 border-slate-100 hover:border-slate-200 hover:shadow-soft-lg transition-all"
    >
      <div className="absolute top-6 right-6 text-6xl font-display font-bold text-slate-50">
        {step}
      </div>
      
      <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-6 relative z-10">
        {icon}
      </div>
      
      <h3 className="text-xl font-display font-bold mb-3 relative z-10">{title}</h3>
      <p className="text-slate-600 leading-relaxed relative z-10">{description}</p>
    </motion.div>
  );
}

/* Benefit item with icon */
function BenefitItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <p className="text-slate-700 font-medium">{label}</p>
    </div>
  );
}

/* Metric card */
function MetricCard({ value, label }: { value: string, label: string }) {
  return (
    <div className="p-6 bg-white rounded-3xl border-2 border-slate-100 hover:border-slate-200 hover:shadow-soft transition-all">
      <p className="text-3xl font-display font-bold text-slate-900 mb-2">{value}</p>
      <p className="text-sm text-slate-500 leading-tight">{label}</p>
    </div>
  );
}