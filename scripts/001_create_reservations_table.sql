-- Crear tabla de reservas para la terraza
CREATE TABLE IF NOT EXISTS public.terrace_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_date DATE NOT NULL,
  time_slot TEXT NOT NULL CHECK (time_slot IN ('morning', 'afternoon_evening')),
  floor INTEGER NOT NULL CHECK (floor >= 1 AND floor <= 6),
  apartment TEXT NOT NULL CHECK (apartment IN ('A', 'B')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar reservas duplicadas para la misma fecha y horario
  UNIQUE(reservation_date, time_slot)
);

-- Habilitar Row Level Security
ALTER TABLE public.terrace_reservations ENABLE ROW LEVEL SECURITY;

-- Política para que todos puedan ver las reservas (para ver disponibilidad)
CREATE POLICY "Anyone can view reservations"
  ON public.terrace_reservations
  FOR SELECT
  USING (true);

-- Política para que cualquiera pueda crear reservas
CREATE POLICY "Anyone can create reservations"
  ON public.terrace_reservations
  FOR INSERT
  WITH CHECK (true);

-- Política para que cualquiera pueda cancelar/eliminar reservas
CREATE POLICY "Anyone can delete reservations"
  ON public.terrace_reservations
  FOR DELETE
  USING (true);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_reservation_date ON public.terrace_reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservation_date_slot ON public.terrace_reservations(reservation_date, time_slot);
