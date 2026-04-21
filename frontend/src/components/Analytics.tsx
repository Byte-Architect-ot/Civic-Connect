import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, TrendingUp, TrendingDown, Calendar, 
  CheckCircle2, Clock, AlertCircle, Users, MapPin,
  PieChart, Activity, Award
} from 'lucide-react';
import { CivicIssue, User, IssueCategory } from '../types';

interface AnalyticsProps {
  issues: CivicIssue[];
  currentUser: User;
}

export const Analytics: React.FC<AnalyticsProps> = ({ issues, currentUser }) => {
  const analytics = useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    // Overall stats
    const totalIssues = issues.length;
    const resolvedIssues = issues.filter(i => i.status === 'Resolved').length;
    const pendingIssues = issues.filter(i => i.status === 'Pending').length;
    const inProgressIssues = issues.filter(i => i.status === 'In Progress').length;
    
    // Time-based stats
    const thisMonthIssues = issues.filter(i => new Date(i.reportedAt) >= lastMonth).length;
    const thisWeekIssues = issues.filter(i => new Date(i.reportedAt) >= lastWeek).length;
    
    // Category breakdown
    const categoryStats = issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {} as Record<IssueCategory, number>);

    // Priority breakdown
    const priorityStats = {
      Critical: issues.filter(i => i.priority === 'Critical').length,
      High: issues.filter(i => i.priority === 'High').length,
      Medium: issues.filter(i => i.priority === 'Medium').length,
      Low: issues.filter(i => i.priority === 'Low').length,
    };

    // Resolution rate
    const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
    
    // Average resolution time (mock calculation)
    const resolvedWithUpdates = issues.filter(i => i.status === 'Resolved' && i.updates && i.updates.length > 0);
    const avgResolutionDays = resolvedWithUpdates.length > 0
      ? Math.round(
          resolvedWithUpdates.reduce((acc, issue) => {
            const reportDate = new Date(issue.reportedAt);
            const resolveDate = new Date(issue.updates![0].updatedAt);
            const days = Math.floor((resolveDate.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24));
            return acc + days;
          }, 0) / resolvedWithUpdates.length
        )
      : 0;

    // Top locations
    const locationStats = issues.reduce((acc, issue) => {
      const location = issue.location.split(',')[0].trim();
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topLocations = Object.entries(locationStats)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 5);

    // Engagement metrics
    const totalUpvotes = issues.reduce((sum, i) => sum + i.upvotes, 0);
    const avgUpvotes = totalIssues > 0 ? Math.round(totalUpvotes / totalIssues) : 0;
    const mostUpvoted = issues.sort((a, b) => b.upvotes - a.upvotes)[0];

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
      mostUpvoted
    };
  }, [issues]);

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<BarChart3 size={24} />}
          label="Total Issues"
          value={analytics.totalIssues}
          trend={`+${analytics.thisMonthIssues} this month`}
          color="blue"
        />
        <MetricCard
          icon={<CheckCircle2 size={24} />}
          label="Resolution Rate"
          value={`${analytics.resolutionRate}%`}
          trend={`${analytics.resolvedIssues} resolved`}
          color="emerald"
        />
        <MetricCard
          icon={<Clock size={24} />}
          label="Avg Resolution Time"
          value={`${analytics.avgResolutionDays}d`}
          trend="Average turnaround"
          color="indigo"
        />
        <MetricCard
          icon={<TrendingUp size={24} />}
          label="Total Upvotes"
          value={analytics.totalUpvotes}
          trend={`${analytics.avgUpvotes} avg per issue`}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PieChart size={20} className="text-blue-600" />
              Status Distribution
            </h3>
          </div>
          <div className="space-y-4">
            <ProgressBar 
              label="Resolved" 
              value={analytics.resolvedIssues} 
              total={analytics.totalIssues} 
              color="emerald"
              icon={<CheckCircle2 size={16} />}
            />
            <ProgressBar 
              label="In Progress" 
              value={analytics.inProgressIssues} 
              total={analytics.totalIssues} 
              color="blue"
              icon={<Activity size={16} />}
            />
            <ProgressBar 
              label="Pending" 
              value={analytics.pendingIssues} 
              total={analytics.totalIssues} 
              color="amber"
              icon={<Clock size={16} />}
            />
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle size={20} className="text-rose-600" />
              Priority Levels
            </h3>
          </div>
          <div className="space-y-4">
            <ProgressBar 
              label="Critical" 
              value={analytics.priorityStats.Critical} 
              total={analytics.totalIssues} 
              color="rose"
              icon={<AlertCircle size={16} />}
            />
            <ProgressBar 
              label="High" 
              value={analytics.priorityStats.High} 
              total={analytics.totalIssues} 
              color="orange"
              icon={<TrendingUp size={16} />}
            />
            <ProgressBar 
              label="Medium" 
              value={analytics.priorityStats.Medium} 
              total={analytics.totalIssues} 
              color="blue"
              icon={<Activity size={16} />}
            />
            <ProgressBar 
              label="Low" 
              value={analytics.priorityStats.Low} 
              total={analytics.totalIssues} 
              color="slate"
              icon={<TrendingDown size={16} />}
            />
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <BarChart3 size={20} className="text-blue-600" />
          Issues by Category
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(analytics.categoryStats).map(([category, count]) => (
            <CategoryCard key={category} category={category as IssueCategory} count={count as number} />
          ))}
        </div>
      </div>

      {/* Top Locations */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <MapPin size={20} className="text-blue-600" />
          Most Reported Locations
        </h3>
        <div className="space-y-3">
          {analytics.topLocations.map(([location, count], index) => (
            <LocationItem key={location} location={location} count={count as number} rank={index + 1} />
          ))}
        </div>
      </div>

      {/* Most Engaged Issue */}
      {analytics.mostUpvoted && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-purple-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
            <Award size={20} />
            Most Community Engagement
          </h3>
          <div className="bg-white rounded-2xl p-5 border border-purple-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 mb-1">{analytics.mostUpvoted.title}</h4>
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  <MapPin size={14} />
                  {analytics.mostUpvoted.location}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-purple-600">{analytics.mostUpvoted.upvotes}</p>
                <p className="text-xs font-bold text-purple-500 uppercase">Upvotes</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-bold">
                {analytics.mostUpvoted.category}
              </span>
              <span className={`px-3 py-1 rounded-full font-bold ${
                analytics.mostUpvoted.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                analytics.mostUpvoted.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {analytics.mostUpvoted.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Activity size={20} className="text-blue-600" />
          Recent Activity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActivityStat
            label="This Week"
            value={analytics.thisWeekIssues}
            icon={<Calendar size={20} />}
            color="blue"
          />
          <ActivityStat
            label="This Month"
            value={analytics.thisMonthIssues}
            icon={<Calendar size={20} />}
            color="indigo"
          />
          <ActivityStat
            label="Active Users"
            value={new Set(issues.map(i => i.reportedBy)).size}
            icon={<Users size={20} />}
            color="purple"
          />
        </div>
      </div>
    </div>
  );
};

function MetricCard({ 
  icon, 
  label, 
  value, 
  trend, 
  color 
}: { 
  icon: React.ReactNode, 
  label: string, 
  value: string | number, 
  trend: string,
  color: 'blue' | 'emerald' | 'indigo' | 'purple' 
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-lg transition-all"
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}>
        {icon}
      </div>
      <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900 mb-2">{value}</p>
      <p className="text-xs text-slate-500 font-medium">{trend}</p>
    </motion.div>
  );
}

function ProgressBar({ 
  label, 
  value, 
  total, 
  color,
  icon 
}: { 
  label: string, 
  value: number, 
  total: number, 
  color: 'emerald' | 'blue' | 'amber' | 'rose' | 'orange' | 'slate',
  icon: React.ReactNode
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
        <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
          {icon}
          {label}
        </span>
        <span className="text-sm font-black text-slate-900">{value} ({percentage}%)</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${colors[color]} rounded-full`}
        />
      </div>
    </div>
  );
}

