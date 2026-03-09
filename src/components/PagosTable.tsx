import { useState } from 'react'
import { ExternalLink, CheckCircle, XCircle, Eye, AlertCircle } from 'lucide-react'
import { formatMexDate, formatCurrency } from '../lib/utils'
import { EstatusBadge } from './ui/Badge'
import type { Pago, Prospecto } from '../types'

interface PagosTableProps {
  pagos: Pago[]
  prospectos: Prospecto[]
  loading: boolean
  onUpdateEstatus: (pagoId: string, estatus: Pago['estatus']) => Promise<void>
}

export function PagosTable({ pagos, prospectos, loading, onUpdateEstatus }: PagosTableProps) {
  const [updating, setUpdating] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    pagoId: string
    estatus: Pago['estatus']
    label: string
  } | null>(null)

  const getNombrePago = (pago: Pago) => {
    const p = prospectos.find((x) => x.id === pago.prospecto_id)
    return p?.nombre ?? 'Desconocido'
  }

  const handleAction = async (pagoId: string, estatus: Pago['estatus']) => {
    setUpdating(pagoId)
    await onUpdateEstatus(pagoId, estatus)
    setUpdating(null)
    setConfirmAction(null)
  }

  return (
    <div className="space-y-4">
      {/* Alerta si hay pagos por validar */}
      {pagos.filter((p) => p.estatus === 'Por Validar').length > 0 && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
          <AlertCircle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-800">
              {pagos.filter((p) => p.estatus === 'Por Validar').length} pago(s) esperando validación
            </p>
            <p className="text-xs text-orange-600 mt-0.5">
              Revisa los comprobantes y aprueba o rechaza los pagos pendientes.
            </p>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setConfirmAction(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4 ${
              confirmAction.estatus === 'Aprobado' ? 'bg-emerald-100' : 'bg-red-100'
            }`}>
              {confirmAction.estatus === 'Aprobado'
                ? <CheckCircle size={24} className="text-emerald-600" />
                : <XCircle size={24} className="text-red-600" />
              }
            </div>
            <h3 className="text-base font-semibold text-foreground text-center">
              ¿{confirmAction.label} este pago?
            </h3>
            <p className="text-sm text-muted-foreground text-center mt-1 mb-5">
              Esta acción actualizará el estatus en la base de datos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-2 text-sm border border-border rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAction(confirmAction.pagoId, confirmAction.estatus)}
                disabled={updating === confirmAction.pagoId}
                className={`flex-1 px-4 py-2 text-sm rounded-lg text-white font-medium transition-colors ${
                  confirmAction.estatus === 'Aprobado'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-60`}
              >
                {updating === confirmAction.pagoId ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-xl border border-border overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Prospecto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Experiencia</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Monto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Banco</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estatus</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pagos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    No hay pagos en el período seleccionado
                  </td>
                </tr>
              ) : (
                pagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold flex-shrink-0">
                          {getNombrePago(pago).charAt(0)}
                        </div>
                        <span className="font-medium text-sm">{getNombrePago(pago)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-[150px] truncate">
                      {pago.nombre_experiencia}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-foreground">{formatCurrency(pago.monto)}</p>
                        {pago.monto_detectado_ia > 0 && pago.monto_detectado_ia !== pago.monto && (
                          <p className="text-[10px] text-orange-600">
                            IA detectó: {formatCurrency(pago.monto_detectado_ia)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{pago.banco_origen || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {formatMexDate(pago.fecha_creacion)}
                    </td>
                    <td className="px-4 py-3">
                      <EstatusBadge label={pago.estatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Ver comprobante */}
                        {pago.foto_comprobante && (
                          <a
                            href={pago.foto_comprobante}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                          >
                            <Eye size={11} />
                            Ver
                          </a>
                        )}
                        {pago.link_stripe && (
                          <a
                            href={pago.link_stripe}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                          >
                            <ExternalLink size={11} />
                            Stripe
                          </a>
                        )}

                        {/* Botones Aprobar / Rechazar (solo si es "Por Validar") */}
                        {pago.estatus === 'Por Validar' && (
                          <>
                            <button
                              onClick={() => setConfirmAction({ pagoId: pago.id, estatus: 'Aprobado', label: 'Aprobar' })}
                              disabled={updating === pago.id}
                              className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-60"
                            >
                              <CheckCircle size={11} />
                              Aprobar
                            </button>
                            <button
                              onClick={() => setConfirmAction({ pagoId: pago.id, estatus: 'Rechazado', label: 'Rechazar' })}
                              disabled={updating === pago.id}
                              className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-60"
                            >
                              <XCircle size={11} />
                              Rechazar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && pagos.length > 0 && (
          <div className="border-t border-border px-4 py-2.5 bg-slate-50 flex items-center justify-between text-xs text-muted-foreground">
            <span>Total: {pagos.length} registro(s)</span>
            <span className="font-semibold text-emerald-700">
              Aprobados: {formatCurrency(pagos.filter(p => p.estatus === 'Aprobado').reduce((s, p) => s + p.monto, 0))}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
