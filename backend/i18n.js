const i18n = require('i18next');
const middleware = require('i18next-http-middleware');

i18n
  .use(middleware.LanguageDetector)
  .init({
    preload: ['en', 'hi', 'mr'],
    fallbackLng: 'en',
    resources: {
      en: {
        translation: {
          msg_user_not_found: 'User not found',
          msg_invalid_key: 'Invalid Admin Key'
        }
      },
      hi: {
        translation: {
          msg_user_not_found: 'उपयोगकर्ता नहीं मिला',
          msg_invalid_key: 'अमान्य व्यवस्थापक कुंजी'
        }
      },
      mr: {
        translation: {
          msg_user_not_found: 'वापरकर्ता सापडला नाही',
          msg_invalid_key: 'अवैध प्रशासक की'
        }
      }
    }
  });

module.exports = { i18n, middleware };
