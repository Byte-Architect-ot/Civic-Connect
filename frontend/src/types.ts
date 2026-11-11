export type IssueStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';

export type IssueCategory =
  | 'Roads'
  | 'Garbage'
  | 'Water'
  | 'Electricity'
  | 'Public Health'
  | 'Others';

export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  location: string;
  lat: number;
  lng: number;
  reportedBy: string;
  reportedAt: string;
  upvotes: number;
  imageUrl?: string;
  updates?: IssueUpdate[];
  assignedTo?: string;
  expectedResolutionDate?: string;
  upvotedBy?: string[];
  reportedByUserId?: string;

  // ML-related fields
  mlCategory?: string;
  mlPriority?: string;
  mlConfidence?: number;
  urgencyScore?: number;
  clusterSize?: number;
  duplicateOf?: string[];
  clusterId?: string;
}

export interface IssueUpdate {
  id?: string;
  _id?: string;
  status: IssueStatus;
  comment: string;
  updatedAt: string;
  updatedBy: string;
  imageUrl?: string;
}

export type UserRole = 'Citizen' | 'Staff' | 'Admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email: string;
  phone?: string;
  address?: string;
  joinedAt?: string;
  reportsCount?: number;
  resolvedCount?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'StatusUpdate' | 'NewIssue' | 'System' | 'Upvote' | 'Comment';
  timestamp: string;
  isRead: boolean;
  issueId?: string;
  priority?: 'Normal' | 'High';
}

export interface FilterOptions {
  category: IssueCategory | 'All';
  status: IssueStatus | 'All';
  priority: IssuePriority | 'All';
  dateRange: 'All' | 'Today' | 'Week' | 'Month';
  sortBy: 'date' | 'upvotes' | 'priority' | 'urgency';
}

export interface MLSuggestion {
  category: string;
  category_confidence: number;
  priority: string;
  priority_confidence: number;
  analysis?: {
    category_breakdown?: Record<string, number>;
    severity_indicators?: Record<string, number>;
  };
}

export interface DuplicateWarning {
  message: string;
  duplicates: Array<{
    id: string;
    distance_km: number;
    title: string;
  }>;
}

export interface MLDuplicateCheckResult {
  hasDuplicates: boolean;
  duplicates: Array<{
    id: string;
    distance_km: number;
    title: string;
  }>;
  count: number;
}

export interface MLClusterResult {
  clusters: Record<string, string[]>;
  totalClusters: number;
  clusteredIssues: number;
}

export interface MLUrgencyResult {
  urgency_score: number;
  level: 'Immediate' | 'High' | 'Medium' | 'Low';
  breakdown: {
    priority: number;
    upvotes: number;
    age: number;
    cluster_size: number;
    status: number;
  };
}

export interface MLRankedIssue {
  id: string;
  urgencyScore: number;
  urgencyLevel: string;
}

export interface MLRankedResult {
  rankedIssues: MLRankedIssue[];
  total: number;
}

export interface IssueSubmissionData {
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  location: string;
  lat?: number;
  lng?: number;
  imageFile?: File | null;
  mlSuggestions?: MLSuggestion | null;
}