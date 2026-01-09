"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type Reservation = {
  id: string
  reservation_date: string
  time_slot: string
  floor: number
  apartment: string
  reservation_code: string
}

type TerraceCalendarProps = {
  reservations: Reservation[]
  onDateSelect: (date: Date, timeSlot: "morning" | "afternoon_evening") => void
  onCancelReservation: (reservationId: string) => void
}

export function TerraceCalendar({ reservations, onDateSelect, onCancelReservation }: TerraceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [userCodes, setUserCodes] = useState<Record<string, string>>({})
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean
    reservation: Reservation | null
  }>({
    open: false,
    reservation: null,
  })

  useEffect(() => {
    const codes: Record<string, string> = {}
    reservations.forEach((reservation) => {
      const storedCode = localStorage.getItem(`reservation_${reservation.id}`)
      if (storedCode) {
        codes[reservation.id] = storedCode
      }
    })
    setUserCodes(codes)
  }, [reservations])

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const isReserved = (day: number, timeSlot: "morning" | "afternoon_evening") => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(day).padStart(2, "0")}`
    return reservations.some((r) => r.reservation_date === dateStr && r.time_slot === timeSlot)
  }

  const getReservation = (day: number, timeSlot: "morning" | "afternoon_evening") => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(day).padStart(2, "0")}`
    return reservations.find((r) => r.reservation_date === dateStr && r.time_slot === timeSlot)
  }

  const isPastDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const canCancelReservation = (reservation: Reservation) => {
    return userCodes[reservation.id] === reservation.reservation_code
  }

  const handleSlotClick = (day: number, timeSlot: "morning" | "afternoon_evening") => {
    const reservation = getReservation(day, timeSlot)

    if (reservation) {
      if (canCancelReservation(reservation)) {
        setCancelDialog({
          open: true,
          reservation,
        })
      } else {
        alert("Esta reserva pertenece a otro departamento. Solo quien reservó puede cancelarla.")
      }
    } else if (!isPastDate(day)) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      onDateSelect(date, timeSlot)
    }
  }

  const handleConfirmCancel = () => {
    if (cancelDialog.reservation) {
      onCancelReservation(cancelDialog.reservation.id)
      setCancelDialog({ open: false, reservation: null })
    }
  }

  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-16 sm:h-24" />)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const morningReserved = isReserved(day, "morning")
    const afternoonReserved = isReserved(day, "afternoon_evening")
    const morningReservation = getReservation(day, "morning")
    const afternoonReservation = getReservation(day, "afternoon_evening")
    const past = isPastDate(day)
    const canCancelMorning = morningReservation && canCancelReservation(morningReservation)
    const canCancelAfternoon = afternoonReservation && canCancelReservation(afternoonReservation)

    days.push(
      <div key={day} className={cn("border border-border p-0.5 sm:p-1 min-h-16 sm:min-h-24", past && "bg-muted/30")}>
        <div className="font-medium text-xs sm:text-sm mb-0.5 sm:mb-1">{day}</div>
        <div className="flex flex-col gap-0.5 sm:gap-1">
          <button
            onClick={() => handleSlotClick(day, "morning")}
            disabled={past}
            className={cn(
              "text-[10px] sm:text-xs p-0.5 sm:p-1.5 rounded transition-colors text-left leading-tight",
              morningReserved
                ? canCancelMorning
                  ? "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200 cursor-pointer hover:bg-orange-200 dark:hover:bg-orange-900 font-semibold"
                  : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 cursor-not-allowed"
                : past
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900 cursor-pointer",
            )}
          >
            {morningReserved ? (
              <span className="font-medium block">
                <span className="hidden sm:inline">Mañana: </span>
                {morningReservation?.floor}
                {morningReservation?.apartment}
                {canCancelMorning && <span className="ml-1">✓</span>}
              </span>
            ) : (
              <span className="hidden sm:inline">Mañana</span>
            )}
            {!morningReserved && <span className="sm:hidden">M</span>}
          </button>
          <button
            onClick={() => handleSlotClick(day, "afternoon_evening")}
            disabled={past}
            className={cn(
              "text-[10px] sm:text-xs p-0.5 sm:p-1.5 rounded transition-colors text-left leading-tight",
              afternoonReserved
                ? canCancelAfternoon
                  ? "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200 cursor-pointer hover:bg-orange-200 dark:hover:bg-orange-900 font-semibold"
                  : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 cursor-not-allowed"
                : past
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900 cursor-pointer",
            )}
          >
            {afternoonReserved ? (
              <span className="font-medium block">
                <span className="hidden sm:inline">Tarde: </span>
                {afternoonReservation?.floor}
                {afternoonReservation?.apartment}
                {canCancelAfternoon && <span className="ml-1">✓</span>}
              </span>
            ) : (
              <span className="hidden sm:inline">Tarde/Noche</span>
            )}
            {!afternoonReserved && <span className="sm:hidden">T</span>}
          </button>
        </div>
      </div>,
    )
  }

  return (
    <>
      <Card className="sm:grid sm:place-content-center">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-xl sm:text-2xl">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </CardTitle>
            <div className="flex gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={previousMonth}
                className="h-8 w-8 sm:h-10 sm:w-10 bg-transparent"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextMonth}
                className="h-8 w-8 sm:h-10 sm:w-10 bg-transparent"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <div className="grid grid-cols-7 gap-px mb-1 sm:mb-2">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
              <div key={day} className="text-center font-semibold text-xs sm:text-sm p-1 sm:p-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-border">{days}</div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 dark:bg-green-950 rounded border border-green-300 dark:border-green-800" />
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-100 dark:bg-orange-950 rounded border border-orange-300 dark:border-orange-800" />
              <span>Tu reserva ✓ (click para cancelar)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-100 dark:bg-red-950 rounded border border-red-300 dark:border-red-800" />
              <span>Reservado por otro</span>
            </div>
            <div className="sm:hidden text-muted-foreground">M = Mañana, T = Tarde/Noche</div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({ open, reservation: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar Reserva</DialogTitle>
            <DialogDescription>¿Estás seguro que deseas cancelar tu reserva?</DialogDescription>
          </DialogHeader>
          {cancelDialog.reservation && (
            <div className="py-4">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Fecha:</span>{" "}
                  {new Date(cancelDialog.reservation.reservation_date).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p>
                  <span className="font-semibold">Horario:</span>{" "}
                  {cancelDialog.reservation.time_slot === "morning" ? "Mañana" : "Tarde/Noche"}
                </p>
                <p>
                  <span className="font-semibold">Departamento:</span> {cancelDialog.reservation.floor}
                  {cancelDialog.reservation.apartment}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setCancelDialog({ open: false, reservation: null })}
              className="w-full sm:w-auto"
            >
              No, mantener reserva
            </Button>
            <Button onClick={handleConfirmCancel} variant="destructive" className="w-full sm:w-auto">
              Sí, cancelar reserva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
