import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  MapPin,
  PieChart,
  Activity,
  Award,
  Map,
  Trash2,
  Droplets,
  Zap,
  HeartPulse,
  FileText,
  Brain,
  Layers
} from 'lucide-react';
import { CivicIssue, User, IssueCategory } from '../types';

interface AnalyticsProps {
  issues: CivicIssue[];
  currentUser: User;
}

export const Analytics: React.FC<AnalyticsProps> = ({ issues }) => {
  const analytics = useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    /* Basic stats */
    const totalIssues = issues.length;
    const resolvedIssues = issues.filter(i => i.status === 'Resolved').length;
    const pendingIssues = issues.filter(i => i.status === 'Pending').length;
    const inProgressIssues = issues.filter(i => i.status === 'In Progress').length;

    /* Time-based stats */
    const thisMonthIssues = issues.filter(i => new Date(i.reportedAt) >= lastMonth).length;
    const thisWeekIssues = issues.filter(i => new Date(i.reportedAt) >= lastWeek).length;

    /* Category distribution */
    const categoryStats = issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {} as Record<IssueCategory, number>);

    /* Priority distribution */
    const priorityStats = {
      Critical: issues.filter(i => i.priority === 'Critical').length,
      High: issues.filter(i => i.priority === 'High').length,
      Medium: issues.filter(i => i.priority === 'Medium').length,
      Low: issues.filter(i => i.priority === 'Low').length,
    };

    /* Resolution metrics */
    const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
    
    const resolvedWithUpdates = issues.filter(
      i => i.status === 'Resolved' && i.updates && i.updates.length > 0
    );

    const avgResolutionDays =
      resolvedWithUpdates.length > 0
        ? Math.round(
            resolvedWithUpdates.reduce((acc, issue) => {
              const reportDate = new Date(issue.reportedAt);
              const resolveDate = new Date(issue.updates![0].updatedAt);
              const days = Math.floor(
                (resolveDate.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24)
              );
              return acc + days;
            }, 0) / resolvedWithUpdates.length
          )
        : 0;

    /* Location stats */
    const locationStats = issues.reduce((acc, issue) => {
      const location = issue.location.split(',')[0].trim() || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topLocations = Object.entries(locationStats)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 5);

    /* Engagement metrics */
    const totalUpvotes = issues.reduce((sum, i) => sum + i.upvotes, 0);
    const avgUpvotes = totalIssues > 0 ? Math.round(totalUpvotes / totalIssues) : 0;
    const mostUpvoted = [...issues].sort((a, b) => b.upvotes - a.upvotes)[0];

    /* ML-specific metrics */
    const issuesWithUrgency = issues.filter(i => typeof i.urgencyScore === 'number');
    const avgUrgency =
      issuesWithUrgency.length > 0
        ? Math.round(
            issuesWithUrgency.reduce((sum, i) => sum + (i.urgencyScore || 0), 0) /
              issuesWithUrgency.length
          )
        : 0;

    const highUrgencyCount = issues.filter(i => (i.urgencyScore || 0) >= 60).length;
    const clusteredIssuesCount = issues.filter(i => (i.clusterSize || 0) > 0).length;
    const mlClassifiedCount = issues.filter(i => !!i.mlCategory || !!i.mlPriority).length;

    return {
      totalIssues,
      resolvedIssues,
      pendingIssues,
      inProgressIssues,
      thisMonthIssues,
      thisWeekIssues,
      categoryStats,
      priorityStats,
      resolutionRate,
      avgResolutionDays,
      topLocations,
      totalUpvotes,
      avgUpvotes,
      mostUpvoted,
      avgUrgency,
      highUrgencyCount,
      clusteredIssuesCount,
      mlClassifiedCount
    };
  }, [issues]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold">Analytics Dashboard</h2>
        <p className="text-slate-500 mt-1">
          Overview of civic issues and ML-driven insights
        </p>
      </div>

      {/* ML Insights Section */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 p-6">
        <h3 className="text-base font-display font-bold mb-4 flex items-center gap-2">
          <Brain size={18} className="text-slate-600" />
          ML Insights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={<Zap size={20} />}
            label="Average Urgency"
            value={analytics.avgUrgency}
            trend="ML-calculated score"
          />
          <MetricCard
            icon={<AlertCircle size={20} />}
            label="High Urgency"
            value={analytics.highUrgencyCount}
            trend="Score 60 or above"
          />
          <MetricCard
            icon={<Layers size={20} />}
            label="Clustered Reports"
            value={analytics.clusteredIssuesCount}
            trend="Similar nearby issues"
          />
          <MetricCard
            icon={<Brain size={20} />}
            label="ML Classified"
            value={analytics.mlClassifiedCount}
            trend="AI-suggested labels"
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<BarChart3 size={20} />}
          label="Total Issues"
          value={analytics.totalIssues}
          trend={`+${analytics.thisMonthIssues} this month`}
        />
        <MetricCard
          icon={<CheckCircle2 size={20} />}
          label="Resolution Rate"
          value={`${analytics.resolutionRate}%`}
          trend={`${analytics.resolvedIssues} resolved`}
        />
        <MetricCard
          icon={<Clock size={20} />}
          label="Avg Resolution"
          value={`${analytics.avgResolutionDays}d`}
          trend="Average turnaround"
        />
        <MetricCard
          icon={<TrendingUp size={20} />}
          label="Total Upvotes"
          value={analytics.totalUpvotes}
          trend={`${analytics.avgUpvotes} avg per issue`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Distribution */}
        <div className="bg-white rounded-3xl border-2 border-slate-100 p-6">
          <h3 className="text-base font-display font-bold mb-4 flex items-center gap-2">
            <PieChart size={18} className="text-slate-600" />
            Status Distribution
          </h3>
          <div className="space-y-4">
            <ProgressBar label="Resolved" value={analytics.resolvedIssues} total={analytics.totalIssues} color="emerald" />
            <ProgressBar label="In Progress" value={analytics.inProgressIssues} total={analytics.totalIssues} color="blue" />
            <ProgressBar label="Pending" value={analytics.pendingIssues} total={analytics.totalIssues} color="amber" />
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-3xl border-2 border-slate-100 p-6">
          <h3 className="text-base font-display font-bold mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-slate-600" />
            Priority Levels
          </h3>
          <div className="space-y-4">
            <ProgressBar label="Critical" value={analytics.priorityStats.Critical} total={analytics.totalIssues} color="rose" />
            <ProgressBar label="High" value={analytics.priorityStats.High} total={analytics.totalIssues} color="orange" />
            <ProgressBar label="Medium" value={analytics.priorityStats.Medium} total={analytics.totalIssues} color="blue" />
            <ProgressBar label="Low" value={analytics.priorityStats.Low} total={analytics.totalIssues} color="slate" />
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 p-6">
        <h3 className="text-base font-display font-bold mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-slate-600" />
          Issues by Category
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(analytics.categoryStats).map(([category, count]) => (
            <CategoryCard
              key={category}
              category={category as IssueCategory}
              count={count as number}
            />
          ))}
        </div>
      </div>

      {/* Location & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Locations */}
        <div className="bg-white rounded-3xl border-2 border-slate-100 p-6">
          <h3 className="text-base font-display font-bold mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-slate-600" />
            Top Locations
          </h3>
          <div className="space-y-2">
            {analytics.topLocations.map(([location, count], index) => (
              <LocationItem
                key={location}
                location={location}
                count={count as number}
                rank={index + 1}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl border-2 border-slate-100 p-6">
          <h3 className="text-base font-display font-bold mb-4 flex items-center gap-2">
            <Activity size={18} className="text-slate-600" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <ActivityStat label="This Week" value={analytics.thisWeekIssues} icon={<Calendar size={18} />} />
            <ActivityStat label="This Month" value={analytics.thisMonthIssues} icon={<Calendar size={18} />} />
            <ActivityStat label="Active Users" value={new Set(issues.map(i => i.reportedBy)).size} icon={<Users size={18} />} />
          </div>
        </div>
      </div>

      {/* Top Issue */}
      {analytics.mostUpvoted && (
        <div className="bg-white rounded-3xl border-2 border-slate-100 p-6">
          <h3 className="text-base font-display font-bold mb-4 flex items-center gap-2">
            <Award size={18} className="text-slate-600" />
            Top Community Issue
          </h3>
          <div className="bg-slate-50 rounded-2xl p-5 border-2 border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 mb-2">{analytics.mostUpvoted.title}</h4>
              <p className="text-sm text-slate-500 flex items-center gap-1 mb-3">
                <MapPin size={14} />
                {analytics.mostUpvoted.location}
              </p>

              <div className="flex gap-2 flex-wrap">
                {typeof analytics.mostUpvoted.urgencyScore === 'number' && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 border border-violet-200">
                    Urgency: {Math.round(analytics.mostUpvoted.urgencyScore)}
                  </span>
                )}
                {(analytics.mostUpvoted.clusterSize || 0) > 0 && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                    Cluster: {analytics.mostUpvoted.clusterSize}
                  </span>
                )}
                {analytics.mostUpvoted.mlCategory && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                    ML: {analytics.mostUpvoted.mlCategory}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {analytics.mostUpvoted.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  analytics.mostUpvoted.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  analytics.mostUpvoted.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {analytics.mostUpvoted.status}
                </span>
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-4xl font-display font-bold text-slate-900">
                {analytics.mostUpvoted.upvotes}
              </p>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Upvotes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Metric card component */
function MetricCard({
  icon,
  label,
  value,
  trend
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend: string;
}) {
  return (
    <div className="bg-white rounded-3xl border-2 border-slate-100 p-5 hover:border-slate-200 hover:shadow-soft transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{label}</p>
          <p className="text-3xl font-display font-bold text-slate-900 mb-1">{value}</p>
          <p className="text-xs text-slate-400">{trend}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* Progress bar component */
function ProgressBar({
  label,
  value,
  total,
  color
}: {
  label: string;
  value: number;
  total: number;
  color: 'emerald' | 'blue' | 'amber' | 'rose' | 'orange' | 'slate';
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  const colors = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    orange: 'bg-orange-500',
    slate: 'bg-slate-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-sm font-semibold text-slate-900">
          {value} ({percentage}%)
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          style={{ width: `${percentage}%` }}
          className={`h-full ${colors[color]} rounded-full transition-all duration-500`}
        />
      </div>
    </div>
  );
}

/* Category card component */
function CategoryCard({
  category,
  count
}: {
  category: IssueCategory;
  count: number;
}) {
  const categoryIcons: Record<IssueCategory, React.ReactNode> = {
    Roads: <Map size={20} className="text-blue-500" />,
    Garbage: <Trash2 size={20} className="text-emerald-500" />,
    Water: <Droplets size={20} className="text-cyan-500" />,
    Electricity: <Zap size={20} className="text-amber-500" />,
    'Public Health': <HeartPulse size={20} className="text-rose-500" />,
    Others: <FileText size={20} className="text-slate-500" />
  };

  return (
    <div className="bg-white rounded-2xl p-4 border-2 border-slate-100 hover:border-slate-200 hover:shadow-soft transition-all">
      <div className="mb-3 p-2 bg-slate-50 rounded-xl inline-block">
        {categoryIcons[category]}
      </div>
      <p className="text-xs text-slate-500 mb-1">{category}</p>
      <p className="text-2xl font-display font-bold text-slate-900">{count}</p>
    </div>
  );
}

/* Location item component */
function LocationItem({
  location,
  count,
  rank
}: {
  location: string;
  count: number;
  rank: number;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
      <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
        {rank}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800">{location}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-slate-900">{count}</p>
      </div>
    </div>
  );
}

/* Activity stat component */
function ActivityStat({
  label,
  value,
  icon
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
      <div className="flex items-center gap-2 mb-2 text-slate-600">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-3xl font-display font-bold text-slate-900">{value}</p>
    </div>
  );
}