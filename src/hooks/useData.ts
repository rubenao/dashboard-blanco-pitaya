import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { mockProspectos, mockConversaciones, mockPagos } from '../data/mockData'
import type { Prospecto, Conversacion, Pago, Filtros } from '../types'
import { startOfDay, subDays, startOfMonth, endOfDay, parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const TZ = 'America/Mexico_City'

function getDateRange(filtros: Filtros): { start: Date | null; end: Date } {
  const nowMex = toZonedTime(new Date(), TZ)

  if (filtros.dateRange === 'todos') {
    return { start: null, end: endOfDay(nowMex) }
  }
  if (filtros.dateRange === 'personalizado' && filtros.fechaInicio && filtros.fechaFin) {
    return {
      start: startOfDay(parseISO(filtros.fechaInicio)),
      end: endOfDay(parseISO(filtros.fechaFin)),
    }
  }
  if (filtros.dateRange === 'hoy') {
    return { start: startOfDay(nowMex), end: endOfDay(nowMex) }
  }
  if (filtros.dateRange === '7dias') {
    return { start: startOfDay(subDays(nowMex, 6)), end: endOfDay(nowMex) }
  }
  // mes
  return { start: startOfMonth(nowMex), end: endOfDay(nowMex) }
}

/** Obtiene TODOS los registros de una tabla usando paginación de 1000 en 1000 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAllRows<T extends { id: string | number }>(buildQuery: () => any): Promise<T[]> {
  const PAGE_SIZE = 1000
  let allRows: T[] = []
  let from = 0

  while (true) {
    const { data, error } = await buildQuery().range(from, from + PAGE_SIZE - 1)
    if (error) throw error
    if (!data || data.length === 0) break
    allRows = allRows.concat(data as T[])
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  // Deduplicar por id para evitar duplicados por paginación no determinística
  const seen = new Set<string | number>()
  return allRows.filter((row) => {
    if (seen.has(row.id)) return false
    seen.add(row.id)
    return true
  })
}

export function useData(filtros: Filtros) {
  const [prospectos, setProspectos] = useState<Prospecto[]>([])
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([])
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      if (isSupabaseConfigured) {
        // ── SUPABASE REAL ──────────────────────────────────────
        const { start, end } = getDateRange(filtros)
        const rangeStart = start ? start.toISOString() : null
        const rangeEnd = end.toISOString()

        const sinFiltroFecha = filtros.dateRange === 'todos'

        // Prospectos — paginación completa
        const pData = await fetchAllRows<Prospecto>(() => {
          let q = supabase
            .from('prospectos')
            .select('*')
            .order('ultima_interaccion', { ascending: false })
            .order('id', { ascending: true })

          if (!sinFiltroFecha) {
            if (rangeStart) q = q.gte('ultima_interaccion', rangeStart)
            q = q.lte('ultima_interaccion', rangeEnd)
          }

          if (filtros.nivelInteres !== 'Todos') {
            q = q.eq('nivel_interes', filtros.nivelInteres)
          }
          return q
        })

        // Conversaciones y pagos — paginación completa
        const [cData, pgData] = await Promise.all([
          fetchAllRows<Conversacion>(() => {
            let q = supabase
              .from('conversaciones')
              .select('*')
              .order('created_at', { ascending: true })
              .order('id', { ascending: true })
            if (!sinFiltroFecha) {
              if (rangeStart) q = q.gte('created_at', rangeStart)
              q = q.lte('created_at', rangeEnd)
            }
            return q
          }),
          fetchAllRows<Pago>(() => {
            let q = supabase.from('pagos').select('*')
            if (!sinFiltroFecha) {
              if (rangeStart) q = q.gte('fecha_creacion', rangeStart)
              q = q.lte('fecha_creacion', rangeEnd)
            }
            return q
          }),
        ])

        let prospectosFiltrados = pData
        if (filtros.nivelInteres !== 'Todos') {
          prospectosFiltrados = prospectosFiltrados.filter(
            (p) => p.nivel_interes === filtros.nivelInteres
          )
        }
        if (filtros.productoInteres !== 'Todos') {
          prospectosFiltrados = prospectosFiltrados.filter(
            (p) =>
              Array.isArray(p.productos_interes) &&
              p.productos_interes.includes(filtros.productoInteres as 'Campamento' | 'Taller')
          )
        }

        setProspectos(prospectosFiltrados)
        setConversaciones(cData)
        setPagos(pgData)
      } else {
        // ── DATOS MOCKEADOS ────────────────────────────────────
        const { start } = getDateRange(filtros)

        let filteredProspectos = start
          ? mockProspectos.filter((p) => new Date(p.ultima_interaccion) >= start)
          : [...mockProspectos]
        if (filtros.nivelInteres !== 'Todos') {
          filteredProspectos = filteredProspectos.filter(
            (p) => p.nivel_interes === filtros.nivelInteres
          )
        }
        if (filtros.productoInteres !== 'Todos') {
          filteredProspectos = filteredProspectos.filter(
            (p) => p.productos_interes?.includes(filtros.productoInteres as 'Campamento' | 'Taller')
          )
        }

        const filteredConversaciones = start
          ? mockConversaciones.filter((c) => new Date(c.created_at) >= start)
          : [...mockConversaciones]
        const filteredPagos = start
          ? mockPagos.filter((p) => new Date(p.fecha_creacion) >= start)
          : [...mockPagos]

        setProspectos(filteredProspectos)
        setConversaciones(filteredConversaciones)
        setPagos(filteredPagos)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setProspectos(mockProspectos)
      setConversaciones(mockConversaciones)
      setPagos(mockPagos)
    } finally {
      setLoading(false)
    }
  }, [filtros])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updatePagoEstatus = async (pagoId: string, nuevoEstatus: Pago['estatus']) => {
    if (isSupabaseConfigured) {
      await supabase.from('pagos').update({ estatus: nuevoEstatus }).eq('id', pagoId)
    }
    setPagos((prev) =>
      prev.map((p) => (p.id === pagoId ? { ...p, estatus: nuevoEstatus } : p))
    )
  }

  const getConversacionesByTelefono = useCallback(
    async (telefono: string): Promise<Conversacion[]> => {
      if (isSupabaseConfigured) {
        const { data } = await supabase
          .from('conversaciones')
          .select('*')
          .eq('session_id', telefono)
          .order('created_at', { ascending: true })
        return data || []
      }
      return mockConversaciones
        .filter((c) => c.session_id === telefono)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    },
    []
  )

  return {
    prospectos,
    conversaciones,
    pagos,
    loading,
    updatePagoEstatus,
    getConversacionesByTelefono,
    refetch: fetchData,
  }
}
