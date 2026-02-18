import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="space-y-10 py-4">
      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-12 w-full max-w-xl" />
          <Skeleton className="h-4 w-full max-w-lg" />
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
        <Skeleton className="h-72 w-full" />
      </section>

      <section className="space-y-4">
        <Skeleton className="h-8 w-52" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <Skeleton className="h-8 w-52" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-72 w-full" />
          ))}
        </div>
      </section>
    </div>
  );
}

