import { useState } from 'react'
import { LayoutDashboard, Users, CreditCard, RefreshCw, Zap } from 'lucide-react'
import { FilterBar } from './components/FilterBar'
import { KPICards } from './components/KPICards'
import { ProspectosPorDiaChart, FunnelVentasChart } from './components/Charts'
import { ProspectosTable } from './components/ProspectosTable'
import { PagosTable } from './components/PagosTable'
import { ChatModal } from './components/ChatModal'
import { useData } from './hooks/useData'
import { isSupabaseConfigured } from './lib/supabase'
import type { Filtros, Prospecto } from './types'

const TABS = [
  { id: 'prospectos', label: 'Directorio de Prospectos', icon: Users },
  { id: 'pagos', label: 'Validación de Pagos', icon: CreditCard },
]

export default function App() {
  const [filtros, setFiltros] = useState<Filtros>({
    dateRange: 'mes',
    nivelInteres: 'Todos',
    productoInteres: 'Todos',
  })
  const [activeTab, setActiveTab] = useState<'prospectos' | 'pagos'>('prospectos')
  const [selectedProspecto, setSelectedProspecto] = useState<Prospecto | null>(null)

  const { prospectos, pagos, loading, updatePagoEstatus, getConversacionesByTelefono, refetch } =
    useData(filtros)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Navbar ────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center shadow-sm">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-tight">CRM WhatsApp</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Panel Administrativo</p>
            </div>
          </div>

          <div className="flex-1" />

          {/* Conexión Supabase */}
          <div className={`hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${
            isSupabaseConfigured
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
            {isSupabaseConfigured ? 'Conectado a Supabase' : 'Modo demostración'}
          </div>

          {/* Botón refrescar */}
          <button
            onClick={refetch}
            disabled={loading}
            className="w-8 h-8 rounded-lg border border-border bg-white hover:bg-slate-50 flex items-center justify-center transition-colors disabled:opacity-50"
            title="Actualizar datos"
          >
            <RefreshCw size={14} className={`text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* ── Contenido principal ───────────────────────────────────────── */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Título de sección */}
        <div className="flex items-center gap-2">
          <LayoutDashboard size={20} className="text-violet-600" />
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">Dashboard de Ventas</h1>
            <p className="text-xs text-muted-foreground">Métricas en tiempo real de tu embudo WhatsApp</p>
          </div>
        </div>

        {/* Filtros globales */}
        <FilterBar filtros={filtros} onChange={setFiltros} />

        {/* KPI Cards */}
        <KPICards prospectos={prospectos} pagos={pagos} loading={loading} />

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProspectosPorDiaChart prospectos={prospectos} loading={loading} />
          <FunnelVentasChart prospectos={prospectos} loading={loading} />
        </div>

        {/* Pestañas */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          {/* Tab headers */}
          <div className="border-b border-border px-4 flex gap-0">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const badge =
                tab.id === 'pagos'
                  ? pagos.filter((p) => p.estatus === 'Por Validar').length
                  : 0
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-violet-600 text-violet-700'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                  {badge > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-orange-500 text-white">
                      {badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          <div className="p-4 sm:p-5">
            {activeTab === 'prospectos' && (
              <ProspectosTable
                prospectos={prospectos}
                loading={loading}
                onSelectProspecto={setSelectedProspecto}
              />
            )}
            {activeTab === 'pagos' && (
              <PagosTable
                pagos={pagos}
                prospectos={prospectos}
                loading={loading}
                onUpdateEstatus={updatePagoEstatus}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-4">
        <p className="text-center text-xs text-muted-foreground">
          CRM WhatsApp Dashboard · Zona horaria: America/Mexico_City
        </p>
      </footer>

      {/* Modal de chat */}
      <ChatModal
        prospecto={selectedProspecto}
        onClose={() => setSelectedProspecto(null)}
        getConversaciones={getConversacionesByTelefono}
      />
    </div>
  )
}
