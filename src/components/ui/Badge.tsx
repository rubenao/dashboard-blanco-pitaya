import { cn } from '../../lib/utils'
import type { NivelInteres, EstatusPago } from '../../types'
import { NIVEL_LABELS } from '../../types'

const nivelColors: Record<NivelInteres, string> = {
  'Fantasma':         'bg-slate-100 text-slate-500 border border-slate-200',
  'Curioso':          'bg-sky-50 text-sky-700 border border-sky-200',
  'Muy_Interesado':   'bg-blue-50 text-blue-700 border border-blue-200',
  'Lead_a_Futuro':    'bg-violet-50 text-violet-700 border border-violet-200',
  'Listo_para_Pagar': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Cliente_Cerrado':  'bg-emerald-50 text-emerald-700 border border-emerald-200',
}

const estatusColors: Record<EstatusPago, string> = {
  'Pendiente':   'bg-slate-100 text-slate-600 border border-slate-200',
  'Por Validar': 'bg-orange-50 text-orange-700 border border-orange-300',
  'Aprobado':    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Rechazado':   'bg-red-50 text-red-700 border border-red-200',
}

interface BadgeProps {
  label: string
  className?: string
}

export function NivelBadge({ label, className }: BadgeProps) {
  const nivel = label as NivelInteres
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', nivelColors[nivel], className)}>
      {NIVEL_LABELS[nivel] ?? label}
    </span>
  )
}

export function EstatusBadge({ label, className }: BadgeProps) {
  const isPorValidar = label === 'Por Validar'
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
      estatusColors[label as EstatusPago],
      className
    )}>
      {isPorValidar && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
        </span>
      )}
      {label}
    </span>
  )
}