function CategoryCard({ category, count }: { category: IssueCategory, count: number, key?: string }) {
  const categoryIcons = {
    'Roads': '🛣️',
    'Garbage': '🗑️',
    'Water': '💧',
    'Electricity': '⚡',
    'Public Health': '🏥',
    'Others': '📋'
  };

  return (
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
      <div className="text-3xl mb-2">{categoryIcons[category]}</div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{category}</p>
      <p className="text-2xl font-black text-slate-900">{count}</p>
    </div>
  );
}

function LocationItem({ location, count, rank }: { location: string, count: number, rank: number, key?: string }) {
  const medalColors = {
    1: 'bg-amber-100 text-amber-700 border-amber-200',
    2: 'bg-slate-200 text-slate-700 border-slate-300',
    3: 'bg-orange-100 text-orange-700 border-orange-200',
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black border-2 ${
        rank <= 3 ? medalColors[rank as 1 | 2 | 3] : 'bg-slate-100 text-slate-500 border-slate-200'
      }`}>
        #{rank}
      </div>
      <div className="flex-1">
        <p className="font-bold text-slate-900">{location}</p>
        <p className="text-xs text-slate-500 font-medium">{count} issue{count !== 1 ? 's' : ''} reported</p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-black text-slate-900">{count}</p>
      </div>
    </div>
  );
}

function ActivityStat({ 
  label, 
  value, 
  icon, 
  color 
}: { 
  label: string, 
  value: number, 
  icon: React.ReactNode,
  color: 'blue' | 'indigo' | 'purple'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className={`p-5 rounded-2xl border ${colors[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <span className="text-sm font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-4xl font-black">{value}</p>
    </div>
  );
}