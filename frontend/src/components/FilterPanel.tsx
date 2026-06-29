import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Filter, SlidersHorizontal, Calendar, TrendingUp, Tag, CheckCircle2 } from 'lucide-react';
import { FilterOptions } from '../types';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, filters, onFiltersChange }) => {
  const handleReset = () => {
    onFiltersChange({
      category: 'All',
      status: 'All',
      priority: 'All',
      dateRange: 'All',
      sortBy: 'date'
    });
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-soft-xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <SlidersHorizontal size={20} className="text-slate-700" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold">Advanced Filters</h2>
                  <p className="text-xs text-slate-500">Refine your search results</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Category Filter */}
              <FilterSection
                icon={<Tag size={18} />}
                label="Category"
                description="Filter by issue type"
              >
                <div className="grid grid-cols-2 gap-2">
                  {['All', 'Roads', 'Garbage', 'Water', 'Electricity', 'Public Health', 'Others'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => onFiltersChange({ ...filters, category: cat as any })}
                      className={`px-4 py-3 rounded-full text-sm font-semibold transition-all ${
                        filters.category === cat
                          ? 'bg-slate-900 text-white shadow-soft-lg'
                          : 'bg-slate-50 text-slate-600 border-2 border-slate-200 hover:border-slate-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Status Filter */}
              <FilterSection
                icon={<CheckCircle2 size={18} />}
                label="Status"
                description="Filter by resolution status"
              >
                <div className="grid grid-cols-2 gap-2">
                  {['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'].map(status => (
                    <button
                      key={status}
                      onClick={() => onFiltersChange({ ...filters, status: status as any })}
                      className={`px-4 py-3 rounded-full text-sm font-semibold transition-all ${
                        filters.status === status
                          ? 'bg-slate-900 text-white shadow-soft-lg'
                          : 'bg-slate-50 text-slate-600 border-2 border-slate-200 hover:border-slate-900'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Priority Filter */}
              <FilterSection
                icon={<TrendingUp size={18} />}
                label="Priority"
                description="Filter by urgency level"
              >
                <div className="grid grid-cols-2 gap-2">
                  {['All', 'Low', 'Medium', 'High', 'Critical'].map(priority => (
                    <button
                      key={priority}
                      onClick={() => onFiltersChange({ ...filters, priority: priority as any })}
                      className={`px-4 py-3 rounded-full text-sm font-semibold transition-all ${
                        filters.priority === priority
                          ? 'bg-slate-900 text-white shadow-soft-lg'
                          : 'bg-slate-50 text-slate-600 border-2 border-slate-200 hover:border-slate-900'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Date Range Filter */}
              <FilterSection
                icon={<Calendar size={18} />}
                label="Date Range"
                description="Filter by reporting date"
              >
                <div className="space-y-2">
                  {['All', 'Today', 'Week', 'Month'].map(range => (
                    <button
                      key={range}
                      onClick={() => onFiltersChange({ ...filters, dateRange: range as any })}
                      className={`w-full px-4 py-3 rounded-full text-sm font-semibold transition-all text-left ${
                        filters.dateRange === range
                          ? 'bg-slate-900 text-white shadow-soft-lg'
                          : 'bg-slate-50 text-slate-600 border-2 border-slate-200 hover:border-slate-900'
                      }`}
                    >
                      {range === 'All' ? 'All Time' : 
                       range === 'Today' ? 'Last 24 Hours' :
                       range === 'Week' ? 'Last 7 Days' :
                       'Last 30 Days'}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Sort By */}
              <FilterSection
                icon={<Filter size={18} />}
                label="Sort By"
                description="Order results by"
              >
                <div className="space-y-2">
                  {[
                    { value: 'date', label: 'Most Recent' },
                    { value: 'upvotes', label: 'Most Upvoted' },
                    { value: 'priority', label: 'Highest Priority' },
                    { value: 'urgency', label: 'Urgency Score' }
                  ].map(sort => (
                    <button
                      key={sort.value}
                      onClick={() => onFiltersChange({ ...filters, sortBy: sort.value as any })}
                      className={`w-full px-4 py-3 rounded-full text-sm font-semibold transition-all text-left ${
                        filters.sortBy === sort.value
                          ? 'bg-slate-900 text-white shadow-soft-lg'
                          : 'bg-slate-50 text-slate-600 border-2 border-slate-200 hover:border-slate-900'
                      }`}
                    >
                      {sort.label}
                    </button>
                  ))}
                </div>
              </FilterSection>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 space-y-3">
              <button
                onClick={handleReset}
                className="w-full px-6 py-3 rounded-full font-semibold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 transition-all"
              >
                Reset All Filters
              </button>
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 shadow-soft-lg transition-all"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* Filter section component */
function FilterSection({ 
  icon, 
  label, 
  description, 
  children 
}: { 
  icon: React.ReactNode, 
  label: string, 
  description: string, 
  children: React.ReactNode 
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="text-slate-500">{icon}</div>
        <div>
          <h3 className="font-semibold text-slate-900">{label}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}