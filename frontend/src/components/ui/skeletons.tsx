export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded-md bg-muted" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-20 rounded bg-muted" />
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-md bg-muted" />
      <div className="mt-2 h-4 w-2/3 mx-auto rounded bg-muted" />
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="aspect-[3/4] rounded-md bg-muted" />
      <div className="space-y-4">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-8 w-3/4 rounded bg-muted" />
        <div className="h-6 w-32 rounded bg-muted" />
        <div className="h-20 w-full rounded bg-muted" />
        <div className="h-10 w-full rounded bg-muted" />
      </div>
    </div>
  );
}
