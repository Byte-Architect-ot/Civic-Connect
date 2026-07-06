import React from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Clock,
  ThumbsUp,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Timer,
  User,
  Zap,
  Layers
} from 'lucide-react';
import { CivicIssue, IssueStatus, IssuePriority } from '../types';
import { resolveImageUrl } from '../api';

interface IssueCardProps {
  issue: CivicIssue;
  currentUserId: string;
  onClick: (issue: CivicIssue) => void;
  onUpvote: (issueId: string) => void;
}

const statusColors: Record<IssueStatus, string> = {
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  Resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Rejected: 'bg-rose-100 text-rose-700 border-rose-200',
};

const statusIcons: Record<IssueStatus, React.ReactNode> = {
  Pending: <AlertCircle size={14} />,
  'In Progress': <Timer size={14} />,
  Resolved: <CheckCircle2 size={14} />,
  Rejected: <AlertCircle size={14} />,
};

const priorityColors: Record<IssuePriority, string> = {
  Low: 'bg-slate-100 text-slate-600',
  Medium: 'bg-blue-100 text-blue-600',
  High: 'bg-orange-100 text-orange-600',
  Critical: 'bg-rose-100 text-rose-600',
};

function getUrgencyColor(score?: number): string {
  if (!score || score <= 0) return 'bg-slate-100 text-slate-600';
  if (score >= 80) return 'bg-rose-100 text-rose-700';
  if (score >= 60) return 'bg-orange-100 text-orange-700';
  if (score >= 40) return 'bg-blue-100 text-blue-700';
  return 'bg-slate-100 text-slate-700';
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  currentUserId,
  onClick,
  onUpvote
}) => {
  const hasUpvoted = issue.upvotedBy?.includes(currentUserId);
  const timeAgo = getTimeAgo(issue.reportedAt);
  const resolvedImageUrl = resolveImageUrl(issue.imageUrl);
  const hasImage = !!resolvedImageUrl;

  const handleUpvoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpvote(issue.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={() => onClick(issue)}
      className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      {hasImage && (
        <div className="relative h-40 md:h-48 overflow-hidden bg-slate-100">
          <img
            src={resolvedImageUrl}
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 right-3 flex gap-2 flex-wrap justify-end">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${priorityColors[issue.priority]}`}>
              {issue.priority}
            </span>

            {typeof issue.urgencyScore === 'number' && issue.urgencyScore > 0 && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getUrgencyColor(issue.urgencyScore)}`}
              >
                <Zap size={12} />
                Urgency {Math.round(issue.urgencyScore)}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-3 sm:p-4 md:p-5 space-y-2.5 sm:space-y-3 md:space-y-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusColors[issue.status]}`}
              >
                {statusIcons[issue.status]}
                {issue.status}
              </span>

              {!hasImage && (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${priorityColors[issue.priority]}`}>
                  {issue.priority}
                </span>
              )}

              {!hasImage && typeof issue.urgencyScore === 'number' && issue.urgencyScore > 0 && (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getUrgencyColor(issue.urgencyScore)}`}
                >
                  <Zap size={10} />
                  Urgency {Math.round(issue.urgencyScore)}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
              {issue.title}
            </h3>

            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {issue.category}
              </p>

              {issue.mlCategory && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  ML Category: {issue.mlCategory}
                </span>
              )}

              {issue.mlPriority && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                  ML Priority: {issue.mlPriority}
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
          {issue.description}
        </p>

        {(issue.clusterSize ?? 0) > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2 flex items-center gap-2">
            <Layers size={14} className="text-amber-700 shrink-0" />
            <span className="text-xs font-bold text-amber-700">
              {issue.clusterSize} nearby similar report{issue.clusterSize && issue.clusterSize > 1 ? 's' : ''}
            </span>
          </div>
        )}

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <MapPin size={14} className="text-slate-400 shrink-0" />
            <span className="truncate font-medium">{issue.location}</span>
          </div>

          <div className="flex items-center justify-between text-slate-500 text-xs">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-400" />
              <span className="font-medium">{timeAgo}</span>
            </div>

            {issue.assignedTo && (
              <div className="flex items-center gap-1 text-blue-600">
                <User size={12} />
                <span className="text-xs font-bold truncate flex-1 min-w-0">
                  {issue.assignedTo}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={handleUpvoteClick}
            className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl font-bold text-sm transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-400 outline-none ${
              hasUpvoted
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-300'
            }`}
          >
            <ThumbsUp size={16} className={hasUpvoted ? 'fill-blue-600' : ''} />
            {issue.upvotes}
          </button>

          <div className="flex items-center gap-2 text-blue-600 text-sm font-bold group-hover:translate-x-1 transition-transform">
            View Details <ChevronRight size={16} />
          </div>
        </div>

        {issue.updates && issue.updates.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="font-medium">
                {issue.updates.length} update{issue.updates.length > 1 ? 's' : ''} available
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}