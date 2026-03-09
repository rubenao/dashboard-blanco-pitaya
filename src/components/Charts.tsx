import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { toMexDateKey, formatMexDate } from '../lib/utils'
import type { Prospecto, NivelInteres } from '../types'
import { NIVEL_LABELS } from '../types'

// ── Gráfica de Barras: Prospectos por Día ────────────────────────────────────

interface ProspectosChartProps {
  prospectos: Prospecto[]
  loading: boolean
}

export function ProspectosPorDiaChart({ prospectos, loading }: ProspectosChartProps) {
  const dataByDay = prospectos.reduce<Record<string, number>>((acc, p) => {
    const key = toMexDateKey(p.fecha_creacion)
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(dataByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      fecha: formatMexDate(date + 'T12:00:00', 'dd MMM'),
      prospectos: count,
    }))

  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-1">Nuevos Prospectos por Día</h3>
      <p className="text-xs text-muted-foreground mb-4">Total de leads creados por día (zona horaria México)</p>
      {loading ? (
        <div className="h-56 animate-pulse bg-slate-50 rounded-lg" />
      ) : chartData.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
          Sin datos en el período seleccionado
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              formatter={(value: number | undefined) => [value ?? 0, 'Prospectos']}
            />
            <Bar dataKey="prospectos" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ── Gráfica de Embudo: Distribución de Prospectos ────────────────────────────

const FUNNEL_ORDER: NivelInteres[] = ['Fantasma', 'Curioso', 'Muy_Interesado', 'Lead_a_Futuro', 'Listo_para_Pagar', 'Cliente_Cerrado']
const FUNNEL_COLORS = ['#cbd5e1', '#0ea5e9', '#3b82f6', '#7c3aed', '#f59e0b', '#10b981']

interface FunnelChartProps {
  prospectos: Prospecto[]
  loading: boolean
}

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {value}
    </text>
  )
}

export function FunnelVentasChart({ prospectos, loading }: FunnelChartProps) {
  const counts = FUNNEL_ORDER.map((nivel) => ({
    name: NIVEL_LABELS[nivel],
    value: prospectos.filter((p) => p.nivel_interes === nivel).length,
  })).filter((d) => d.value > 0)

  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-1">Embudo de Ventas</h3>
      <p className="text-xs text-muted-foreground mb-4">Distribución de prospectos por etapa</p>
      {loading ? (
        <div className="h-56 animate-pulse bg-slate-50 rounded-lg" />
      ) : counts.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
          Sin datos en el período seleccionado
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={counts}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
              label={CustomLabel}
            >
              {counts.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={FUNNEL_COLORS[FUNNEL_ORDER.indexOf(entry.name as NivelInteres)]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              formatter={(value: number | undefined, name: string | undefined) => [value ?? 0, name ?? '']}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span style={{ fontSize: 11, color: '#64748b' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
      {/* Tabla de resumen embudo */}
      {!loading && counts.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {FUNNEL_ORDER.map((nivel, i) => {
            const count = prospectos.filter((p) => p.nivel_interes === nivel).length
            const total = prospectos.length
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <div key={nivel} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: FUNNEL_COLORS[i] }}
                />
                <span className="flex-1 text-muted-foreground">{NIVEL_LABELS[nivel]}</span>
                <span className="font-semibold text-foreground">{count}</span>
                <span className="text-muted-foreground w-8 text-right">{pct}%</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
