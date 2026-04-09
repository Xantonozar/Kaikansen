export function LoadingSkeleton({ count = 3 }: { count?: number } = {}) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="card h-24 animate-pulse bg-muted" />
      ))}
    </div>
  )
}
