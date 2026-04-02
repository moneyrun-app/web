export default function SkeletonLoader({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-card rounded-2xl p-5 space-y-3">
      <SkeletonLoader className="h-4 w-24" />
      <SkeletonLoader className="h-4 w-full" />
      <SkeletonLoader className="h-4 w-3/4" />
    </div>
  );
}
