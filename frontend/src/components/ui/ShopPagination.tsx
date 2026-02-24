import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ShopPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ShopPagination({ currentPage, totalPages, onPageChange }: ShopPaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== -1) {
      pages.push(-1); // ellipsis
    }
  }

  return (
    <nav className="flex items-center justify-center gap-1 py-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
      >
        <ChevronLeft size={18} />
      </button>

      {pages.map((p, i) =>
        p === -1 ? (
          <span key={`e${i}`} className="px-2 text-muted-foreground">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[36px] h-9 rounded-md text-sm font-medium transition-colors ${
              p === currentPage
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
