import { createClient } from "@/lib/supabase/server"
import { ReservationManager } from "@/components/reservation-manager"
import { AuroraText } from "@/components/ui/aurora-text"

export const dynamic = "force-dynamic"

export default async function Home() {
  const supabase = await createClient()

  const { data: reservations } = await supabase
    .from("terrace_reservations")
    .select("*")
    .order("reservation_date", { ascending: true })

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-8">
      <div className="flex gap-8 justify-center h-[90vh] flex-col">
        <div className="text-center text-3xl font-bold tracking-tighter md:text-3xl lg:text-5xl">
          <AuroraText colors={["#154A8F", "#154A8F", "#92939C", "#92939C"]}>Reserva de la terraza</AuroraText>
        </div>
        <ReservationManager reservations={reservations || []} />
      </div>
    </div>
  )
}
