import { Skeleton } from "./ui/skeleton";

export function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {/* Skeleton for user message */}
      <div className="flex justify-end">
        <div className="flex gap-2 max-w-xs">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-12 w-48 rounded-lg" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
        </div>
      </div>

      {/* Skeleton for other message */}
      <div className="flex justify-start">
        <div className="flex gap-2 max-w-xs">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-12 w-48 rounded-lg" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
        </div>
      </div>

      {/* Skeleton for user message */}
      <div className="flex justify-end">
        <div className="flex gap-2 max-w-xs">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-16 w-56 rounded-lg" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
