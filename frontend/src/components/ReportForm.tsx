import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, MapPin, AlertTriangle, Image as ImageIcon, FileText, Tag, TrendingUp } from 'lucide-react';
import { IssueCategory, IssuePriority } from '../types';

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const categories: IssueCategory[] = ['Roads', 'Garbage', 'Water', 'Electricity', 'Public Health', 'Others'];
const priorities: IssuePriority[] = ['Low', 'Medium', 'High', 'Critical'];

export const ReportForm: React.FC<ReportFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Roads' as IssueCategory,
    priority: 'Medium' as IssuePriority,
    location: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters long';
    }
    
    if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters long';
    }
    
    if (formData.location.trim().length < 5) {
      newErrors.location = 'Please provide a specific location';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    onSubmit(formData);
    setFormData({ 
      title: '', 
      description: '', 
      category: 'Roads', 
      priority: 'Medium',
      location: '',
      imageUrl: '' 
    });
    setErrors({});
  };

  const handleClose = () => {
    setFormData({ 
      title: '', 
      description: '', 
      category: 'Roads', 
      priority: 'Medium',
      location: '',
      imageUrl: '' 
    });
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Report an Issue</h2>
                <p className="text-sm text-slate-600 font-medium">Help improve your community</p>
              </div>
              <button 
                onClick={handleClose} 
                className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Issue Title */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                  <FileText size={16} />
                  Issue Title
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Large pothole on Main Street near traffic signal"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.title ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium`}
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
                {errors.title && (
                  <p className="text-rose-600 text-xs font-medium mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                    <Tag size={16} />
                    Category
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white font-medium"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as IssueCategory })}
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                    <TrendingUp size={16} />
                    Priority Level
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white font-medium"
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as IssuePriority })}
                  >
                    {priorities.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                  <MapPin size={16} />
                  Location
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="Specific area, landmark, or street name"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.location ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium`}
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
                {errors.location && (
                  <p className="text-rose-600 text-xs font-medium mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {errors.location}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                  <FileText size={16} />
                  Detailed Description
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the issue in detail. Include information about how long it's been present, severity, and impact on the community..."
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.description ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none font-medium`}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description ? (
                    <p className="text-rose-600 text-xs font-medium flex items-center gap-1">
                      <AlertTriangle size={12} />
                      {errors.description}
                    </p>
                  ) : (
                    <p className="text-slate-400 text-xs font-medium">
                      {formData.description.length} characters
                    </p>
                  )}
                </div>
              </div>

              {/* Image URL (Optional) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                  <ImageIcon size={16} />
                  Image URL (Optional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  Photos help authorities understand the issue better
                </p>
              </div>

              {/* Upload Note */}
              <div className="p-4 border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50 flex items-start gap-3">
                <Upload className="text-blue-600 mt-0.5 shrink-0" size={20} />
                <div>
                  <p className="text-sm font-bold text-blue-900 mb-1">Pro Tip</p>
                  <p className="text-xs text-blue-700 font-medium">
                    Include clear photos showing the issue from multiple angles. This helps authorities assess and prioritize your report more effectively.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors border-2 border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};