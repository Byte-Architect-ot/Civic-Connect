import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, Mail, Phone, Shield, Bell, Globe, 
  ChevronRight, Camera, MapPin, Calendar, Award, Save,
  Lock, Eye, EyeOff
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Account Settings</h2>
          <p className="text-slate-500 font-medium text-sm">Manage your profile and preferences</p>
        </div>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Section */}
      <section className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Profile Information</h3>
        
        <div className="flex items-start gap-8 mb-8">
          {/* Avatar */}
          <div className="relative group">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-slate-200 shadow-lg object-cover" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera className="text-white" size={32} />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-black text-slate-900">{user.name}</h3>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                <Shield size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">{user.role}</span>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <StatBox 
                icon={<Award size={20} />} 
                label="Reports Submitted" 
                value={user.reportsCount || 0} 
                color="blue"
              />
              <StatBox 
                icon={<CheckCircle2 size={20} />} 
                label="Issues Resolved" 
                value={user.resolvedCount || 0} 
                color="emerald"
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

        {/* Action Buttons in Edit Mode */}
        {editMode && (
          <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100">
            <button
              onClick={handleCancel}
              className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        )}
      </section>

      {/* Preferences Section */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-4">Notification Preferences</h3>
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <SettingsToggle 
            icon={<Bell size={18} />} 
            label="Push Notifications" 
            description="Get instant alerts for status updates on your reports" 
            active={preferences.pushNotifications}
            onChange={(val) => setPreferences({ ...preferences, pushNotifications: val })}
          />
          <SettingsToggle 
            icon={<Mail size={18} />} 
            label="Email Notifications" 
            description="Receive important updates via email" 
            active={preferences.emailReports}
            onChange={(val) => setPreferences({ ...preferences, emailReports: val })}
          />
          <SettingsToggle 
            icon={<Calendar size={18} />} 
            label="Weekly Digest" 
            description="Get a summary of civic issues in your area every week" 
            active={preferences.weeklyDigest}
            onChange={(val) => setPreferences({ ...preferences, weeklyDigest: val })}
          />
          <SettingsToggle 
            icon={<Globe size={18} />} 
            label="Public Profile" 
            description="Allow others to see your reported issues and contributions" 
            active={preferences.publicProfile}
            onChange={(val) => setPreferences({ ...preferences, publicProfile: val })}
          />
        </div>
      </section>

      {/* Security Section */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-4">Security</h3>
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <button className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                <Lock size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900">Change Password</p>
                <p className="text-xs text-slate-500 font-medium">Update your password regularly for better security</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
          
          <button className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                <Shield size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900">Two-Factor Authentication</p>
                <p className="text-xs text-slate-500 font-medium">Add an extra layer of security to your account</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        </div>
      </section>

      {/* Account Joined Info */}
      {user.joinedAt && (
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-sm font-medium text-blue-900 flex items-center gap-2">
            <Calendar size={16} />
            Member since {new Date(user.joinedAt).toLocaleDateString('en-IN', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
      )}

      {/* Danger Zone */}
      <section className="pt-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-4 mb-4">Danger Zone</h3>
        <button className="w-full py-4 px-6 rounded-2xl border-2 border-rose-200 text-rose-600 font-bold hover:bg-rose-50 transition-colors flex items-center justify-between">
          <span>Deactivate Account</span>
          <ChevronRight size={18} />
        </button>
      </section>
    </div>
  );
};

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
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        {icon} {label}
      </label>
      {editable ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
        />
      ) : (
        <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 font-medium">
          {value}
        </div>
      )}
    </div>
  );
}

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
    <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
      <div className="flex gap-4 flex-1">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
          {icon}
        </div>
        <div>
          <p className="font-bold text-slate-900 mb-1">{label}</p>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange?.(!active)}
        className={`w-14 h-7 rounded-full relative transition-colors shrink-0 ml-4 ${
          active ? 'bg-blue-600' : 'bg-slate-300'
        }`}
      >
        <motion.div 
          animate={{ x: active ? 28 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
        />
      </button>
    </div>
  );
}

function StatBox({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode, 
  label: string, 
  value: number, 
  color: 'blue' | 'emerald' 
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  };

  return (
    <div className={`p-4 rounded-2xl border ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</span>
      </div>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}

// Missing import
import { CheckCircle2 } from 'lucide-react';