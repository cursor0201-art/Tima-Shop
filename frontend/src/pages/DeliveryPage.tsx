import { useTranslation } from 'react-i18next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Package, Clock, Truck, MapPin } from 'lucide-react';

export default function DeliveryPage() {
  const { t } = useTranslation();

  const steps = [
    { icon: Package, text: t('deliveryPage.step1') },
    { icon: Clock, text: t('deliveryPage.step2') },
    { icon: Truck, text: t('deliveryPage.step3') },
    { icon: MapPin, text: t('deliveryPage.step4') },
  ];

  return (
    <div className="container-shop py-4">
      <Breadcrumbs items={[
        { label: t('common.home'), path: '/' },
        { label: t('deliveryPage.title') },
      ]} />

      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">{t('deliveryPage.title')}</h1>
        <p className="text-muted-foreground leading-relaxed mb-10">{t('deliveryPage.content')}</p>

        <h2 className="text-xl font-semibold mb-6">{t('deliveryPage.howItWorks')}</h2>
        <div className="space-y-4 mb-10">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-md border border-border">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <step.icon size={18} className="text-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-0.5">{i + 1}</p>
                <p className="text-sm">{step.text}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold mb-3">{t('deliveryPage.timing')}</h2>
        <p className="text-muted-foreground mb-6">{t('deliveryPage.timingText')}</p>

        <h2 className="text-xl font-semibold mb-3">{t('deliveryPage.cost')}</h2>
        <p className="text-muted-foreground">{t('deliveryPage.costText')}</p>
      </div>
    </div>
  );
}
