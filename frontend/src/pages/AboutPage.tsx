import { useTranslation } from 'react-i18next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { CheckCircle } from 'lucide-react';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="container-shop py-4">
      <Breadcrumbs items={[
        { label: t('common.home'), path: '/' },
        { label: t('about.title') },
      ]} />

      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">{t('about.title')}</h1>
        <p className="text-muted-foreground leading-relaxed mb-8">{t('about.content')}</p>

        <h2 className="text-xl font-semibold mb-3">{t('about.mission')}</h2>
        <p className="text-muted-foreground leading-relaxed mb-8">{t('about.missionText')}</p>

        <h2 className="text-xl font-semibold mb-4">{t('about.whyUs')}</h2>
        <ul className="space-y-3">
          {['reason1', 'reason2', 'reason3', 'reason4'].map((key) => (
            <li key={key} className="flex items-start gap-3">
              <CheckCircle size={18} className="text-success mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{t(`about.${key}` as any)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
