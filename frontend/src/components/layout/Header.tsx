import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';

const navLinks = [
  { path: '/', key: 'common.home' },
  { path: '/catalog', key: 'common.catalog' },
  { path: '/about', key: 'common.about' },
  { path: '/delivery', key: 'common.delivery' },
  { path: '/contacts', key: 'common.contacts' },
];

export default function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const cartCount = useCartStore((s) => s.getCount());
  const wishlistCount = useWishlistStore((s) => s.getCount());

  const toggleLang = () => {
    const next = i18n.language === 'ru' ? 'uz' : 'ru';
    i18n.changeLanguage(next);
    localStorage.setItem('tima_shop_lang', next);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/catalog?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container-shop">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 -ml-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-widest text-foreground">
            tima-shop
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  location.pathname === link.path ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={t('common.search')}
            >
              <Search size={20} />
            </button>

            <button
              onClick={toggleLang}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm font-medium"
              aria-label={t('common.language')}
            >
              <Globe size={18} />
              <span className="hidden sm:inline uppercase">{i18n.language}</span>
            </button>

            <Link
              to="/wishlist"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors relative"
              aria-label={t('common.wishlist')}
            >
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors relative"
              aria-label={t('common.cart')}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="pb-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.searchPlaceholder')}
                className="w-full rounded-md border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                autoFocus
              />
            </div>
          </form>
        )}

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="lg:hidden pb-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`py-2 text-sm font-medium transition-colors ${
                  location.pathname === link.path ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
