import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'uz', name: 'Oʻzbek' },
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' },
];

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <div className="flex items-center gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            i18n.language === lang.code
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
};

