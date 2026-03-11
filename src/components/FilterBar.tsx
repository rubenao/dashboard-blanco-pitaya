import { Calendar, Filter, ShoppingBag } from 'lucide-react'
import { format } from 'date-fns'
import type { Filtros, NivelInteres, ProductoInteres } from '../types'

const DATE_OPTIONS: { label: string; value: Filtros['dateRange'] }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Hoy', value: 'hoy' },
  { label: '7 días', value: '7dias' },
  { label: 'Este mes', value: 'mes' },
  { label: 'Personalizado', value: 'personalizado' },
]

const NIVEL_OPTIONS: { label: string; value: NivelInteres | 'Todos' }[] = [
  { label: 'Todos los niveles', value: 'Todos' },
  { label: 'Fantasma',         value: 'Fantasma' },
  { label: 'Curioso',          value: 'Curioso' },
  { label: 'Muy Interesado',   value: 'Muy_Interesado' },
  { label: 'Lead a Futuro',    value: 'Lead_a_Futuro' },
  { label: 'Listo para Pagar', value: 'Listo_para_Pagar' },
  { label: 'Cliente Cerrado',  value: 'Cliente_Cerrado' },
]

const PRODUCTO_OPTIONS: { label: string; value: ProductoInteres | 'Todos' }[] = [
  { label: 'Todos los productos', value: 'Todos' },
  { label: 'Campamento',          value: 'Campamento' },
  { label: 'Taller',              value: 'Taller' },
]

const TODAY = format(new Date(), 'yyyy-MM-dd')

interface FilterBarProps {
  filtros: Filtros
  onChange: (filtros: Filtros) => void
}

export function FilterBar({ filtros, onChange }: FilterBarProps) {
  const isPersonalizado = filtros.dateRange === 'personalizado'

  function handleDateRangeClick(value: Filtros['dateRange']) {
    if (value === 'personalizado') {
      onChange({
        ...filtros,
        dateRange: 'personalizado',
        fechaInicio: filtros.fechaInicio ?? TODAY,
        fechaFin: filtros.fechaFin ?? TODAY,
      })
    } else {
      onChange({ ...filtros, dateRange: value, fechaInicio: undefined, fechaFin: undefined })
    }
  }

  return (
    <div className="bg-white rounded-xl border border-border px-5 py-4 flex flex-wrap items-center gap-4 shadow-sm">
      {/* Rango de fechas */}
      <div className="flex items-center gap-2 flex-wrap">
        <Calendar size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Período:</span>
        <div className="flex rounded-lg border border-border overflow-hidden">
          {DATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleDateRangeClick(opt.value)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                filtros.dateRange === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white text-foreground hover:bg-muted'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Inputs de fecha personalizada */}
        {isPersonalizado && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filtros.fechaInicio ?? TODAY}
              max={filtros.fechaFin ?? TODAY}
              onChange={(e) => onChange({ ...filtros, fechaInicio: e.target.value })}
              className="text-sm border border-border rounded-lg px-2 py-1.5 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            />
            <span className="text-sm text-muted-foreground">–</span>
            <input
              type="date"
              value={filtros.fechaFin ?? TODAY}
              min={filtros.fechaInicio ?? undefined}
              max={TODAY}
              onChange={(e) => onChange({ ...filtros, fechaFin: e.target.value })}
              className="text-sm border border-border rounded-lg px-2 py-1.5 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Separador */}
      <div className="h-6 w-px bg-border hidden sm:block" />

      {/* Nivel de interés */}
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Interés:</span>
        <select
          value={filtros.nivelInteres}
          onChange={(e) =>
            onChange({ ...filtros, nivelInteres: e.target.value as NivelInteres | 'Todos' })
          }
          className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          {NIVEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Separador */}
      <div className="h-6 w-px bg-border hidden sm:block" />

      {/* Producto de interés */}
      <div className="flex items-center gap-2">
        <ShoppingBag size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Producto:</span>
        <select
          value={filtros.productoInteres}
          onChange={(e) =>
            onChange({ ...filtros, productoInteres: e.target.value as ProductoInteres | 'Todos' })
          }
          className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          {PRODUCTO_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Indicador de modo */}
      <div className="ml-auto flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Datos de demostración
        </span>
      </div>
    </div>
  )
}
