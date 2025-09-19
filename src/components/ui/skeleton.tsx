import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

// Hero Section Skeleton
export function HeroSkeleton() {
  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-5xl mx-auto text-center">
          {/* Title skeleton */}
          <Skeleton className="h-12 lg:h-16 w-full max-w-4xl mx-auto mb-6" />

          {/* Subtitle skeleton */}
          <Skeleton className="h-6 lg:h-8 w-full max-w-3xl mx-auto mb-12" />

          {/* Stats skeleton */}
          <div className="flex justify-center gap-12 mb-8">
            <div className="text-center">
              <Skeleton className="h-12 lg:h-16 w-24 mx-auto mb-2" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
            <div className="text-center">
              <Skeleton className="h-12 lg:h-16 w-24 mx-auto mb-2" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          </div>

          {/* Benefits card skeleton */}
          <div className="bg-white rounded-xl p-8 shadow-lg max-w-3xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-0.5" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Process Section Skeleton
export function ProcessSkeleton() {
  return (
    <section className="pt-16 lg:pt-24 pb-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Skeleton className="h-10 lg:h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-64 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Earnings Calculator Skeleton
export function EarningsCalculatorSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 text-center border-b">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section Skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-6 w-24" />

              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
              ))}
            </div>

            {/* Results Section Skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-6 w-32" />

              <div className="space-y-4 p-4 bg-secondary/50 rounded-lg">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Testimonials Skeleton
export function TestimonialsSkeleton() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Skeleton className="h-10 lg:h-12 w-80 mx-auto" />
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center space-x-2 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-4 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-16 w-full mb-4" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { Skeleton };
