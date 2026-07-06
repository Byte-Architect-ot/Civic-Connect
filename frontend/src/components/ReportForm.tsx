import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, MapPin, AlertTriangle, Camera, FileText, Tag, TrendingUp, Trash2, Loader2, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { IssueCategory, IssuePriority } from '../types';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:8000';

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const categories: IssueCategory[] = ['Roads', 'Garbage', 'Water', 'Electricity', 'Public Health', 'Others'];
const priorities: IssuePriority[] = ['Low', 'Medium', 'High', 'Critical'];

export const ReportForm: React.FC<ReportFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Roads' as IssueCategory,
    priority: 'Medium' as IssuePriority,
    location: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🤖 ML STATE
  const [mlSuggestions, setMlSuggestions] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDebounce, setAnalysisDebounce] = useState<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🤖 REAL-TIME ML ANALYSIS
  const analyzeText = async (title: string, description: string) => {
    if (title.length < 10 || description.length < 20) {
      setMlSuggestions(null);
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/api/ml/categorize/analyze`, {
        title,
        description
      }, { timeout: 10000 });

      setMlSuggestions(response.data);
      
      // Auto-apply ML suggestions
      setFormData(prev => ({
        ...prev,
        category: response.data.category || prev.category,
        priority: response.data.priority || prev.priority
      }));
    } catch (error) {
      console.error('ML analysis failed:', error);
      setMlSuggestions(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Debounced analysis
  useEffect(() => {
    if (analysisDebounce) {
      clearTimeout(analysisDebounce);
    }

    const timeout = setTimeout(() => {
      analyzeText(formData.title, formData.description);
    }, 1500); // Wait 1.5s after user stops typing

    setAnalysisDebounce(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [formData.title, formData.description]);

  const handleFileSelect = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({ ...formData, imageFile, mlSuggestions });
      // Reset form
      setFormData({ 
        title: '', 
        description: '', 
        category: 'Roads', 
        priority: 'Medium',
        location: '',
      });
      setImageFile(null);
      setImagePreview(null);
      setMlSuggestions(null);
      setErrors({});
    } catch (err) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ 
      title: '', 
      description: '', 
      category: 'Roads', 
      priority: 'Medium',
      location: '',
    });
    setImageFile(null);
    setImagePreview(null);
    setMlSuggestions(null);
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
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[95%] sm:max-w-2xl bg-white rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-3 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900">{t('Report an Issue')}</h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">{t('AI-powered issue reporting')}</p>
              </div>
              <button 
                onClick={handleClose} 
                className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white rounded-xl transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none text-slate-400 hover:text-slate-900 shrink-0"
              >
                <X size={22} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
              {/* Issue Title */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                  <FileText size={16} />
                  {t('Issue Title')}
                  <span className="text-rose-500">*</span>
                  {isAnalyzing && (
                    <span className="flex items-center gap-1 text-blue-600 text-xs">
                      <Loader2 size={12} className="animate-spin" />
                      Analyzing...
                    </span>
                  )}
                </label>
                <input
                  required
                  type="text"
                  placeholder={t('e.g., Large pothole on Main Street')}
                  className={`w-full px-4 py-3 min-h-[44px] rounded-xl border-2 ${
                    errors.title ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-sm`}
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

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                  <FileText size={16} />
                  {t('Detailed Description')}
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={t("Describe the issue in detail...")}
                  className={`w-full px-4 py-3 min-h-[44px] rounded-xl border-2 ${
                    errors.description ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none font-medium text-sm`}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
                {errors.description && (
                  <p className="text-rose-600 text-xs font-medium mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* 🤖 ML SUGGESTIONS DISPLAY */}
              {mlSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={18} className="text-blue-600" />
                    <h4 className="font-bold text-blue-900">AI Analysis Complete</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white rounded-xl p-3 border border-blue-100">
                      <p className="text-xs text-blue-600 font-bold mb-1">Suggested Category</p>
                      <p className="font-black text-slate-900">{mlSuggestions.category}</p>
                      <p className="text-xs text-blue-500 mt-1">
                        {Math.round(mlSuggestions.category_confidence * 100)}% confident
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-blue-100">
                      <p className="text-xs text-blue-600 font-bold mb-1">Suggested Priority</p>
                      <p className="font-black text-slate-900">{mlSuggestions.priority}</p>
                      <p className="text-xs text-blue-500 mt-1">
                        {Math.round(mlSuggestions.priority_confidence * 100)}% confident
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 mt-3 flex items-center gap-1">
                    <AlertCircle size={12} />
                    Auto-applied. You can still change these values below.
                  </p>
                </motion.div>
              )}

              {/* Category and Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                    <Tag size={16} />
                    {t('Category')}
                  </label>
                  <select
                    className="w-full px-4 py-3 min-h-[44px] rounded-xl border-2 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white font-medium text-sm"
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
                    {t('Priority Level')}
                  </label>
                  <select
                    className="w-full px-4 py-3 min-h-[44px] rounded-xl border-2 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white font-medium text-sm"
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
                  {t('Location')}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder={t('Specific area, landmark, or street name')}
                  className={`w-full px-4 py-3 min-h-[44px] rounded-xl border-2 ${
                    errors.location ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-sm`}
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              {/* Image Upload (Simplified) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                  <ImageIcon size={16} />
                  {t('Attach Photo')}
                  <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                </label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />

                {imagePreview ? (
                  <div className="relative group">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl border-2 border-emerald-200" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-3 min-w-[44px] min-h-[44px] flex items-center justify-center bg-rose-500 text-white rounded-lg hover:bg-rose-600 active:scale-95 focus-visible:ring-2 focus-visible:ring-white outline-none transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-4 min-h-[48px] border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-slate-600 hover:text-blue-600 font-bold active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-blue-400 outline-none"
                  >
                    <Upload size={18} />
                    Click to upload image
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="w-1/3 px-6 py-3 min-h-[48px] rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all border-2 border-slate-200 disabled:opacity-50 active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 min-h-[48px] rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {t('Submitting...')}
                    </>
                  ) : (
                    t('Submit Report')
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};