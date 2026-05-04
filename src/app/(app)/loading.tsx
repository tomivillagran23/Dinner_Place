import { CardSkeletons } from '@/components/LoadingSkeleton'

export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="h-6 bg-[#1E1E1E] rounded-lg w-48 animate-pulse" />
          <div className="h-3 bg-[#1E1E1E] rounded-lg w-32 mt-2 animate-pulse" />
        </div>
        <div className="h-9 w-28 bg-[#1E1E1E] rounded-xl animate-pulse" />
      </div>
      <div className="h-10 bg-[#141414] rounded-xl mb-3 animate-pulse" />
      <div className="flex gap-2 mb-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-7 w-16 bg-[#141414] rounded-full animate-pulse flex-shrink-0" />
        ))}
      </div>
      <CardSkeletons count={5} />
    </div>
  )
}
