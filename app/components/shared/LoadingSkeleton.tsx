export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card h-24 animate-pulse bg-muted" />
      ))}
    </div>
  )
}
