import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Globe, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
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
  const [scrolled, setScrolled] = useState(false);
  const cartCount = useCartStore((s) => s.getCount());
  const wishlistCount = useWishlistStore((s) => s.getCount());

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled ? 'bg-background/90 backdrop-blur-xl border-b border-white/5 py-1' : 'bg-gradient-to-b from-black/60 to-transparent border-transparent py-4'}`}>
      <div className="container-shop">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 -ml-2 text-foreground/80 hover:text-gold transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-serif font-normal text-2xl tracking-[0.2em] uppercase text-foreground">
            tima-shop
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs uppercase tracking-[0.15em] font-light transition-all duration-300 relative group ${
                  location.pathname === link.path ? 'text-gold' : 'text-foreground/80 hover:text-gold'
                }`}
              >
                {t(link.key)}
                <span className={`absolute -bottom-2 left-0 h-[1px] bg-gold transition-all duration-500 ease-out ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-foreground/80 hover:text-gold transition-colors"
              aria-label={t('common.search')}
            >
              <Search size={22} strokeWidth={1.2} />
            </button>

            <button
              onClick={toggleLang}
              className="p-2 text-foreground/80 hover:text-gold transition-colors flex items-center gap-1.5 text-xs font-light tracking-widest uppercase"
              aria-label={t('common.language')}
            >
              <Globe size={20} strokeWidth={1.2} />
              <span className="hidden sm:inline">{i18n.language}</span>
            </button>

            <Link
              to="/wishlist"
              className="p-2 text-foreground/80 hover:text-gold transition-colors relative"
              aria-label={t('common.wishlist')}
            >
              <Heart size={22} strokeWidth={1.2} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gold text-background text-[9px] font-bold tracking-tighter">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="p-2 text-foreground/80 hover:text-gold transition-colors relative"
              aria-label={t('common.cart')}
            >
              <ShoppingBag size={22} strokeWidth={1.2} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gold text-background text-[9px] font-bold tracking-tighter">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search bar */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${searchOpen ? 'max-h-24 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.searchPlaceholder')}
                className="w-full bg-transparent border-b border-white/20 py-3 pl-4 pr-10 text-sm font-light tracking-wider text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-gold transition-colors"
                autoFocus={searchOpen}
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-gold transition-colors">
                <Search size={18} strokeWidth={1.2} />
              </button>
            </div>
          </form>
        </div>

        {/* Mobile nav */}
        <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${mobileOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
          <nav className="flex flex-col gap-0 border-t border-white/10 mt-2 mx-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`py-4 text-xs font-light uppercase tracking-[0.2em] border-b border-white/5 transition-colors ${
                  location.pathname === link.path ? 'text-gold' : 'text-foreground/80 hover:text-gold pl-2'
                }`}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
