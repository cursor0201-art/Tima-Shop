import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/skeletons';
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
    <div>
      {/* Hero */}
      <section className="relative bg-foreground text-background">
        <div className="container-shop py-24 md:py-32 lg:py-40">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-4">
              {t('home.heroTitle')}
            </h1>
            <p className="text-lg md:text-xl text-background/70 mb-8">
              {t('home.heroSubtitle')}
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 bg-background text-foreground px-8 py-3.5 rounded-md text-sm font-semibold uppercase tracking-wider hover:bg-background/90 transition-colors"
            >
              {t('home.heroButton')}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-shop py-16">
        <SectionHeader title={t('home.categories')} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-md" />
            ))
          ) : categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalog?category=${cat.slug}`}
              className="group relative aspect-square rounded-md bg-secondary overflow-hidden"
            >
              <div className="absolute inset-0 bg-foreground/5 group-hover:bg-foreground/10 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <h3 className="text-lg font-semibold text-foreground">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="container-shop py-16">
        <SectionHeader title={t('home.newArrivals')} link="/catalog?sort=newest" linkText={t('home.viewAll')} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {newProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Popular */}
      <section className="container-shop py-16">
        <SectionHeader title={t('home.popularProducts')} link="/catalog?sort=popular" linkText={t('home.viewAll')} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {popularProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Sale */}
      {saleProducts.length > 0 && (
        <section className="bg-secondary/50">
          <div className="container-shop py-16">
            <SectionHeader title={t('home.saleProducts')} link="/catalog" linkText={t('home.viewAll')} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      {link && linkText && (
        <Link to={link} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          {linkText} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
