import { useTranslation } from 'react-i18next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Phone, Mail, MessageCircle, MapPin, Clock } from 'lucide-react';

export default function ContactsPage() {
  const { t } = useTranslation();

  const contacts = [
    { icon: Phone, label: t('contactsPage.phone'), value: '+998 90 123 45 67' },
    { icon: Mail, label: t('contactsPage.email'), value: 'info@timashop.uz' },
    { icon: MessageCircle, label: t('contactsPage.telegram'), value: '@tima_shop' },
    { icon: MapPin, label: t('contactsPage.address'), value: 'Tashkent, Uzbekistan' },
    { icon: Clock, label: t('contactsPage.workingHours'), value: t('contactsPage.workingHoursText') },
  ];

  return (
    <div className="container-shop py-4">
      <Breadcrumbs items={[
        { label: t('common.home'), path: '/' },
        { label: t('contactsPage.title') },
      ]} />

      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">{t('contactsPage.title')}</h1>
        <div className="space-y-4">
          {contacts.map((c, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-md border border-border">
              <c.icon size={20} className="text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{c.label}</p>
                <p className="text-sm font-medium">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
