"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { formatLongDate } from "@/lib/formatDate"

type ReservationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date | null
  timeSlot: "morning" | "afternoon_evening" | null
}

export function ReservationDialog({ open, onOpenChange, date, timeSlot }: ReservationDialogProps) {
  const [floor, setFloor] = useState<string>("")
  const [apartment, setApartment] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reservationCode, setReservationCode] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !timeSlot || !floor || !apartment) return

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
      )}-${String(date.getDate()).padStart(2, "0")}`

      const { data, error: insertError } = await supabase
        .from("terrace_reservations")
        .insert({
          reservation_date: dateStr,
          time_slot: timeSlot,
          floor: Number.parseInt(floor),
          apartment,
        })
        .select()
        .single()

      if (insertError) throw insertError

      if (data) {
        const reservationKey = `reservation_${data.id}`
        localStorage.setItem(reservationKey, data.reservation_code)
        setReservationCode(data.reservation_code)
      }

      setFloor("")
      setApartment("")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la reserva")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setReservationCode(null)
    onOpenChange(false)
  }

  const timeSlotText = timeSlot === "morning" ? "Mañana" : "Tarde/Noche"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {reservationCode ? "¡Reserva Confirmada!" : "Reservar Terraza"}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {date && !reservationCode && (
              <>
                <span className="font-medium">Fecha: </span>
                {
                  formatLongDate(date)
                }
                <br />
                <span className="font-medium">Horario: </span>
                {timeSlotText}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        {reservationCode ? (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm sm:text-base mb-3 text-green-900 dark:text-green-100">
                Tu reserva ha sido creada exitosamente. Solamente podrás cancelar la reserva desde este dispositivo.
              </p>

            </div>
            <Button onClick={handleClose} className="w-full">
              Entendido
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="floor" className="text-sm sm:text-base">
                Piso
              </Label>
              <Select value={floor} onValueChange={setFloor} required>
                <SelectTrigger id="floor" className="h-10 sm:h-11">
                  <SelectValue placeholder="Selecciona tu piso" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((f) => (
                    <SelectItem key={f} value={String(f)}>
                      Piso {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apartment" className="text-sm sm:text-base">
                Departamento
              </Label>
              <Select value={apartment} onValueChange={setApartment} required>
                <SelectTrigger id="apartment" className="h-10 sm:h-11">
                  <SelectValue placeholder="Selecciona tu departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-xs sm:text-sm text-red-500">{error}</p>}
            <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={handleClose} className="w-full sm:w-auto bg-transparent">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || !floor || !apartment} className="w-full sm:w-auto">
                {isLoading ? "Reservando..." : "Confirmar Reserva"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
