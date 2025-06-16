import en from '~/i18n/locales/en.json';
import hi from '~/i18n/locales/hi.json';
import fr from '~/i18n/locales/fr.json';
import de from '~/i18n/locales/de.json';
import ar from '~/i18n/locales/ar.json';
import it from '~/i18n/locales/it.json';
import ja from '~/i18n/locales/ja.json';

const translations = { en, hi, fr, de, ar, it, ja};

export function getLocaleFromRequest(request) {
  const url = new URL(request.url);
  const locale = url.pathname.split('/')[1]; // e.g., /fr/products/...
  return translations[locale] ? locale : 'ja';
}

export function createI18n(locale) {
  return {
    t: (key) => translations[locale]?.[key] || key,
    locale,
  };
}


// /**
//  * @param {Request} request
//  */
// export function getLocaleFromRequest(request) {
//   const url = new URL(request.url);
//   const firstPathPart = url.pathname.split('/')[1]?.toUpperCase() ?? '';

//   let pathPrefix = '';
//   let [language, country] = ['EN', 'US'];

//   if (/^[A-Z]{2}-[A-Z]{2}$/i.test(firstPathPart)) {
//     pathPrefix = '/' + firstPathPart;
//     [language, country] = firstPathPart.split('-');
//   }

//   return {language, country, pathPrefix};
// }

// /**
//  * @typedef {Object} I18nLocale
//  * @property {string} pathPrefix
//  */

// /** @typedef {import('@shopify/hydrogen').I18nBase} I18nBase */
