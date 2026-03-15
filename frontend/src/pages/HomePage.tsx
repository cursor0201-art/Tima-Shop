import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { shopApi } from '@/services/api';
import { Product, Category } from '@/types';

export default function HomePage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          shopApi.getProducts({ page_size: 15 }),
          shopApi.getCategories()
        ]);
        setProducts(productsRes.results || []);
        setCategories(categoriesRes || []);
      } catch (error) {
        console.error("Failed to load home data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const newProducts = products.slice(0, 4); // First 4 as new
  const popularProducts = products.slice(0, 8); // Assuming popular
  const saleProducts = products.filter((p) => p.old_price); // Sale assuming old_price exists

  return (
    <div className="bg-anthracite">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=2000&q=80" 
            alt="Luxury Watch" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-anthracite via-black/50 to-black/30"></div>
        </div>

        <div className="relative z-10 container-shop text-center px-4 mt-20">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <span className="text-gold tracking-[0.3em] text-xs md:text-sm font-light uppercase mb-6 animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              Exceptional Craftsmanship
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-8 leading-[1.1] animate-fade-in opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              {t('home.heroTitle')}
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-light mb-12 max-w-2xl animate-fade-in opacity-0 tracking-wide" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
              {t('home.heroSubtitle')}
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-4 border border-gold/50 text-gold px-12 py-4 text-xs font-medium uppercase tracking-[0.2em] hover:bg-gold hover:text-black transition-all duration-500 animate-fade-in opacity-0 group"
              style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}
            >
              {t('home.heroButton')}
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-x-1 transition-transform duration-300">
                <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-shop py-32 border-b border-white/5">
        <SectionHeader title={t('home.categories')} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-secondary/20 animate-pulse rounded-none" />
            ))
          ) : categories.map((cat, idx) => (
            <Link
              key={cat.id}
              to={`/catalog?category=${cat.slug}`}
              className="group relative flex aspect-[3/4] overflow-hidden bg-anthracite"
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-700 z-10" />
              <img 
                src={(cat as any).image_url || `https://images.unsplash.com/photo-1587836374828-cb43afbf2b7f?auto=format&fit=crop&w=600&q=80&ixlib=rb-4.0.3`} 
                alt={cat.name} 
                className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-[1.5s] ease-out opacity-60 group-hover:opacity-100"
              />
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                <span className="text-gold uppercase tracking-[0.2em] text-[10px] mb-2 font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">Collection</span>
                <h3 className="text-2xl font-serif text-white tracking-widest uppercase">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Storytelling Section */}
      <section className="bg-black py-32 border-b border-white/5">
        <div className="container-shop">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="aspect-[4/5] relative overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=800&q=80" alt="Craftsmanship" className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-[2s] ease-out opacity-80" />
              <div className="absolute inset-0 border border-white/20 m-6 z-10 pointer-events-none transition-all duration-700 group-hover:m-4"></div>
            </div>
            <div className="max-w-xl pl-0 lg:pl-10">
              <span className="text-gold tracking-[0.3em] text-xs font-medium uppercase mb-6 block">Heritage & Masterpiece</span>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-8 leading-[1.2] tracking-wide">A Legacy of Precision</h2>
              <p className="text-white/60 font-light leading-relaxed mb-12 text-lg">
                For decades, we have been crafting timeless pieces that transcend generations. Every detail is meticulously designed to reflect the pinnacle of luxury, ensuring that what you wear is not just an accessory, but a statement of enduring excellence and unparalleled craftsmanship.
              </p>
              <Link to="/about" className="inline-block border-b border-gold text-gold pb-1 text-xs uppercase tracking-[0.2em] font-medium hover:text-white hover:border-white transition-colors duration-300">
                Discover Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="container-shop py-32 border-b border-white/5">
        <SectionHeader title={t('home.newArrivals')} link="/catalog?sort=newest" linkText={t('home.viewAll')} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {newProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Popular */}
      <section className="bg-black py-32">
        <div className="container-shop">
          <SectionHeader title={t('home.popularProducts')} link="/catalog?sort=popular" linkText={t('home.viewAll')} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {popularProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Sale */}
      {saleProducts.length > 0 && (
        <section className="bg-anthracite py-32 border-t border-white/5">
          <div className="container-shop">
            <SectionHeader title={t('home.saleProducts')} link="/catalog" linkText={t('home.viewAll')} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
              {saleProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({ title, link, linkText }: { title: string; link?: string; linkText?: string }) {
  return (
    <div className="flex flex-col items-center justify-center mb-20 text-center">
      <h2 className="text-3xl lg:text-4xl font-serif text-white uppercase tracking-[0.1em]">{title}</h2>
      <div className="w-12 h-[1px] bg-gold my-8"></div>
      {link && linkText && (
        <Link to={link} className="group flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/50 hover:text-gold transition-colors duration-300 font-medium">
          {linkText} 
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      )}
    </div>
  );
}
