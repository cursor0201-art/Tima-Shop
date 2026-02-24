import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, MessageCircle } from 'lucide-react';

export default function OrderSuccessPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order') || 'TS-0000';
  const telegramUrl = 'https://t.me/tima_shop'; // from API in prod
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          window.open(telegramUrl, '_blank');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [telegramUrl]);

  return (
    <div className="container-shop py-20 flex flex-col items-center text-center">
      <CheckCircle size={64} className="text-success mb-6" />
      <h1 className="text-3xl font-bold mb-2">{t('orderSuccess.title')}</h1>
      <p className="text-lg text-muted-foreground mb-2">
        {t('orderSuccess.orderNumber', { number: orderNumber })}
      </p>
      <p className="text-sm text-muted-foreground mb-8">{t('orderSuccess.message')}</p>

      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md bg-foreground text-background px-8 py-3.5 text-sm font-semibold hover:bg-foreground/90 transition-colors mb-4"
      >
        <MessageCircle size={18} />
        {t('orderSuccess.contactManager')}
      </a>

      {countdown > 0 && (
        <p className="text-xs text-muted-foreground">
          {t('orderSuccess.redirecting', { seconds: countdown })}
        </p>
      )}
    </div>
  );
}
