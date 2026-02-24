import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertTriangle size={48} className="text-destructive/70 mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-1">{t('common.error')}</h3>
      <p className="text-sm text-muted-foreground mb-6">{message || t('common.error')}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md bg-foreground px-6 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
        >
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}
