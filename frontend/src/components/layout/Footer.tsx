import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-anthracite border-t border-white/5 mt-auto">
      <div className="container-shop py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:pr-8">
            <h3 className="font-serif text-2xl tracking-[0.15em] mb-6 uppercase text-foreground">tima-shop</h3>
            <p className="text-sm text-foreground/60 leading-relaxed font-light">
              {t('about.content').slice(0, 120)}...
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-sans font-medium text-xs tracking-[0.1em] uppercase mb-6 text-foreground/90">{t('common.catalog')}</h4>
            <ul className="space-y-4 text-sm font-light text-foreground/60">
              <li><Link to="/catalog" className="hover:text-gold transition-colors duration-300">{t('common.catalog')}</Link></li>
              <li><Link to="/catalog?sort=newest" className="hover:text-gold transition-colors duration-300">{t('home.newArrivals')}</Link></li>
              <li><Link to="/catalog?sort=popular" className="hover:text-gold transition-colors duration-300">{t('home.popularProducts')}</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-sans font-medium text-xs tracking-[0.1em] uppercase mb-6 text-foreground/90">{t('common.about')}</h4>
            <ul className="space-y-4 text-sm font-light text-foreground/60">
              <li><Link to="/about" className="hover:text-gold transition-colors duration-300">{t('common.about')}</Link></li>
              <li><Link to="/delivery" className="hover:text-gold transition-colors duration-300">{t('common.delivery')}</Link></li>
              <li><Link to="/returns" className="hover:text-gold transition-colors duration-300">{t('common.returns')}</Link></li>
              <li><Link to="/faq" className="hover:text-gold transition-colors duration-300">{t('common.faq')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans font-medium text-xs tracking-[0.1em] uppercase mb-6 text-foreground/90">{t('common.contacts')}</h4>
            <ul className="space-y-4 text-sm font-light text-foreground/60">
              <li className="hover:text-gold transition-colors duration-300 cursor-pointer">+998 91 919 42 32</li>
              <li className="hover:text-gold transition-colors duration-300 cursor-pointer">info@timashop.uz</li>
              <li className="hover:text-gold transition-colors duration-300 cursor-pointer">Telegram: @Tima_AD</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-light tracking-wide text-foreground/40">
          <p>© {year} TIMA_SHOP. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <span className="hover:text-foreground/80 cursor-pointer transition-colors">PRIVACY POLICY</span>
            <span className="hover:text-foreground/80 cursor-pointer transition-colors">TERMS OF SERVICE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
