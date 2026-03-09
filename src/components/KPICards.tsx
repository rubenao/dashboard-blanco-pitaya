import { Users, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react'
import { cn, formatCurrency } from '../lib/utils'
import type { Prospecto, Pago } from '../types'

interface KPICardsProps {
  prospectos: Prospecto[]
  pagos: Pago[]
  loading: boolean
}

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  colorClass: string
  bgClass: string
  alert?: boolean
}

function KPICard({ title, value, subtitle, icon, colorClass, bgClass, alert }: KPICardProps) {
  return (
    <div className={cn(
      'bg-white rounded-xl border p-5 shadow-sm flex items-start gap-4 transition-shadow hover:shadow-md',
      alert ? 'border-orange-300 ring-1 ring-orange-200' : 'border-border'
    )}>
      <div className={cn('rounded-xl p-3 flex-shrink-0', bgClass)}>
        <span className={colorClass}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className={cn('text-2xl font-bold mt-0.5 leading-tight', alert ? 'text-orange-600' : 'text-foreground')}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {alert && (
        <span className="flex-shrink-0 mt-0.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
        </span>
      )}
    </div>
  )
}

export function KPICards({ prospectos, pagos, loading }: KPICardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-5 shadow-sm animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-7 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const totalProspectos = prospectos.length
  const ingresosTotales = pagos
    .filter((p) => p.estatus === 'Aprobado')
    .reduce((sum, p) => sum + (p.monto || 0), 0)
  const pagosPorValidar = pagos.filter((p) => p.estatus === 'Por Validar').length
  const clientesCerrados = prospectos.filter((p) => p.nivel_interes === 'Cliente_Cerrado').length
  const tasaConversion = totalProspectos > 0
    ? ((clientesCerrados / totalProspectos) * 100).toFixed(1)
    : '0.0'

  const cards: KPICardProps[] = [
    {
      title: 'Prospectos Activos',
      value: totalProspectos,
      subtitle: `${clientesCerrados} clientes cerrados`,
      icon: <Users size={22} />,
      colorClass: 'text-violet-600',
      bgClass: 'bg-violet-50',
    },
    {
      title: 'Ingresos Totales',
      value: formatCurrency(ingresosTotales),
      subtitle: 'Pagos aprobados',
      icon: <DollarSign size={22} />,
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50',
    },
    {
      title: 'Pagos por Validar',
      value: pagosPorValidar,
      subtitle: 'Requieren atención inmediata',
      icon: <AlertTriangle size={22} />,
      colorClass: 'text-orange-600',
      bgClass: 'bg-orange-50',
      alert: pagosPorValidar > 0,
    },
    {
      title: 'Tasa de Conversión',
      value: `${tasaConversion}%`,
      subtitle: `${clientesCerrados} / ${totalProspectos} prospectos`,
      icon: <TrendingUp size={22} />,
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <KPICard key={card.title} {...card} />
      ))}
    </div>
  )
}
