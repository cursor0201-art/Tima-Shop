import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ProductCard from '@/components/product/ProductCard';
import FiltersPanel from '@/components/catalog/FiltersPanel';
import ShopPagination from '@/components/ui/ShopPagination';
import EmptyState from '@/components/ui/EmptyState';
import { shopApi } from '@/services/api';
import type { ProductFilters, Product } from '@/types';
import { Link } from 'react-router-dom';

export default function CatalogPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState<ProductFilters>({
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    sort: (searchParams.get('sort') as ProductFilters['sort']) || undefined,
    page: 1,
  });

  useEffect(() => {
    setIsLoading(true);
    shopApi.getProducts(filters)
      .then((res) => {
        setProducts(res.results);
        setTotalCount(res.count);
      })
      .catch((err) => console.error("Error fetching catalog", err))
      .finally(() => setIsLoading(false));
  }, [filters]);

  return (
    <div className="container-shop py-4">
      <Breadcrumbs items={[
        { label: t('common.home'), path: '/' },
        { label: t('catalog.title') },
      ]} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('catalog.title')}</h1>

        {/* Sort */}
        <select
          value={filters.sort || ''}
          onChange={(e) => setFilters({ ...filters, sort: (e.target.value as ProductFilters['sort']) || undefined })}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">{t('catalog.sort')}</option>
          <option value="price_asc">{t('catalog.sortPriceAsc')}</option>
          <option value="price_desc">{t('catalog.sortPriceDesc')}</option>
          <option value="newest">{t('catalog.sortNewest')}</option>
          <option value="popular">{t('catalog.sortPopular')}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        <aside>
          <FiltersPanel filters={filters} onChange={setFilters} />
        </aside>

        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {t('catalog.resultsCount', { count: totalCount })}
          </p>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground w-8 h-8" /></div>
          ) : products.length === 0 ? (
            <EmptyState
              title={t('catalog.noProducts')}
              description={t('catalog.noProductsHint')}
              action={
                <Link
                  to="/catalog"
                  onClick={() => setFilters({ page: 1 })}
                  className="rounded-md bg-foreground text-background px-6 py-2.5 text-sm font-medium hover:bg-foreground/90 transition-colors"
                >
                  {t('common.reset')}
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <ShopPagination
            currentPage={filters.page || 1}
            totalPages={Math.ceil(totalCount / 20)}
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
        </div>
      </div>
    </div>
  );
}
