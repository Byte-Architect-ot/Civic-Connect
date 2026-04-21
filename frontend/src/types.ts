export type IssueStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';

export type IssueCategory = 'Roads' | 'Garbage' | 'Water' | 'Electricity' | 'Public Health' | 'Others';

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
}

export interface IssueUpdate {
  id: string;
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
  sortBy: 'date' | 'upvotes' | 'priority';
}