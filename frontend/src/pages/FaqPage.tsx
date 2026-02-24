import { useTranslation } from 'react-i18next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function FaqPage() {
  const { t } = useTranslation();

  const faqs = [
    { q: t('faqPage.q1'), a: t('faqPage.a1') },
    { q: t('faqPage.q2'), a: t('faqPage.a2') },
    { q: t('faqPage.q3'), a: t('faqPage.a3') },
    { q: t('faqPage.q4'), a: t('faqPage.a4') },
    { q: t('faqPage.q5'), a: t('faqPage.a5') },
  ];

  return (
    <div className="container-shop py-4">
      <Breadcrumbs items={[
        { label: t('common.home'), path: '/' },
        { label: t('faqPage.title') },
      ]} />

      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">{t('faqPage.title')}</h1>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-border pb-6 last:border-0">
              <h3 className="text-base font-semibold mb-2">{faq.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
