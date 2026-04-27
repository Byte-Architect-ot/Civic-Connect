import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutDashboard, 
  ClipboardList, 
  User as UserIcon, 
  LogOut, 
  Bell, 
  Settings as SettingsIcon,
  Menu,
  X,
  MapPin,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Map as MapIcon,
  BarChart3,
  Download,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { CivicIssue, IssueStatus, User, IssueCategory, Notification, FilterOptions, IssuePriority } from './types';
import { MOCK_NOTIFICATIONS } from './mockData';
import { IssueCard } from './components/IssueCard';
import { ReportForm } from './components/ReportForm';
import { IssueDetail } from './components/IssueDetail';
import { MapView } from './components/MapView';
import { Notifications } from './components/Notifications';
import { Settings } from './components/Settings';
import { LandingPage } from './components/LandingPage';
import { Analytics } from './components/Analytics';
import { FilterPanel } from './components/FilterPanel';
import { 
  apiGetAllHazards, 
  apiGetMyHazards, 
  apiCreateHazard, 
  apiUpdateHazardStatus, 
  apiToggleUpvote, 
  apiLogout, 
  apiGetMe, 
  hasToken 
} from './api';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './components/LanguageSelector';

type View = 'Dashboard' | 'MyReports' | 'MapView' | 'Notifications' | 'Settings' | 'Analytics';

