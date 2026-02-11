// src/lib/date-helpers.ts
import { format as dfFormat, parse as dfParse, isValid, Locale } from "date-fns";
import { es } from "date-fns/locale";

type InputDate = Date | string | number;

const LOCALE = es as Locale;

// Patrones que realmente usás
const PATTERN_DATE_ONLY = "yyyy-MM-dd";          // ej: 2025-09-05
const PATTERN_DMY_HMS = "dd-MM-yyyy HH:mm:ss"; // ej: 05-09-2025 10:30:00

/** Intenta parsear respetando tus formatos; si ya es Date válida, la devuelve. */
export function parseFlexible(input: InputDate): Date {
  if (input instanceof Date) return isValid(input) ? input : new Date(NaN);

  if (typeof input === "number") {
    const d = new Date(input);
    return isValid(d) ? d : new Date(NaN);
  }

  // 1) dd-MM-yyyy HH:mm:ss (tu caso de gráficos)
  let d = dfParse(input, PATTERN_DMY_HMS, new Date());
  if (isValid(d)) return d;

  // 2) yyyy-MM-dd (tu caso de solo fecha)
  d = dfParse(input, PATTERN_DATE_ONLY, new Date());
  if (isValid(d)) return d;

  // 3) Fallback: constructor nativo (ISO, etc.)
  d = new Date(input);
  return isValid(d) ? d : new Date(NaN);
}

/** Fecha larga en español: "5 de septiembre de 2025" */
export function formatLongDate(input: InputDate): string {
  const d = parseFlexible(input);
  if (!isValid(d)) return "Fecha inválida";
  // Con date-fns usamos patrón para tener control total
  return dfFormat(d, "d 'de' MMMM 'de' yyyy", { locale: LOCALE });
}

/** Fecha corta: "05/09/2025" */
export function formatShortDate(input: InputDate): string {
  const d = parseFlexible(input);
  if (!isValid(d)) return "Fecha inválida";
  return dfFormat(d, "dd/MM/yyyy", { locale: LOCALE });
}

/** Fecha + hora completa en hora de Argentina: "05/09/2025 10:30:00" */
export function formatDateTime(input: InputDate): string {
  const d = parseFlexible(input);
  if (!isValid(d)) return "Fecha inválida";
  // Usamos Intl para forzar la zona horaria de Argentina
  const parts = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);

  // Extraemos los valores de los parts
  const get = (type: string) => parts.find(p => p.type === type)?.value || "";
  return `${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

/** Etiqueta corta para ejes: "05/09 10:30" */
export function formatAxisLabel(input: InputDate): string {
  const d = parseFlexible(input);
  if (!isValid(d)) return "";
  return dfFormat(d, "dd/MM HH:mm", { locale: LOCALE });
}

/** Solo hora:minuto: "10:30" */
export function formatTimeHM(input: InputDate): string {
  const d = parseFlexible(input);
  if (!isValid(d)) return "";
  return dfFormat(d, "HH:mm", { locale: LOCALE });
}

/** Convierte a string en GMT/UTC (sin dependencias tz): "05/09/2025 13:30:00 GMT" */
export function formatDateTimeGMT(input: InputDate): string {
  const d = parseFlexible(input);
  if (!isValid(d)) return "Fecha inválida";
  // Usamos Intl para zona horaria (date-fns no maneja tz sin date-fns-tz)
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d) + " GMT";
}

/** Devuelve un Date ajustado a GMT (equivalente a "hora absoluta" sin tz local). */
export function toGMTDate(input: InputDate): Date {
  const d = parseFlexible(input);
  if (!isValid(d)) return new Date(NaN);
  // getTime() ya es tiempo Unix absoluto; devolver una copia es suficiente.
  // Si querés "strippear" tz de una etiqueta local, usá formatDateTimeGMT.
  return new Date(d.getTime());
}

/** Utilidad segura: si no es válida, devuelve null en vez de Date inválida */
export function tryParse(input: InputDate): Date | null {
  const d = parseFlexible(input);
  return isValid(d) ? d : null;
}
