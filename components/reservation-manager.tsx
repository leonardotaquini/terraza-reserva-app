"use client"

import { useState } from "react"
import { TerraceCalendar } from "@/components/terrace-calendar"
import { ReservationDialog } from "@/components/reservation-dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type Reservation = {
  id: string
  reservation_date: string
  time_slot: string
  floor: number
  apartment: string
  reservation_code: string
}

type ReservationManagerProps = {
  reservations: Reservation[]
}

export function ReservationManager({ reservations }: ReservationManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<"morning" | "afternoon_evening" | null>(null)
  const router = useRouter()

  const handleDateSelect = (date: Date, timeSlot: "morning" | "afternoon_evening") => {
    setSelectedDate(date)
    setSelectedTimeSlot(timeSlot)
    setDialogOpen(true)
  }

  const handleCancelReservation = async (reservationId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("terrace_reservations").delete().eq("id", reservationId)

      if (error) throw error

      // Remove from localStorage
      localStorage.removeItem(`reservation_${reservationId}`)

      // Refresh to show updated calendar
      router.refresh()
    } catch (err) {
      alert("Error al cancelar la reserva. Por favor intenta nuevamente.")
      console.error(err)
    }
  }

  return (
    <>
      <TerraceCalendar
        reservations={reservations}
        onDateSelect={handleDateSelect}
        onCancelReservation={handleCancelReservation}
      />
      <ReservationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        date={selectedDate}
        timeSlot={selectedTimeSlot}
      />
    </>
  )
}
