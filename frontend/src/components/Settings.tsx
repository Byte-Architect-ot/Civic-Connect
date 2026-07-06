import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, Mail, Phone, Shield, Bell, Globe, 
  MapPin, Save, Lock, Award, CheckCircle2, Calendar
} from 'lucide-react';
import { User } from '../types';

interface SettingsProps {
  user: User;
  onUpdateUser?: (user: User) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    address: user.address || ''
  });
  const [preferences, setPreferences] = useState({
    pushNotifications: true,
    emailReports: false,
    publicProfile: true,
    weeklyDigest: true
  });

  const handleSave = () => {
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        ...formData
      });
    }
    setEditMode(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || ''
    });
    setEditMode(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">Account Settings</h2>
          <p className="text-slate-500">Manage your profile and preferences</p>
        </div>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="px-6 py-3 min-h-[48px] bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 shadow-soft-lg transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 outline-none"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Section */}
      <section className="bg-white rounded-4xl border-2 border-slate-100 p-4 sm:p-8">
        <h3 className="text-lg font-display font-bold mb-6">Profile Information</h3>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-8 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-slate-50 border-2 border-slate-200 object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <h3 className="text-2xl font-display font-bold">{user.name}</h3>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                <Shield size={14} />
                <span className="text-xs font-semibold">{user.role}</span>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <StatBox 
                icon={<Award size={20} />} 
                label="Reports Submitted" 
                value={user.reportsCount || 0} 
              />
              <StatBox 
                icon={<CheckCircle2 size={20} />} 
                label="Issues Resolved" 
                value={user.resolvedCount || 0} 
              />
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SettingsField 
            icon={<UserIcon size={18} />} 
            label="Full Name" 
            value={formData.name}
            editable={editMode}
            onChange={(val) => setFormData({ ...formData, name: val })}
          />
          <SettingsField 
            icon={<Mail size={18} />} 
            label="Email Address" 
            value={formData.email}
            editable={editMode}
            onChange={(val) => setFormData({ ...formData, email: val })}
          />
          <SettingsField 
            icon={<Phone size={18} />} 
            label="Phone Number" 
            value={formData.phone || 'Not provided'}
            editable={editMode}
            onChange={(val) => setFormData({ ...formData, phone: val })}
          />
          <SettingsField 
            icon={<MapPin size={18} />} 
            label="Address" 
            value={formData.address || 'Not provided'}
            editable={editMode}
            onChange={(val) => setFormData({ ...formData, address: val })}
          />
        </div>

        {/* Action Buttons */}
        {editMode && (
          <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100">
            <button
              onClick={handleCancel}
              className="flex-1 px-6 py-3 min-h-[48px] rounded-full font-semibold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 min-h-[48px] bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 shadow-soft-lg transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 outline-none flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        )}
      </section>

      {/* Preferences Section */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide ml-4">Notification Preferences</h3>
        <div className="bg-white rounded-4xl border-2 border-slate-100 overflow-hidden">
          <SettingsToggle 
            icon={<Bell size={18} />} 
            label="Push Notifications" 
            description="Get instant alerts for status updates" 
            active={preferences.pushNotifications}
            onChange={(val) => setPreferences({ ...preferences, pushNotifications: val })}
          />
          <SettingsToggle 
            icon={<Mail size={18} />} 
            label="Email Notifications" 
            description="Receive updates via email" 
            active={preferences.emailReports}
            onChange={(val) => setPreferences({ ...preferences, emailReports: val })}
          />
          <SettingsToggle 
            icon={<Calendar size={18} />} 
            label="Weekly Digest" 
            description="Get weekly summary of civic issues" 
            active={preferences.weeklyDigest}
            onChange={(val) => setPreferences({ ...preferences, weeklyDigest: val })}
          />
          <SettingsToggle 
            icon={<Globe size={18} />} 
            label="Public Profile" 
            description="Allow others to see your contributions" 
            active={preferences.publicProfile}
            onChange={(val) => setPreferences({ ...preferences, publicProfile: val })}
          />
        </div>
      </section>

      {/* Security Section */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide ml-4">Security</h3>
        <div className="bg-white rounded-4xl border-2 border-slate-100 overflow-hidden">
          <button className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition-all border-b border-slate-100 min-h-[60px] active:bg-slate-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400 outline-none">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Lock size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900">Change Password</p>
                <p className="text-xs text-slate-500">Update your password regularly</p>
              </div>
            </div>
          </button>
          
          <button className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition-all min-h-[60px] active:bg-slate-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400 outline-none">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Shield size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900">Two-Factor Authentication</p>
                <p className="text-xs text-slate-500">Add extra layer of security</p>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* Member Since */}
      {user.joinedAt && (
        <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-700 flex items-center gap-2">
            <Calendar size={16} />
            Member since {new Date(user.joinedAt).toLocaleDateString('en-IN', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
      )}
    </div>
  );
};

/* Field component */
function SettingsField({ 
  icon, 
  label, 
  value, 
  editable = false,
  onChange 
}: { 
  icon: React.ReactNode, 
  label: string, 
  value: string,
  editable?: boolean,
  onChange?: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
        {icon} {label}
      </label>
      {editable ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full px-4 py-3 min-h-[44px] rounded-2xl bg-white border-2 border-slate-200 text-slate-700 focus:border-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 transition-all"
        />
      ) : (
        <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700">
          {value}
        </div>
      )}
    </div>
  );
}

/* Toggle switch component */
function SettingsToggle({ 
  icon, 
  label, 
  description, 
  active = false,
  onChange 
}: { 
  icon: React.ReactNode, 
  label: string, 
  description: string, 
  active?: boolean,
  onChange?: (value: boolean) => void
}) {
  return (
    <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
      <div className="flex gap-4 flex-1">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-slate-900 mb-1">{label}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange?.(!active)}
        className={`w-14 h-7 rounded-full relative transition-colors shrink-0 ml-4 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400 outline-none ${
          active ? 'bg-slate-900' : 'bg-slate-300'
        }`}
      >
        <motion.div 
          animate={{ x: active ? 28 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
        />
      </button>
    </div>
  );
}

/* Stat box component */
function StatBox({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode, 
  label: string, 
  value: number 
}) {
  return (
    <div className="p-4 rounded-2xl border-2 border-slate-100 hover:border-slate-200 hover:shadow-soft transition-all">
      <div className="flex items-center gap-2 mb-2 text-slate-600">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-3xl font-display font-bold text-slate-900">{value}</p>
    </div>
  );
}