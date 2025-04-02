import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BookingsTable } from "@/components/dashboard/bookings-table";
import { BookingsFilter } from "@/components/dashboard/bookings-filter";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookingsPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Bookings"
        description="Manage your property bookings"
      />
      
      <BookingsFilter />
      
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <BookingsTable />
      </Suspense>
    </div>
  );
}
