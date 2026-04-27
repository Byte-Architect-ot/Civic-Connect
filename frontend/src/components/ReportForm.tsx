import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, MapPin, AlertTriangle, Camera, FileText, Tag, TrendingUp, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { IssueCategory, IssuePriority } from '../types';

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const categories: IssueCategory[] = ['Roads', 'Garbage', 'Water', 'Electricity', 'Public Health', 'Others'];
const priorities: IssuePriority[] = ['Low', 'Medium', 'High', 'Critical'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ReportForm: React.FC<ReportFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Roads' as IssueCategory,
    priority: 'Medium' as IssuePriority,
    location: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera stream on unmount or close
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  }, []);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Unsupported file format. Only JPEG, PNG, and WebP are allowed.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.`;
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setImageError(error);
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    setImageError(null);
    setImageFile(file);

    // Create preview URL
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
    // Reset the input so re-selecting same file triggers change
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageError(null);
    stopCamera();
  };

  // --- Desktop Camera (WebRTC) ---
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const handleCameraClick = async () => {
    if (isMobile) {
      // On mobile, use native camera input
      cameraInputRef.current?.click();
      return;
    }

    // On desktop, open WebRTC camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      setIsCameraOpen(true);

      // Wait for video element to be rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setImageError('Camera permission denied. Please use "Upload from Device" instead, or enable camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setImageError('No camera detected on this device. Please use "Upload from Device" to attach a photo.');
      } else {
        setImageError('Could not access camera. Please use "Upload from Device" instead.');
      }
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        handleFileSelect(file);
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
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
      await onSubmit({ ...formData, imageFile });
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
      setImageError(null);
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
    setImageError(null);
    setErrors({});
    stopCamera();
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
                aria-label="Close report form"
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

              {/* ─── Image Upload Section ─── */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                  <ImageIcon size={16} />
                  Attach Photo
                  <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                </label>

                {/* Hidden file inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileInputChange}
                  aria-label="Upload image from device"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileInputChange}
                  aria-label="Capture photo from camera"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Camera Viewfinder (Desktop WebRTC) */}
                <AnimatePresence>
                  {isCameraOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 rounded-2xl overflow-hidden border-2 border-blue-300 bg-black"
                    >
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-64 object-cover"
                      />
                      <div className="flex gap-3 p-3 bg-slate-900">
                        <button
                          type="button"
                          onClick={handleCapturePhoto}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                          aria-label="Capture photo"
                        >
                          <Camera size={18} />
                          Capture
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-4 py-2.5 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-colors"
                          aria-label="Cancel camera"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Image Preview */}
                {imagePreview && !isCameraOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 relative group"
                  >
                    <div className="rounded-2xl overflow-hidden border-2 border-emerald-200 bg-slate-50">
                      <img
                        src={imagePreview}
                        alt="Selected image preview"
                        className="w-full h-48 object-cover"
                      />
                      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50 border-t border-emerald-200">
                        <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold min-w-0">
                          <ImageIcon size={14} className="shrink-0" />
                          <span className="truncate">{imageFile?.name}</span>
                          <span className="text-emerald-500 shrink-0">
                            ({(imageFile?.size ? imageFile.size / 1024 : 0).toFixed(0)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-200 transition-colors shrink-0"
                          aria-label="Remove selected image"
                        >
                          <Trash2 size={12} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Upload & Camera Buttons */}
                {!imagePreview && !isCameraOpen && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2.5 px-4 py-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 text-slate-600 font-bold hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all group"
                      aria-label="Upload image from device"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:border-blue-200 transition-colors">
                        <Upload size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">Upload from Device</p>
                        <p className="text-[10px] text-slate-400 font-medium">Browse files</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={handleCameraClick}
                      className="flex items-center justify-center gap-2.5 px-4 py-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 text-slate-600 font-bold hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
                      aria-label="Take photo with camera"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:border-indigo-200 transition-colors">
                        <Camera size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">Take Photo</p>
                        <p className="text-[10px] text-slate-400 font-medium">Use camera</p>
                      </div>
                    </button>
                  </div>
                )}

                {/* Image Error */}
                {imageError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl mb-3"
                  >
                    <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-rose-600 text-xs font-medium">{imageError}</p>
                  </motion.div>
                )}

                {/* Format hint */}
                <p className="text-[11px] text-slate-400 font-medium">
                  Accepted formats: JPEG, PNG, WebP &bull; Max size: 5MB
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors border-2 border-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Submit Report'
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