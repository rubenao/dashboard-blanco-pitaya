import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, toZonedTime } from 'date-fns-tz'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const TZ = 'America/Mexico_City'

/** Convierte un timestamp UTC a zona horaria México y lo formatea */
export function formatMexDate(date: string | Date, fmt = 'dd/MM/yyyy HH:mm'): string {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    const zoned = toZonedTime(d, TZ)
    return format(zoned, fmt, { locale: es, timeZone: TZ })
  } catch {
    return '—'
  }
}

/** Formatea solo la fecha (sin hora) en zona México */
export function formatMexDateOnly(date: string | Date): string {
  return formatMexDate(date, 'dd MMM yyyy')
}

/** Obtiene la fecha en formato yyyy-MM-dd en zona México (para agrupar por día) */
export function toMexDateKey(date: string | Date): string {
  return formatMexDate(date, 'yyyy-MM-dd')
}

/** Parsea de forma segura el campo `message` (JSONB) de la tabla conversaciones */
export interface MessageContent {
  type: 'human' | 'ai'
  content: string
}

export function parseMessage(raw: unknown): MessageContent | null {
  if (!raw) return null
  try {
    if (typeof raw === 'object' && raw !== null) {
      const obj = raw as Record<string, unknown>
      if (typeof obj.type === 'string' && typeof obj.content === 'string') {
        return { type: obj.type as 'human' | 'ai', content: obj.content }
      }
    }
    if (typeof raw === 'string') {
      const parsed = JSON.parse(raw)
      return parseMessage(parsed)
    }
  } catch {
    return null
  }
  return null
}

/** Formatea moneda en MXN */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount)
}
