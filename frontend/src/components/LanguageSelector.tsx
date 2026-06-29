import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'mr', name: 'मराठी' }
];

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
      >
        <Globe size={18} className="text-slate-600" />
        {currentLang.name}
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-soft-xl border-2 border-slate-100 py-2 z-50 overflow-hidden"
          >
            {LANGUAGES.map((lng) => (
              <button
                key={lng.code}
                onClick={() => handleLanguageChange(lng.code)}
                className={`flex items-center justify-between w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 transition-colors ${
                  i18n.language === lng.code ? 'text-slate-900 bg-slate-50' : 'text-slate-600'
                }`}
              >
                <span>{lng.name}</span>
                {i18n.language === lng.code && (
                  <div className="w-2 h-2 rounded-full bg-slate-900"></div>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};