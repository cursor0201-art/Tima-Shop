import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import type { ProductFilters } from '@/types';

interface FiltersPanelProps {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
}

const categories = ['clothing', 'shoes', 'accessories', 'bags'];
const brands = ['Nike', 'Adidas', 'Zara', 'H&M'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colors = ['Чёрный', 'Белый', 'Синий', 'Красный', 'Зелёный', 'Бежевый'];

export default function FiltersPanel({ filters, onChange }: FiltersPanelProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const update = (key: keyof ProductFilters, value: unknown) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  const reset = () => {
    onChange({ page: 1 });
  };

  const hasActive = filters.category || filters.brand || filters.size || filters.color || filters.min_price || filters.max_price || filters.in_stock;

  return (
    <div>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground mb-4"
      >
        <SlidersHorizontal size={16} />
        {open ? t('catalog.hideFilters') : t('catalog.showFilters')}
      </button>

      <div className={`space-y-6 ${open ? 'block' : 'hidden lg:block'}`}>
        {/* Category */}
        <FilterSection title={t('catalog.category')}>
          <select
            value={filters.category || ''}
            onChange={(e) => update('category', e.target.value || undefined)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{t('common.all')}</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </FilterSection>

        {/* Brand */}
        <FilterSection title={t('catalog.brand')}>
          <select
            value={filters.brand || ''}
            onChange={(e) => update('brand', e.target.value || undefined)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{t('common.all')}</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </FilterSection>

        {/* Size */}
        <FilterSection title={t('catalog.size')}>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => update('size', filters.size === s ? undefined : s)}
                className={`min-w-[40px] rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  filters.size === s
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-foreground hover:border-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Color */}
        <FilterSection title={t('catalog.color')}>
          <select
            value={filters.color || ''}
            onChange={(e) => update('color', e.target.value || undefined)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{t('common.all')}</option>
            {colors.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </FilterSection>

        {/* Price */}
        <FilterSection title={t('catalog.priceRange')}>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder={t('catalog.minPrice')}
              value={filters.min_price || ''}
              onChange={(e) => update('min_price', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder={t('catalog.maxPrice')}
              value={filters.max_price || ''}
              onChange={(e) => update('max_price', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </FilterSection>

        {/* In stock */}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={!!filters.in_stock}
            onChange={(e) => update('in_stock', e.target.checked || undefined)}
            className="rounded border-border"
          />
          {t('catalog.onlyInStock')}
        </label>

        {/* Reset */}
        {hasActive && (
          <button
            onClick={reset}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
            {t('common.reset')}
          </button>
        )}
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{title}</h4>
      {children}
    </div>
  );
}
