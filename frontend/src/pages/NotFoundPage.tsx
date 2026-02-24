import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="container-shop py-20 flex flex-col items-center text-center">
      <h1 className="text-7xl font-bold text-foreground mb-4">404</h1>
      <h2 className="text-xl font-semibold mb-2">{t('notFound.title')}</h2>
      <p className="text-sm text-muted-foreground mb-8">{t('notFound.message')}</p>
      <Link
        to="/"
        className="rounded-md bg-foreground text-background px-8 py-3 text-sm font-semibold hover:bg-foreground/90 transition-colors"
      >
        {t('notFound.goHome')}
      </Link>
    </div>
  );
}
