-- Agregar columna de código de reserva
ALTER TABLE public.terrace_reservations
ADD COLUMN reservation_code TEXT NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8);

-- Crear índice para búsquedas por código
CREATE INDEX IF NOT EXISTS idx_reservation_code ON public.terrace_reservations(reservation_code);
