import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, MapPin, Users, ArrowRight, CheckCircle2, 
  TrendingUp, Award, Clock, BarChart3, Zap, Globe, Lock
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { User } from '../types';
import { LanguageSelector } from './LanguageSelector';

interface LandingPageProps {
  onLogin: (user: User) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200 px-8 h-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <Shield size={28} />
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900">NagrikSetu</span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <button 
            onClick={() => openAuth('signin')}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => openAuth('signup')}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          {/* Left Content */}
          <div className="p-12 lg:p-24 flex flex-col justify-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-2 bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest rounded-full mb-6 border border-blue-100"
              >
                Empowering Citizens, Improving Cities
              </motion.span>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-6xl lg:text-7xl font-black leading-[0.9] tracking-tighter text-slate-900 mb-8"
              >
                Bridge the Gap. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Build the Future.
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-slate-600 font-medium max-w-lg leading-relaxed mb-10"
              >
                NagrikSetu is a powerful crowdsourced civic issue reporting platform that connects citizens directly with local authorities for faster resolution and transparent governance.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button 
                  onClick={() => openAuth('signup')}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95 group"
                >
                  Get Started Now
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all"
                >
                  Learn More
                </button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-8 pt-12 border-t border-slate-200"
            >
              <StatItem label="Active Users" value="10k+" icon={<Users size={20} />} />
              <StatItem label="Issues Resolved" value="5k+" icon={<CheckCircle2 size={20} />} />
              <StatItem label="Cities" value="12+" icon={<Globe size={20} />} />
            </motion.div>
          </div>

          {/* Right Visual Section */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden flex items-center justify-center p-12 lg:p-24">
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
              className="relative z-10 w-full max-w-lg"
            >
              {/* Main Card */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white rounded-3xl shadow-2xl p-8 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                      <CheckCircle2 size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">Issue Resolved</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Miraj Road, Sangli</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">2m ago</span>
                </div>
                
                <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl overflow-hidden flex items-center justify-center relative">
                  {/* Static SVG City Illustration */}
                  <svg viewBox="0 0 400 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    {/* Sky */}
                    <defs>
                      <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#dbeafe" />
                        <stop offset="100%" stopColor="#eff6ff" />
                      </linearGradient>
                      <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#64748b" />
                        <stop offset="100%" stopColor="#94a3b8" />
                      </linearGradient>
                    </defs>
                    <rect width="400" height="200" fill="url(#skyGrad)" />
                    {/* Sun */}
                    <circle cx="340" cy="40" r="25" fill="#fbbf24" opacity="0.8" />
                    {/* Clouds */}
                    <ellipse cx="80" cy="35" rx="30" ry="12" fill="white" opacity="0.7" />
                    <ellipse cx="100" cy="30" rx="25" ry="10" fill="white" opacity="0.7" />
                    <ellipse cx="250" cy="50" rx="20" ry="8" fill="white" opacity="0.5" />
                    {/* Buildings */}
                    <rect x="20" y="80" width="50" height="90" rx="4" fill="#3b82f6" />
                    <rect x="28" y="90" width="10" height="10" rx="1" fill="#93c5fd" />
                    <rect x="42" y="90" width="10" height="10" rx="1" fill="#93c5fd" />
                    <rect x="28" y="108" width="10" height="10" rx="1" fill="#93c5fd" />
                    <rect x="42" y="108" width="10" height="10" rx="1" fill="#93c5fd" />
                    <rect x="28" y="126" width="10" height="10" rx="1" fill="#93c5fd" />
                    <rect x="42" y="126" width="10" height="10" rx="1" fill="#93c5fd" />
                    
                    <rect x="80" y="100" width="40" height="70" rx="4" fill="#6366f1" />
                    <rect x="88" y="110" width="8" height="8" rx="1" fill="#a5b4fc" />
                    <rect x="100" y="110" width="8" height="8" rx="1" fill="#a5b4fc" />
                    <rect x="88" y="125" width="8" height="8" rx="1" fill="#a5b4fc" />
                    <rect x="100" y="125" width="8" height="8" rx="1" fill="#a5b4fc" />
                    
                    <rect x="130" y="70" width="60" height="100" rx="4" fill="#2563eb" />
                    <rect x="140" y="80" width="10" height="10" rx="1" fill="#93c5fd" />
                    <rect x="155" y="80" width="10" height="10" rx="1" fill="#93c5fd" />
                    <rect x="170" y="80" width="10" height="10" rx="1" fill="#93c5fd" />
                    <rect x="140" y="98" width="10" height="10" rx="1" fill="#93c5fd" />
                    <rect x="155" y="98" width="10" height="10" rx="1" fill="#bfdbfe" />
                    <rect x="170" y="98" width="10" height="10" rx="1" fill="#93c5fd" />
                    <rect x="140" y="116" width="10" height="10" rx="1" fill="#bfdbfe" />
                    <rect x="155" y="116" width="10" height="10" rx="1" fill="#93c5fd" />
                    <rect x="170" y="116" width="10" height="10" rx="1" fill="#93c5fd" />
                    
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
                    
                    {/* Trees */}
                    <rect x="242" y="140" width="6" height="30" fill="#92400e" />
                    <circle cx="245" cy="130" r="15" fill="#22c55e" />
                    <circle cx="245" cy="122" r="10" fill="#16a34a" />
                    
                    {/* Street Light */}
                    <rect x="295" y="130" width="4" height="40" fill="#78716c" />
                    <rect x="289" y="128" width="16" height="4" rx="2" fill="#78716c" />
                    <circle cx="297" cy="126" r="4" fill="#fbbf24" opacity="0.6" />
                    
                    {/* Checkmark badge */}
                    <circle cx="355" cy="130" r="16" fill="#22c55e" />
                    <path d="M347 130 L353 136 L363 124" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex -space-x-2">
                    {['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500'].map((color, i) => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 border-white ${color} flex items-center justify-center text-white text-xs font-bold`}>
                        {['S', 'A', 'M', 'R'][i]}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-bold text-slate-500">+42 citizens upvoted</p>
                </div>
              </motion.div>

              {/* Floating Feature Cards */}
              <FloatingCard
                delay={1}
                position="top-left"
                icon={<MapPin size={18} />}
                label="Real-time Tracking"
                color="blue"
              />
              <FloatingCard
                delay={2}
                position="bottom-right"
                icon={<BarChart3 size={18} />}
                label="Analytics Dashboard"
                color="purple"
              />
              <FloatingCard
                delay={3}
                position="bottom-left"
                icon={<Zap size={18} />}
                label="Instant Alerts"
                color="amber"
              />
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-24 px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-2 bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest rounded-full mb-4"
              >
                How it Works
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-5xl font-black tracking-tight mb-4"
              >
                Simple, Fast, Effective
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-slate-600 font-medium max-w-2xl mx-auto text-lg"
              >
                Three simple steps to make your voice heard and your city better.
              </motion.p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <FeatureCard 
                step="01"
                icon={<MapPin size={32} />}
                title="Report"
                description="Spot a civic issue? Snap a photo, add details, tag the location, and submit your report in under a minute."
              />
              <FeatureCard 
                step="02"
                icon={<Shield size={32} />}
                title="Track"
                description="Authorities verify your report and assign it to the relevant department. Track real-time updates."
              />
              <FeatureCard 
                step="03"
                icon={<CheckCircle2 size={32} />}
                title="Resolve"
                description="Get notifications at every step until the issue is fully resolved. Transparency guaranteed."
              />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 px-8 bg-slate-50">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest rounded-full mb-6">
                Why Choose NagrikSetu
              </span>
              <h2 className="text-5xl font-black tracking-tight mb-6">
                Built for the Community
              </h2>
              <p className="text-lg text-slate-600 font-medium mb-8">
                Our platform leverages the power of community engagement to drive real change in your neighborhood.
              </p>
              <div className="space-y-4">
                <BenefitItem icon={<TrendingUp />} label="Prioritization based on community upvotes" />
                <BenefitItem icon={<Lock />} label="Secure and privacy-focused" />
                <BenefitItem icon={<Award />} label="Transparent resolution tracking" />
                <BenefitItem icon={<Clock />} label="24/7 reporting and monitoring" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <BenefitCard
                icon={<Users size={24} />}
                value="10,000+"
                label="Supported Citizens"
                color="blue"
              />
              <BenefitCard
                icon={<CheckCircle2 size={24} />}
                value="Many"
                label="Issues to get Resolved"
                color="emerald"
              />
              <BenefitCard
                icon={<BarChart3 size={24} />}
                value="94%"
                label="Satisfaction Rate"
                color="purple"
              />
              <BenefitCard
                icon={<Zap size={24} />}
                value="3 Days"
                label="Avg Resolution"
                color="amber"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-8 bg-gradient-to-br from-blue-600 to-indigo-600">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
                Ready to Make a Difference?
              </h2>
              <p className="text-xl text-blue-100 font-medium mb-10 max-w-2xl mx-auto">
                Join thousands of active citizens working together to build better, safer, and cleaner communities.
              </p>
              <button 
                onClick={() => openAuth('signup')}
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-blue-600 rounded-2xl font-black text-lg hover:shadow-2xl transition-all active:scale-95 group"
              >
                Start Reporting Issues
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-12 px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Shield size={24} />
              </div>
              <span className="font-black text-2xl">NagrikSetu</span>
            </div>
            <p className="text-slate-400 font-medium mb-6">
              Bridging citizens and authorities for a better tomorrow.
            </p>
            <p className="text-sm text-slate-500">
              © 2026 NagrikSetu. All rights reserved.
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
      <div className="flex items-center gap-2 text-blue-600 mb-2">
        {icon}
      </div>
      <p className="text-3xl font-black text-slate-900 mb-1">{value}</p>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
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
      className="relative p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all group"
    >
      <div className="absolute top-6 right-6 text-6xl font-black text-slate-50 group-hover:text-blue-50 transition-colors">
        {step}
      </div>
      <div className="w-16 h-16 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-3">{title}</h3>
      <p className="text-slate-600 font-medium leading-relaxed">{description}</p>
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
    'top-left': '-top-8 -left-8',
    'bottom-right': '-bottom-8 -right-8',
    'bottom-left': '-bottom-12 -left-12'
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
      className={`absolute ${positions[position as keyof typeof positions]} bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-3`}
    >
      <div className={`w-10 h-10 ${colors[color]} rounded-xl flex items-center justify-center`}>
        {icon}
      </div>
      <p className="text-sm font-bold whitespace-nowrap">{label}</p>
    </motion.div>
  );
}

function BenefitItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-3 text-slate-700">
      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
        {icon}
      </div>
      <p className="font-medium">{label}</p>
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
      className={`p-6 bg-gradient-to-br ${colors[color]} rounded-3xl shadow-lg text-white`}
    >
      <div className="mb-4">{icon}</div>
      <p className="text-4xl font-black mb-2">{value}</p>
      <p className="text-sm font-bold opacity-90">{label}</p>
    </motion.div>
  );
}