export default function App() {
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('nagriksetu_notifications');
    return saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS;
  });
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  // Persist notifications
  useEffect(() => {
    localStorage.setItem('nagriksetu_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Fetch hazards from backend
  const fetchHazards = useCallback(async () => {
    if (!isLoggedIn) return;
    setIsLoadingData(true);
    try {
      const data = await apiGetAllHazards();
      setIssues(data);
    } catch (error) {
      console.error('Failed to fetch hazards:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [isLoggedIn]);

  // Restore session on mount if JWT exists
  useEffect(() => {
    const restoreSession = async () => {
      if (hasToken()) {
        try {
          const backendUser = await apiGetMe();
          const frontendUser: User = {
            id: backendUser.id || backendUser._id,
            name: backendUser.name,
            role: backendUser.role === 'admin' ? 'Staff' : 'Citizen',
            avatar: backendUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${backendUser.name}`,
            email: backendUser.email,
            phone: backendUser.phone || undefined,
            address: backendUser.address || undefined,
            joinedAt: backendUser.joinedAt || backendUser.createdAt,
            reportsCount: 0,
            resolvedCount: 0
          };
          setCurrentUser(frontendUser);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Session restoration failed:', error);
          apiLogout();
        }
      }
      setIsRestoringSession(false);
    };
    restoreSession();
  }, []);

  // Fetch hazards when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchHazards();
    }
  }, [isLoggedIn, fetchHazards]);

  // Simulated Real-time Feed (notifications only)
  useEffect(() => {
    if (!isLoggedIn || !currentUser) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        const newNotif: Notification = {
          id: `n${Date.now()}`,
          title: 'Community Activity',
          message: 'A new issue has been reported in your area. Stay informed!',
          type: 'System',
          timestamp: new Date().toISOString(),
          isRead: false,
          priority: 'Normal'
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [isLoggedIn, currentUser]);

  const [currentView, setCurrentView] = useState<View>('Dashboard');
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'All',
    status: 'All',
    priority: 'All',
    dateRange: 'All',
    sortBy: 'date'
  });

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setCurrentView('Dashboard');
  };

  const handleLogout = () => {
    apiLogout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIssues([]);
    setCurrentView('Dashboard');
    setSearchQuery('');
    setFilters({
      category: 'All',
      status: 'All',
      priority: 'All',
      dateRange: 'All',
      sortBy: 'date'
    });
  };

  const filteredIssues = useMemo(() => {
    let baseIssues = issues;
    
    // Filter by view: "My Reports" shows only current user's reports
    if (currentView === 'MyReports' && currentUser) {
      baseIssues = issues.filter(i => i.reportedBy === currentUser.name);
    }
    
    // Filter by search query
    baseIssues = baseIssues.filter(issue => {
      const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           issue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           issue.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    if (filters.category !== 'All') {
      baseIssues = baseIssues.filter(issue => issue.category === filters.category);
    }

    if (filters.status !== 'All') {
      baseIssues = baseIssues.filter(issue => issue.status === filters.status);
    }

    if (filters.priority !== 'All') {
      baseIssues = baseIssues.filter(issue => issue.priority === filters.priority);
    }

    if (filters.dateRange !== 'All') {
      const now = new Date();
      const filterDate = new Date();
      
      switch(filters.dateRange) {
        case 'Today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'Week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'Month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      baseIssues = baseIssues.filter(issue => new Date(issue.reportedAt) >= filterDate);
    }

    baseIssues = [...baseIssues].sort((a, b) => {
      switch(filters.sortBy) {
        case 'upvotes':
          return b.upvotes - a.upvotes;
        case 'priority':
          const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'date':
        default:
          return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
      }
    });

    return baseIssues;
  }, [issues, searchQuery, filters, currentView, currentUser]);

  const stats = useMemo(() => {
    if (!currentUser) return { total: 0, resolved: 0, pending: 0, inProgress: 0, critical: 0, resolutionRate: 0 };

    const userIssues = currentUser.role === 'Citizen' 
      ? issues.filter(i => i.reportedBy === currentUser.name)
      : issues;

    return {
      total: userIssues.length,
      resolved: userIssues.filter(i => i.status === 'Resolved').length,
      pending: userIssues.filter(i => i.status === 'Pending').length,
      inProgress: userIssues.filter(i => i.status === 'In Progress').length,
      critical: userIssues.filter(i => i.priority === 'Critical').length,
      resolutionRate: userIssues.length > 0 
        ? Math.round((userIssues.filter(i => i.status === 'Resolved').length / userIssues.length) * 100)
        : 0
    };
  }, [issues, currentUser]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleReportSubmit = async (data: any) => {
    if (!currentUser) return;
    try {
      const newHazard = await apiCreateHazard({
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        location: data.location,
        imageFile: data.imageFile
      });

      // Add to local state immediately
      setIssues(prev => [newHazard, ...prev]);
      setIsReportFormOpen(false);
      
      const newNotif: Notification = {
        id: `n${Date.now()}`,
        title: 'Report Submitted Successfully',
        message: `Your report "${newHazard.title}" has been submitted and is under review.`,
        type: 'NewIssue',
        timestamp: new Date().toISOString(),
        isRead: false,
        issueId: newHazard.id,
        priority: newHazard.priority === 'Critical' || newHazard.priority === 'High' ? 'High' : 'Normal'
      };
      setNotifications(prev => [newNotif, ...prev]);
    } catch (error: any) {
      alert('Failed to submit report: ' + (error.message || 'Unknown error'));
    }
  };

  const handleUpdateStatus = async (issueId: string, newStatus: IssueStatus, comment: string) => {
    if (!currentUser) return;
    try {
      const updatedHazard = await apiUpdateHazardStatus(issueId, newStatus, comment);
      
      setIssues(prev => prev.map(issue => {
        if (issue.id === issueId) {
          const updated = { ...updatedHazard };
          if (selectedIssue?.id === issueId) {
            setSelectedIssue(updated);
          }
          return updated;
        }
        return issue;
      }));

      const issue = issues.find(i => i.id === issueId);
      const newNotif: Notification = {
        id: `n${Date.now()}`,
        title: 'Issue Status Updated',
        message: `"${issue?.title || 'Issue'}" status changed to ${newStatus}.`,
        type: 'StatusUpdate',
        timestamp: new Date().toISOString(),
        isRead: false,
        issueId: issueId,
        priority: newStatus === 'Resolved' ? 'High' : 'Normal'
      };
      setNotifications(prev => [newNotif, ...prev]);
    } catch (error: any) {
      alert('Failed to update status: ' + (error.message || 'Unknown error'));
    }
  };

  const handleUpvote = async (issueId: string) => {
    if (!currentUser) return;
    try {
      const updatedHazard = await apiToggleUpvote(issueId);
      
      setIssues(prev => prev.map(issue => {
        if (issue.id === issueId) {
          if (selectedIssue?.id === issueId) {
            setSelectedIssue(updatedHazard);
          }
          return updatedHazard;
        }
        return issue;
      }));
    } catch (error: any) {
      console.error('Upvote failed:', error);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const exportData = () => {
    const data = {
      issues: filteredIssues,
      stats,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nagriksetu-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const renderContent = () => {
    switch (currentView) {
      case 'MapView':
        return <MapView issues={filteredIssues} onIssueClick={setSelectedIssue} />;
      case 'Notifications':
        return (
          <Notifications 
            notifications={notifications} 
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onClearAll={clearAllNotifications}
            onNotificationClick={(issueId) => {
              const issue = issues.find(i => i.id === issueId);
              if (issue) setSelectedIssue(issue);
            }}
          />
        );
      case 'Settings':
        return <Settings user={currentUser!} onUpdateUser={setCurrentUser} />;
      case 'Analytics':
        return <Analytics issues={issues} currentUser={currentUser} />;
      case 'Dashboard':
      case 'MyReports':
      default:
        return (
          <div className="space-y-6">
            {/* Quick Filters */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar snap-x touch-pan-x w-full sm:w-auto">
                {['All', 'Roads', 'Garbage', 'Water', 'Electricity', 'Public Health', 'Others'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilters(prev => ({ ...prev, category: cat as any }))}
                    className={`snap-start px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                      filters.category === cat 
                        ? 'bg-slate-900 text-white shadow-lg' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsFilterPanelOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-white border border-slate-200 rounded-xl text-xs md:text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <SlidersHorizontal size={16} />
                  {t('Advanced Filters')}
                </button>
                {currentUser!.role === 'Staff' && (
                  <button 
                    onClick={exportData}
                    className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-white border border-slate-200 rounded-xl text-xs md:text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Download size={16} />
                    {t('Export')}
                  </button>
                )}
              </div>
            </div>

            {isLoadingData ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 md:p-20 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1">{t('Loading reports...')}</h3>
                <p className="text-xs md:text-sm text-slate-500 font-medium">{t('Fetching data from server')}</p>
              </div>
            ) : filteredIssues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredIssues.map(issue => (
                  <IssueCard 
                    key={issue.id} 
                    issue={issue}
                    currentUserId={currentUser!.id}
                    onClick={setSelectedIssue}
                    onUpvote={handleUpvote}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-10 md:p-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <Search size={32} className="md:w-10 md:h-10" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1">{t('No issues found')}</h3>
                <p className="text-xs md:text-sm text-slate-500 max-w-xs font-medium">
                  {currentView === 'MyReports' 
                    ? t("You haven't reported any issues yet. Click 'Report Issue' to get started!")
                    : t("We couldn't find any issues matching your filters. Try adjusting your search criteria.")}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({
                      category: 'All',
                      status: 'All',
                      priority: 'All',
                      dateRange: 'All',
                      sortBy: 'date'
                    });
                  }}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                >
                  {t('Clear Filters')}
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  // Show loading screen while restoring session
  if (isRestoringSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100 mx-auto mb-6">
            <LayoutDashboard size={32} />
          </div>
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading NagrikSetu...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !currentUser) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className={`bg-white border-r border-slate-200 flex flex-col fixed md:sticky top-0 h-screen z-50 overflow-hidden transition-transform duration-300 md:transition-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-100">
            <LayoutDashboard size={24} />
          </div>
          {isSidebarOpen && (
            <span className="font-black text-xl tracking-tighter text-slate-900">NagrikSetu</span>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label={t('Dashboard')} 
            active={currentView === 'Dashboard'} 
            onClick={() => setCurrentView('Dashboard')}
            isOpen={isSidebarOpen} 
          />
          <NavItem 
            icon={<ClipboardList size={20} />} 
            label={t('My Reports')} 
            active={currentView === 'MyReports'} 
            onClick={() => setCurrentView('MyReports')}
            isOpen={isSidebarOpen}
          />
          <NavItem 
            icon={<MapIcon size={20} />} 
            label={t('Map View')} 
            active={currentView === 'MapView'} 
            onClick={() => setCurrentView('MapView')}
            isOpen={isSidebarOpen} 
          />
          {currentUser.role === 'Staff' && (
            <NavItem 
              icon={<BarChart3 size={20} />} 
              label={t('Analytics')} 
              active={currentView === 'Analytics'} 
              onClick={() => setCurrentView('Analytics')}
              isOpen={isSidebarOpen} 
            />
          )}
          <NavItem 
            icon={<Bell size={20} />} 
            label={t('Notifications')} 
            active={currentView === 'Notifications'} 
            onClick={() => setCurrentView('Notifications')}
            isOpen={isSidebarOpen} 
            badge={unreadCount > 0 ? unreadCount : undefined}
          />
          <div className="pt-4 mt-4 border-t border-slate-100">
            <NavItem 
              icon={<SettingsIcon size={20} />} 
              label={t('Settings')} 
              active={currentView === 'Settings'} 
              onClick={() => setCurrentView('Settings')}
              isOpen={isSidebarOpen} 
            />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className={`flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 ${!isSidebarOpen && 'justify-center'}`}>
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 object-cover" 
              referrerPolicy="no-referrer"
            />
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{currentUser.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentUser.role}</p>
              </div>
            )}
            {isSidebarOpen && (
              <button 
                onClick={handleLogout} 
                title="Logout" 
                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-rose-600"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Connected Banner */}
        <div className="bg-emerald-600 text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-center flex items-center justify-center gap-4">
          <span>NagrikSetu v2.0</span>
          <span className="w-1 h-1 bg-white/40 rounded-full" />
          <span>Connected to MongoDB</span>
          <span className="w-1 h-1 bg-white/40 rounded-full" />
          <span>Live Mode</span>
        </div>

        {/* Header */}
        <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 flex-1 max-w-2xl">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 md:p-2 hover:bg-slate-100 rounded-lg md:rounded-xl transition-colors text-slate-500"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder={t('Search issues, locations, keywords...')}
                className="w-full pl-9 md:pl-12 pr-3 md:pr-4 py-2 md:py-2.5 rounded-xl md:rounded-2xl bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all text-xs md:text-sm font-medium"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-4 md:ml-8">
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>
            {currentUser.role === 'Citizen' && currentView !== 'Settings' && currentView !== 'Analytics' && (
              <button
                onClick={() => setIsReportFormOpen(true)}
                className="hidden sm:flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                <Plus size={20} />
                {t('Report Issue')}
              </button>
            )}
            {currentUser.role === 'Citizen' && currentView !== 'Settings' && currentView !== 'Analytics' && (
              <button
                onClick={() => setIsReportFormOpen(true)}
                className="sm:hidden w-8 h-8 md:w-10 md:h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                <Plus size={16} />
              </button>
            )}
            <div 
              onClick={() => setCurrentView('Notifications')}
              className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer transition-colors relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>

            <button
              onClick={fetchHazards}
              className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full pb-20 md:pb-8">
          {/* Welcome & Stats */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                {currentView === 'Dashboard' ? (currentUser.role === 'Staff' ? t('Authority Dashboard') : t('Civic Portal')) :
                 currentView === 'MyReports' ? t('My Reports') :
                 currentView === 'MapView' ? t('Map View') :
                 currentView === 'Analytics' ? t('Analytics') :
                 currentView === 'Notifications' ? t('Notifications') : t('Settings')}
              </h1>
              <p className="text-slate-500 font-medium">
                {currentView === 'Dashboard' ? (currentUser.role === 'Staff' ? t('Manage and resolve civic issues reported by citizens.') : t('Track and report civic issues in your community.')) :
                 currentView === 'MyReports' ? 'View and track all your reported issues.' :
                 currentView === 'MapView' ? 'Visual representation of all issues across the city.' :
                 currentView === 'Analytics' ? 'Detailed insights and performance metrics.' :
                 currentView === 'Notifications' ? 'Stay updated on your reports and system announcements.' : 'Manage your account and preferences.'}
              </p>
            </div>
            
            {(currentView === 'Dashboard' || currentView === 'MyReports') && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard label={t('Total')} value={stats.total} icon={<ClipboardList size={16} />} color="blue" />
                <StatCard label={t('Pending')} value={stats.pending} icon={<AlertCircle size={16} />} color="amber" />
                <StatCard label={t('In Progress')} value={stats.inProgress} icon={<Clock size={16} />} color="indigo" />
                <StatCard label={t('Resolved')} value={stats.resolved} icon={<CheckCircle2 size={16} />} color="emerald" />
                <StatCard label={t('Critical')} value={stats.critical} icon={<TrendingUp size={16} />} color="rose" />
              </div>
            )}
          </div>

          {/* Dynamic Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <ReportForm 
        isOpen={isReportFormOpen} 
        onClose={() => setIsReportFormOpen(false)} 
        onSubmit={handleReportSubmit} 
      />

      {selectedIssue && (
        <IssueDetail 
          issue={selectedIssue} 
          isOpen={!!selectedIssue} 
          onClose={() => setSelectedIssue(null)} 
          isStaff={currentUser.role === 'Staff' || currentUser.role === 'Admin'}
          currentUserId={currentUser.id}
          onUpdateStatus={handleUpdateStatus}
          onUpvote={handleUpvote}
        />
      )}

      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
}

function NavItem({ icon, label, active = false, isOpen = true, onClick, badge }: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean, 
  isOpen?: boolean, 
  onClick?: () => void, 
  badge?: number 
}) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        active 
          ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
      } ${!isOpen && 'justify-center'}`}
    >
      <div className="shrink-0 relative">
        {icon}
        {badge !== undefined && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full border border-white font-bold">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      {isOpen && <span className="text-sm">{label}</span>}
      {badge !== undefined && isOpen && (
        <span className="ml-auto px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full min-w-[20px] text-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
      {active && isOpen && badge === undefined && (
        <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { 
  label: string, 
  value: number, 
  icon: React.ReactNode, 
  color: 'blue' | 'amber' | 'emerald' | 'indigo' | 'rose' 
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <div className={`p-4 rounded-2xl border ${colors[color]} flex flex-col gap-1 min-w-[120px] hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</span>
        {icon}
      </div>
      <span className="text-2xl font-black">{value}</span>
    </div>
  );
}