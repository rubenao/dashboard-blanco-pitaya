import { useState } from 'react'
import { Search, ChevronUp, ChevronDown, MessageSquare, ArrowUpDown } from 'lucide-react'
import { formatMexDateOnly } from '../lib/utils'
import { NivelBadge } from './ui/Badge'
import type { Prospecto } from '../types'

interface ProspectosTableProps {
  prospectos: Prospecto[]
  loading: boolean
  onSelectProspecto: (p: Prospecto) => void
}

type SortKey = 'nombre' | 'nivel_interes' | 'ultima_interaccion' | 'origen'

export function ProspectosTable({ prospectos, loading, onSelectProspecto }: ProspectosTableProps) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('ultima_interaccion')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = prospectos
    .filter(
      (p) =>
        p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        p.telefono?.includes(search) ||
        p.correo?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let va = a[sortKey] ?? ''
      let vb = b[sortKey] ?? ''
      if (sortKey === 'ultima_interaccion') {
        va = new Date(va).getTime().toString()
        vb = new Date(vb).getTime().toString()
      }
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va))
    })

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={12} className="text-muted-foreground/50" />
    return sortDir === 'asc'
      ? <ChevronUp size={13} className="text-primary" />
      : <ChevronDown size={13} className="text-primary" />
  }

  const th = (label: string, col: SortKey) => (
    <th
      className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none"
      onClick={() => handleSort(col)}
    >
      <span className="flex items-center gap-1">
        {label} <SortIcon col={col} />
      </span>
    </th>
  )

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar prospecto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
        />
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-border overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                {th('Nombre', 'nombre')}
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Teléfono
                </th>
                {th('Interés', 'nivel_interes')}
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Productos
                </th>
                {th('Origen', 'origen')}
                {th('Última Interacción', 'ultima_interaccion')}
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Chat
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    No se encontraron prospectos
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => onSelectProspecto(p)}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold flex-shrink-0">
                          {p.nombre?.charAt(0) ?? '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-sm leading-tight">{p.nombre}</p>
                          <p className="text-xs text-muted-foreground">{p.correo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {p.telefono}
                    </td>
                    <td className="px-4 py-3">
                      <NivelBadge label={p.nivel_interes} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.productos_interes?.map((prod) => (
                          <span
                            key={prod}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              prod === 'Campamento'
                                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {prod}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{p.origen}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {formatMexDateOnly(p.ultima_interaccion)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectProspecto(p) }}
                        className="inline-flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                      >
                        <MessageSquare size={12} />
                        Ver chat
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="border-t border-border px-4 py-2.5 bg-slate-50 text-xs text-muted-foreground">
            Mostrando {filtered.length} de {prospectos.length} prospectos
          </div>
        )}
      </div>
    </div>
  )
}
