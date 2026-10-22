/* Soporte de los presupuestos de proyecto: SUPPORT_DAYS días desde la entrega,
   con una revisión recomendada SUPPORT_REVIEW_DAYS días antes del cierre.
   Lo usan la pantalla del presupuesto, el PDF, la constancia y el correo. */

import { addDays, daysBetween } from "./format"
import { SUPPORT_DAYS, SUPPORT_REVIEW_DAYS } from "./types"

export interface SupportWindow {
  /** Entrega: primer día del soporte */
  start: string
  /** Último día del soporte */
  end: string
  /** Desde cuándo se recomienda la revisión final */
  review: string
  days: number
}

/** Fin por defecto: la entrega más SUPPORT_DAYS días */
export const defaultSupportEnd = (start: string) => addDays(start, SUPPORT_DAYS)

/** Fechas del soporte; null si el proyecto todavía no se entrega */
export function supportWindow(b: { support_start?: string | null; support_end?: string | null }): SupportWindow | null {
  if (!b.support_start) return null
  const end = b.support_end && b.support_end >= b.support_start ? b.support_end : defaultSupportEnd(b.support_start)
  const days = daysBetween(b.support_start, end)
  return { start: b.support_start, end, review: addDays(end, -Math.min(SUPPORT_REVIEW_DAYS, days)), days }
}

export type SupportState = "por-iniciar" | "activo" | "revision" | "vencido"

/** En qué va el soporte hoy y cuántos días le quedan */
export function supportState(w: SupportWindow, today: string): { state: SupportState; left: number } {
  const left = daysBetween(today, w.end)
  if (today < w.start) return { state: "por-iniciar", left: daysBetween(today, w.start) }
  if (today > w.end) return { state: "vencido", left: 0 }
  return { state: today >= w.review ? "revision" : "activo", left }
}
