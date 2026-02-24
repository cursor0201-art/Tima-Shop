import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary/30 mt-auto">
      <div className="container-shop py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg tracking-widest mb-3">TIMA_SHOP</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('about.content').slice(0, 100)}...
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-sm mb-3">{t('common.catalog')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/catalog" className="hover:text-foreground transition-colors">{t('common.catalog')}</Link></li>
              <li><Link to="/catalog?sort=newest" className="hover:text-foreground transition-colors">{t('home.newArrivals')}</Link></li>
              <li><Link to="/catalog?sort=popular" className="hover:text-foreground transition-colors">{t('home.popularProducts')}</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold text-sm mb-3">{t('common.about')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">{t('common.about')}</Link></li>
              <li><Link to="/delivery" className="hover:text-foreground transition-colors">{t('common.delivery')}</Link></li>
              <li><Link to="/returns" className="hover:text-foreground transition-colors">{t('common.returns')}</Link></li>
              <li><Link to="/faq" className="hover:text-foreground transition-colors">{t('common.faq')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-3">{t('common.contacts')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>+998 90 123 45 67</li>
              <li>info@timashop.uz</li>
              <li>Telegram: @tima_shop</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {year} TIMA_SHOP. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
