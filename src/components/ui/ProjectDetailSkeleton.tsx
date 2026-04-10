export default function ProjectDetailSkeleton() {
  return (
    <section className="py-6 sm:py-8 lg:py-12 bg-gray-50 min-h-screen animate-pulse">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <div className="h-4 bg-gray-200 rounded w-48 mb-6" />

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="rounded-2xl bg-gray-200 h-56 sm:h-72 lg:h-96" />

            <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-4">
              <div className="h-7 bg-gray-200 rounded w-2/3" />
              <div className="flex gap-4">
                <div className="h-4 bg-gray-100 rounded w-40" />
                <div className="h-4 bg-gray-100 rounded w-24" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-100 rounded w-32" />
                  <div className="h-4 bg-gray-100 rounded w-12" />
                </div>
                <div className="h-3 bg-gray-100 rounded-full" />
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-100 rounded w-36" />
                  <div className="h-3 bg-gray-100 rounded w-28" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="w-5 h-5 bg-gray-200 rounded mx-auto" />
                    <div className="h-4 bg-gray-200 rounded w-16 mx-auto" />
                    <div className="h-3 bg-gray-100 rounded w-20 mx-auto" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-48" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-40" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-8 bg-gray-100 rounded-full w-full" />
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-full" />
              </div>
              <div className="h-12 bg-gray-200 rounded-xl w-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
