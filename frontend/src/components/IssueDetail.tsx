import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, MapPin, Clock, User, MessageSquare, CheckCircle2, AlertCircle, 
  Timer, ThumbsUp, Calendar, TrendingUp, FileText, Image as ImageIcon 
} from 'lucide-react';
import { CivicIssue, IssueStatus, IssueUpdate } from '../types';
import { resolveImageUrl } from '../api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: import.meta.env.VITE_LEAFLET_MARKER_ICON_2X || 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: import.meta.env.VITE_LEAFLET_MARKER_ICON || 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: import.meta.env.VITE_LEAFLET_MARKER_SHADOW || 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface IssueDetailProps {
  issue: CivicIssue;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (issueId: string, newStatus: IssueStatus, comment: string) => void;
  onUpvote: (issueId: string) => void;
  isStaff: boolean;
  currentUserId: string;
}

const statusColors: Record<IssueStatus, string> = {
  'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  'Resolved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Rejected': 'bg-rose-100 text-rose-700 border-rose-200',
};

const statusBgColors: Record<IssueStatus, string> = {
  'Pending': 'bg-amber-50',
  'In Progress': 'bg-blue-50',
  'Resolved': 'bg-emerald-50',
  'Rejected': 'bg-rose-50',
};

export const IssueDetail: React.FC<IssueDetailProps> = ({ 
  issue, 
  isOpen, 
  onClose, 
  onUpdateStatus, 
  onUpvote,
  isStaff,
  currentUserId 
}) => {
  const [newComment, setNewComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus>(issue.status);
  const hasUpvoted = issue.upvotedBy?.includes(currentUserId);

  const handleUpdate = () => {
    if (!newComment.trim()) return;
    onUpdateStatus(issue.id, selectedStatus, newComment);
    setNewComment('');
  };

  const handleUpvoteClick = () => {
    onUpvote(issue.id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-slate-900">Issue Details</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[issue.status]}`}>
                  {issue.status}
                </span>
              </div>
              <button 
                onClick={onClose} 
                className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 rounded-xl transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none text-slate-400 hover:text-slate-900 shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
              {/* Priority & Category */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-600">Priority:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    issue.priority === 'Critical' ? 'bg-rose-100 text-rose-700' :
                    issue.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                    issue.priority === 'Medium' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {issue.priority}
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  {issue.category}
                </span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4 break-words">
                  {issue.title}
                </h1>
                
                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <MetadataItem 
                    icon={<MapPin size={16} />} 
                    label="Location" 
                    value={issue.location} 
                  />
                  <MetadataItem 
                    icon={<Clock size={16} />} 
                    label="Reported" 
                    value={new Date(issue.reportedAt).toLocaleString('en-IN')} 
                  />
                  <MetadataItem 
                    icon={<User size={16} />} 
                    label="Reporter" 
                    value={issue.reportedBy} 
                  />
                  {issue.assignedTo && (
                    <MetadataItem 
                      icon={<User size={16} />} 
                      label="Assigned To" 
                      value={issue.assignedTo} 
                    />
                  )}
                  {issue.expectedResolutionDate && (
                    <MetadataItem 
                      icon={<Calendar size={16} />} 
                      label="Expected Resolution" 
                      value={new Date(issue.expectedResolutionDate).toLocaleDateString('en-IN')} 
                    />
                  )}
                </div>
              </div>

              {/* Image */}
              {resolveImageUrl(issue.imageUrl) && (
                <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-lg">
                  <img 
                    src={resolveImageUrl(issue.imageUrl)} 
                    alt={issue.title} 
                    className="w-full h-48 sm:h-80 object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
              )}

              {/* Description */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={18} className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Description</h3>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium break-words">
                  {issue.description}
                </p>
              </div>

              {/* Map Section */}
              {issue.lat && issue.lng && (
                <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-lg h-64 sm:h-80 z-0 relative">
                  <MapContainer 
                    center={[issue.lat, issue.lng]} 
                    zoom={15} 
                    scrollWheelZoom={false} 
                    className="w-full h-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[issue.lat, issue.lng]}>
                      <Popup>
                        <div className="font-bold text-slate-900">{issue.category}</div>
                        <div className="text-xs text-slate-600 mt-1">{issue.location}</div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}

              {/* Upvote Section */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <button
                  onClick={handleUpvoteClick}
                  className={`flex items-center gap-3 px-6 py-3 min-h-[48px] rounded-xl font-bold transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-400 outline-none ${
                    hasUpvoted 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                      : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <ThumbsUp size={20} className={hasUpvoted ? 'fill-white' : ''} />
                  {hasUpvoted ? 'Upvoted' : 'Upvote'}
                </button>
                <div className="flex-1">
                  <p className="text-2xl font-black text-slate-900">{issue.upvotes}</p>
                  <p className="text-xs text-slate-500 font-medium">citizens support this issue</p>
                </div>
              </div>

              {/* Timeline / Updates */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <MessageSquare size={20} className="text-blue-500" />
                  <h3 className="text-lg font-bold text-slate-900">Resolution Timeline</h3>
                  {issue.updates && issue.updates.length > 0 && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                      {issue.updates.length} update{issue.updates.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                
                <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {issue.updates && issue.updates.length > 0 ? (
                    issue.updates.map((update, idx) => (
                      <UpdateCard key={update.id || update._id || `update-${idx}`} update={update} isLatest={idx === 0} />
                    ))
                  ) : (
                    <div className="pl-10 text-slate-400 text-sm italic py-8 bg-slate-50 rounded-2xl px-6">
                      <AlertCircle size={20} className="inline mr-2" />
                      No updates yet. Authorities will review this issue soon.
                    </div>
                  )}
                </div>
              </div>

              {/* Staff Actions */}
              {isStaff && issue.status !== 'Resolved' && issue.status !== 'Rejected' && (
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-200 space-y-4 shadow-inner">
                  <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <CheckCircle2 size={20} />
                    Update Issue Status
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {(['In Progress', 'Resolved', 'Rejected'] as IssueStatus[]).map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedStatus(s)}
                        className={`px-4 py-3 min-h-[44px] rounded-xl text-sm font-bold transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-400 outline-none ${
                          selectedStatus === s 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-300' 
                            : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  
                  <textarea
                    placeholder="Provide an update for the citizen (required)..."
                    className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm font-medium"
                    rows={4}
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  
                  <button
                    onClick={handleUpdate}
                    disabled={!newComment.trim()}
                    className="w-full py-4 min-h-[48px] bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 outline-none"
                  >
                    Post Update
                  </button>
                </div>
              )}

              {/* Resolved/Rejected Message */}
              {(issue.status === 'Resolved' || issue.status === 'Rejected') && (
                <div className={`p-6 rounded-3xl border-2 ${
                  issue.status === 'Resolved' 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : 'bg-rose-50 border-rose-200'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    {issue.status === 'Resolved' ? (
                      <CheckCircle2 size={24} className="text-emerald-600" />
                    ) : (
                      <AlertCircle size={24} className="text-rose-600" />
                    )}
                    <h3 className={`text-lg font-bold ${
                      issue.status === 'Resolved' ? 'text-emerald-900' : 'text-rose-900'
                    }`}>
                      {issue.status === 'Resolved' ? 'Issue Resolved' : 'Issue Rejected'}
                    </h3>
                  </div>
                  <p className={`text-sm font-medium ${
                    issue.status === 'Resolved' ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {issue.status === 'Resolved' 
                      ? 'This issue has been successfully resolved by the authorities.' 
                      : 'This issue has been marked as rejected. Check the latest update for details.'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

function MetadataItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
      <div className="text-slate-400 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-700 truncate">{value}</p>
      </div>
    </div>
  );
}

function UpdateCard({ update, isLatest }: { update: IssueUpdate, isLatest: boolean, key?: string }) {
  return (
    <div className="relative pl-10">
      <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white shadow-md flex items-center justify-center ${
        update.status === 'Resolved' ? 'bg-emerald-500 text-white' :
        update.status === 'In Progress' ? 'bg-blue-500 text-white' :
        update.status === 'Rejected' ? 'bg-rose-500 text-white' :
        'bg-amber-500 text-white'
      }`}>
        {update.status === 'Resolved' ? <CheckCircle2 size={14} /> : <Timer size={14} />}
      </div>
      
      <div className={`bg-white border-2 p-5 rounded-2xl shadow-sm ${
        isLatest ? 'border-blue-200 shadow-blue-100' : 'border-slate-100'
      }`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-bold text-slate-900 text-sm mb-1">{update.updatedBy}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {new Date(update.updatedAt).toLocaleString('en-IN', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          {isLatest && (
            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
              Latest
            </span>
          )}
        </div>
        
        <p className="text-slate-600 text-sm font-medium leading-relaxed mb-3">
          {update.comment}
        </p>
        
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[update.status]}`}>
          Status: {update.status}
        </div>

        {resolveImageUrl(update.imageUrl) && (
          <div className="mt-4 rounded-xl overflow-hidden border border-slate-200">
            <img 
              src={resolveImageUrl(update.imageUrl)} 
              alt="Update" 
              className="w-full h-48 object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>
    </div>
  );
}