import { useTranslation } from 'react-i18next';

interface PlaceholderPageProps {
  title: string;
  icon: string;
  description?: string;
}

export const PlaceholderPage = ({ title, icon, description }: PlaceholderPageProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <span className="text-4xl">{icon}</span>
          {title}
        </h1>
        <p className="text-gray-600">
          {description || t('dashboard.comingSoon', 'This feature is coming soon!')}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('dashboard.comingSoon', 'Coming Soon')}
        </h2>
        <p className="text-gray-600">
          {description || t('dashboard.featureDevelopment', "We're working on this feature and will release it soon.")}
        </p>
      </div>
    </div>
  );
};
