import { createClient } from "@/lib/supabase/server"
import { ReservationManager } from "@/components/reservation-manager"

export const dynamic = "force-dynamic"

export default async function Home() {
  const supabase = await createClient()

  const { data: reservations } = await supabase
    .from("terrace_reservations")
    .select("*")
    .order("reservation_date", { ascending: true })

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-8">
      <div>
        <ReservationManager reservations={reservations || []} />
      </div>
    </div>
  )
}
