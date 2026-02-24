import { useTranslation } from 'react-i18next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { CheckCircle } from 'lucide-react';

export default function ReturnsPage() {
  const { t } = useTranslation();

  return (
    <div className="container-shop py-4">
      <Breadcrumbs items={[
        { label: t('common.home'), path: '/' },
        { label: t('returnsPage.title') },
      ]} />

      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">{t('returnsPage.title')}</h1>
        <p className="text-muted-foreground leading-relaxed mb-8">{t('returnsPage.content')}</p>

        <h2 className="text-xl font-semibold mb-4">{t('returnsPage.conditions')}</h2>
        <ul className="space-y-3 mb-8">
          {['condition1', 'condition2', 'condition3'].map((key) => (
            <li key={key} className="flex items-start gap-3">
              <CheckCircle size={18} className="text-success mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{t(`returnsPage.${key}` as any)}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-xl font-semibold mb-4">{t('returnsPage.process')}</h2>
        <ol className="space-y-3">
          {['processStep1', 'processStep2', 'processStep3', 'processStep4'].map((key, i) => (
            <li key={key} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm text-muted-foreground">{t(`returnsPage.${key}` as any)}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
