export function RestaurantCardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.06)] animate-pulse">
      <div className="flex gap-4 p-4">
        <div className="w-20 h-20 rounded-xl bg-[#1E1E1E] flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[#1E1E1E] rounded-lg w-3/4" />
          <div className="h-3 bg-[#1E1E1E] rounded-lg w-1/2" />
          <div className="h-3 bg-[#1E1E1E] rounded-lg w-1/3" />
          <div className="flex gap-2">
            <div className="h-5 bg-[#1E1E1E] rounded-full w-12" />
            <div className="h-5 bg-[#1E1E1E] rounded-full w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function CardSkeletons({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </div>
  )
}
