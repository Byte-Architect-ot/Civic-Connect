import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { exportToExcel, exportFilteredToExcel } from './api';
import { 
  Plus, 
  Search, 
  LayoutDashboard, 
  ClipboardList, 
  LogOut, 
  Bell, 
  Settings as SettingsIcon,
  Menu,
  X,
  Map as MapIcon,
  BarChart3,
  Download,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp
} from 'lucide-react';
import { CivicIssue, IssueStatus, User, Notification, FilterOptions } from './types';
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
  
  /* Authentication State */
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  
  /* Data State */
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('nagriksetu_notifications');
    return saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS;
  });
  const [isLoadingData, setIsLoadingData] = useState(false);

  /* UI State */
  const [currentView, setCurrentView] = useState<View>('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'All',
    status: 'All',
    priority: 'All',
    dateRange: 'All',
    sortBy: 'date'
  });

  /* Save notifications to localStorage */
  useEffect(() => {
    localStorage.setItem('nagriksetu_notifications', JSON.stringify(notifications));
  }, [notifications]);

  /* Fetch issues from backend */
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

  /* Restore user session on mount */
  useEffect(() => {
    const restoreSession = async () => {
      if (hasToken()) {
        try {
          const backendUser = await apiGetMe();
          const frontendUser: User = {
            id: backendUser.id || backendUser._id,
            name: backendUser.name,
            role: backendUser.role === 'admin' ? 'Staff' : 'Citizen',
            avatar: backendUser.avatar || `${import.meta.env.VITE_DICEBEAR_API_URL}?seed=${backendUser.name}`,
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

  /* Load issues when logged in */
  useEffect(() => {
    if (isLoggedIn) {
      fetchHazards();
    }
  }, [isLoggedIn, fetchHazards]);

  /* Handle window resize for sidebar */
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

  /* Periodic notifications (simulated) */
  useEffect(() => {
    if (!isLoggedIn || !currentUser) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        const newNotif: Notification = {
          id: `n${Date.now()}`,
          title: 'Community Activity',
          message: 'A new issue has been reported in your area',
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

  /* Auth handlers */
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

  /* Filter and search logic */
  const filteredIssues = useMemo(() => {
    let baseIssues = issues;
    
    if (currentView === 'MyReports' && currentUser) {
      baseIssues = issues.filter(i => i.reportedBy === currentUser.name);
    }
    
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
        case 'urgency':
          return (b.urgencyScore || 0) - (a.urgencyScore || 0);
        case 'date':
        default:
          return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
      }
    });

    return baseIssues;
  }, [issues, searchQuery, filters, currentView, currentUser]);

  /* Calculate statistics */
  const stats = useMemo(() => {
    if (!currentUser) return { total: 0, resolved: 0, pending: 0, inProgress: 0, critical: 0 };

    return {
      total: issues.length,
      resolved: issues.filter(i => i.status === 'Resolved').length,
      pending: issues.filter(i => i.status === 'Pending').length,
      inProgress: issues.filter(i => i.status === 'In Progress').length,
      critical: issues.filter(i => i.priority === 'Critical').length,
    };
  }, [issues, currentUser]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  /* Action handlers */
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

      setIssues(prev => [newHazard, ...prev]);
      setIsReportFormOpen(false);
      
      const newNotif: Notification = {
        id: `n${Date.now()}`,
        title: 'Report Submitted',
        message: `Your report "${newHazard.title}" is under review`,
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
          if (selectedIssue?.id === issueId) {
            setSelectedIssue(updatedHazard);
          }
          return updatedHazard;
        }
        return issue;
      }));

      const issue = issues.find(i => i.id === issueId);
      const newNotif: Notification = {
        id: `n${Date.now()}`,
        title: 'Status Updated',
        message: `"${issue?.title || 'Issue'}" is now ${newStatus}`,
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

const exportData = async () => {
  try {
    setIsLoadingData(true);
    await exportToExcel();
  } catch (error: any) {
    alert('Failed to export data: ' + (error.message || 'Unknown error'));
  } finally {
    setIsLoadingData(false);
  }
};

const exportFilteredData = async () => {
  try {
    setIsLoadingData(true);
    await exportFilteredToExcel({
      category: filters.category !== 'All' ? filters.category : undefined,
      status: filters.status !== 'All' ? filters.status : undefined,
      priority: filters.priority !== 'All' ? filters.priority : undefined,
      dateRange: filters.dateRange !== 'All' ? filters.dateRange : undefined
    });
  } catch (error: any) {
    alert('Failed to export filtered data: ' + (error.message || 'Unknown error'));
  } finally {
    setIsLoadingData(false);
  }
};

  /* Render different views */
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
        return <Analytics issues={issues} currentUser={currentUser!} />;
      case 'Dashboard':
      case 'MyReports':
      default:
        return (
          <div className="space-y-6">
            {/* Quick category filters */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar w-full sm:w-auto">
                {['All', 'Roads', 'Garbage', 'Water', 'Electricity', 'Public Health', 'Others'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilters(prev => ({ ...prev, category: cat as any }))}
                    className={`px-3.5 sm:px-5 py-2.5 sm:py-3 min-h-[40px] sm:min-h-[44px] rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 outline-none active:scale-95 ${
                      filters.category === cat 
                        ? 'bg-slate-900 text-white shadow-soft-lg' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:shadow-soft'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsFilterPanelOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:shadow-soft transition-all"
                >
                  <SlidersHorizontal size={16} />
                  {t('Filters')}
                </button>
                
                {/* {currentUser!.role === 'Staff' && (
                  <button 
                    onClick={exportData}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:shadow-soft transition-all"
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">{t('Export')}</span>
                  </button>
                )} */}
                {currentUser!.role === 'Staff' && (
                <div className="flex gap-2">
                  <button 
                    onClick={exportData}
                    disabled={isLoadingData}
                    className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:shadow-soft transition-all disabled:opacity-50"
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">
                      {isLoadingData ? 'Generating...' : t('Export Excel')}
                    </span>
                  </button>
                  
                  {(filters.category !== 'All' || filters.status !== 'All' || filters.priority !== 'All' || filters.dateRange !== 'All') && (
                    <button 
                      onClick={exportFilteredData}
                      disabled={isLoadingData}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-semibold hover:bg-emerald-700 shadow-soft transition-all disabled:opacity-50"
                    >
                      <Download size={16} />
                      <span className="hidden sm:inline">Export Filtered</span>
                    </button>
                  )}
                </div>
              )}
              </div>
            </div>

            {/* Loading state */}
            {isLoadingData ? (
              <div className="bg-white border border-slate-200 rounded-4xl p-10 sm:p-20 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="text-xl font-display font-bold text-slate-900 mb-1">{t('Loading reports')}</h3>
                <p className="text-sm text-slate-500">{t('Fetching latest data')}</p>
              </div>
            ) : filteredIssues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-4xl p-10 sm:p-20 flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900 mb-1">{t('No issues found')}</h3>
                <p className="text-sm text-slate-500 max-w-sm text-center mb-6">
                  {currentView === 'MyReports' 
                    ? t("You haven't reported any issues yet")
                    : t("No issues match your current filters")}
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
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 transition-all"
                >
                  {t('Clear Filters')}
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  /* Loading screen while restoring session */
  if (isRestoringSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-soft-lg mx-auto mb-6">
            <LayoutDashboard size={32} />
          </div>
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading NagrikSetu</p>
        </div>
      </div>
    );
  }

  /* Show landing page if not logged in */
  if (!isLoggedIn || !currentUser) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] w-full overflow-x-hidden">
      {/* Sidebar backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className={`bg-white border-r border-slate-200 flex flex-col fixed md:sticky top-[env(safe-area-inset-top)] h-[100dvh] z-50 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } transition-transform duration-300 md:transition-none`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shrink-0">
            <LayoutDashboard size={24} />
          </div>
          {isSidebarOpen && (
            <span className="font-display font-bold text-xl tracking-tight">NagrikSetu</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 mt-4">
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

        {/* User profile */}
        <div className="p-4 border-t border-slate-100">
          <div className={`flex items-center gap-3 p-3 rounded-2xl bg-slate-50 ${!isSidebarOpen && 'justify-center'}`}>
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 object-cover" 
              referrerPolicy="no-referrer"
            />
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-500">{currentUser.role}</p>
              </div>
            )}
            {isSidebarOpen && (
              <button 
                onClick={handleLogout} 
                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-rose-600"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Status banner */}
        {/* <div className="bg-emerald-600 text-white px-4 py-1.5 text-xs font-semibold text-center flex items-center justify-center gap-3">
          <span>NagrikSetu v2.0</span>
          <span className="w-1 h-1 bg-white/40 rounded-full" />
          <span>Live Mode</span>
        </div> */}

        {/* Header */}
        <header className="h-14 md:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 px-3 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-3 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 sm:p-3 min-h-[40px] min-w-[40px] sm:min-h-[48px] sm:min-w-[48px] hover:bg-slate-100 rounded-xl transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none text-slate-500 flex items-center justify-center shrink-0"
            >
              {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            
            <div className="relative flex-1 hidden md:block max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder={t('Search issues')}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-slate-200 focus:shadow-soft outline-none transition-all text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 ml-1 sm:ml-2 md:ml-8 shrink-0">
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>
            
            {currentUser.role === 'Citizen' && currentView !== 'Settings' && currentView !== 'Analytics' && (
              <button
                onClick={() => setIsReportFormOpen(true)}
                className="hidden sm:flex items-center gap-2 px-6 py-3 min-h-[48px] bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 shadow-soft-lg transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 outline-none"
              >
                <Plus size={20} />
                {t('Report Issue')}
              </button>
            )}
            
            {currentUser.role === 'Citizen' && currentView !== 'Settings' && currentView !== 'Analytics' && (
              <button
                onClick={() => setIsReportFormOpen(true)}
                className="sm:hidden w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-soft-lg transition-all shrink-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 outline-none"
              >
                <Plus size={20} />
              </button>
            )}
            
            <button 
              onClick={() => setCurrentView('Notifications')}
              className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all shrink-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={fetchHazards}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all shrink-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        {/* Mobile Search Bar Row (Only visible on small screens) */}
        <div className="md:hidden px-3 py-2.5 bg-white border-b border-slate-200 sticky top-14 z-20 shadow-sm">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={t('Search issues')}
              className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-slate-200 focus:shadow-soft outline-none transition-all text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Page content */}
        <div className="p-3 sm:p-4 md:p-8 space-y-4 sm:space-y-6 md:space-y-8 max-w-7xl mx-auto w-full pb-20 md:pb-8">
          {/* Page header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight mb-1">
                {currentView === 'Dashboard' ? (currentUser.role === 'Staff' ? t('Authority Dashboard') : t('Civic Portal')) :
                 currentView === 'MyReports' ? t('My Reports') :
                 currentView === 'MapView' ? t('Map View') :
                 currentView === 'Analytics' ? t('Analytics') :
                 currentView === 'Notifications' ? t('Notifications') : t('Settings')}
              </h1>
              <p className="text-sm sm:text-base text-slate-500">
                {currentView === 'Dashboard' ? (currentUser.role === 'Staff' ? t('Manage civic issues') : t('Track community issues')) :
                 currentView === 'MyReports' ? 'Your reported issues' :
                 currentView === 'MapView' ? 'Visual map of all issues' :
                 currentView === 'Analytics' ? 'Insights and metrics' :
                 currentView === 'Notifications' ? 'Stay updated' : 'Account settings'}
              </p>
            </div>
            
            {(currentView === 'Dashboard' || currentView === 'MyReports') && (
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:gap-3">
                <StatCard label={t('Total')} value={stats.total} icon={<ClipboardList size={16} />} color="slate" />
                <StatCard label={t('Pending')} value={stats.pending} icon={<AlertCircle size={16} />} color="amber" />
                <StatCard label={t('Active')} value={stats.inProgress} icon={<Clock size={16} />} color="blue" />
                <StatCard label={t('Resolved')} value={stats.resolved} icon={<CheckCircle2 size={16} />} color="emerald" />
                <StatCard label={t('Critical')} value={stats.critical} icon={<TrendingUp size={16} />} color="rose" />
              </div>
            )}
          </div>

          {/* Dynamic content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
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

/* Navigation item component */
function NavItem({ icon, label, active = false, isOpen = true, onClick, badge }: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean, 
  isOpen?: boolean, 
  onClick?: () => void, 
  badge?: number 
}) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 min-h-[44px] rounded-2xl transition-all focus-visible:ring-2 focus-visible:ring-slate-900 outline-none active:scale-[0.98] ${
        active 
          ? 'bg-slate-900 text-white font-semibold shadow-soft' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
      {isOpen && <span className="text-sm flex-1 min-w-0 truncate text-left">{label}</span>}
      {badge !== undefined && isOpen && (
        <span className="ml-auto px-2 py-0.5 bg-rose-500 text-white text-xs font-bold rounded-full min-w-[20px] text-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}

/* Stat card component */
function StatCard({ label, value, icon, color }: { 
  label: string, 
  value: number, 
  icon: React.ReactNode, 
  color: 'slate' | 'amber' | 'emerald' | 'blue' | 'rose' 
}) {
  const colors = {
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  return (
    <div className={`p-3 sm:p-4 rounded-2xl border shrink-0 min-w-[120px] sm:min-w-0 ${colors[color]} hover:shadow-soft transition-all`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</span>
        {icon}
      </div>
      <span className="text-2xl font-display font-bold">{value}</span>
    </div>
  );
}