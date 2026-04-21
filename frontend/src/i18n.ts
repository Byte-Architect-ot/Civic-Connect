import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "Dashboard": "Dashboard",
      "My Reports": "My Reports",
      "Map View": "Map View",
      "Analytics": "Analytics",
      "Notifications": "Notifications",
      "Settings": "Settings",
      "Report Issue": "Report Issue",
      "Authority Dashboard": "Authority Dashboard",
      "Civic Portal": "Civic Portal",
      "Language": "Language",
      "Select your preferred language": "Select your preferred language",
      "Total": "Total",
      "Pending": "Pending",
      "In Progress": "In Progress",
      "Resolved": "Resolved",
      "Critical": "Critical"
    }
  },
  hi: {
    translation: {
      "Dashboard": "डैशबोर्ड",
      "My Reports": "मेरी रिपोर्टें",
      "Map View": "मानचित्र दृश्य",
      "Analytics": "एनालिटिक्स",
      "Notifications": "सूचनाएं",
      "Settings": "सेटिंग्स",
      "Report Issue": "समस्या रिपोर्ट करें",
      "Authority Dashboard": "अधिकारी डैशबोर्ड",
      "Civic Portal": "नागरिक पोर्टल",
      "Language": "भाषा",
      "Select your preferred language": "अपनी पसंदीदा भाषा चुनें",
      "Total": "कुल",
      "Pending": "लंबित",
      "In Progress": "प्रगति पर",
      "Resolved": "हल किया गया",
      "Critical": "गंभीर"
    }
  },
  mr: {
    translation: {
      "Dashboard": "डॅशबोर्ड",
      "My Reports": "माझे अहवाल",
      "Map View": "नकाशा दृश्य",
      "Analytics": "विश्लेषण",
      "Notifications": "अधिसूचना",
      "Settings": "सेटिंग्ज",
      "Report Issue": "समस्या नोंदवा",
      "Authority Dashboard": "अधिकारी डॅशबोर्ड",
      "Civic Portal": "नागरिक पोर्टल",
      "Language": "भाषा",
      "Select your preferred language": "तुमची पसंतीची भाषा निवडा",
      "Total": "एकूण",
      "Pending": "प्रलंबित",
      "In Progress": "प्रगतीपथावर",
      "Resolved": "सोडवले",
      "Critical": "गंभीर"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
