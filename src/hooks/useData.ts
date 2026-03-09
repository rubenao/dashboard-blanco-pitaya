import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { mockProspectos, mockConversaciones, mockPagos } from '../data/mockData'
import type { Prospecto, Conversacion, Pago, Filtros } from '../types'
import { startOfDay, subDays, startOfMonth } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const TZ = 'America/Mexico_City'

function getDateRangeStart(range: Filtros['dateRange']): Date {
  const nowMex = toZonedTime(new Date(), TZ)
  if (range === 'hoy') return startOfDay(nowMex)
  if (range === '7dias') return startOfDay(subDays(nowMex, 6))
  if (range === 'mes') return startOfMonth(nowMex)
  return startOfDay(nowMex)
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
        const rangeStart = getDateRangeStart(filtros.dateRange).toISOString()

        let qProspectos = supabase
          .from('prospectos')
          .select('*')
          .gte('ultima_interaccion', rangeStart)

        if (filtros.nivelInteres !== 'Todos') {
          qProspectos = qProspectos.eq('nivel_interes', filtros.nivelInteres)
        }

        const [{ data: pData }, { data: cData }, { data: pgData }] = await Promise.all([
          qProspectos,
          supabase
            .from('conversaciones')
            .select('*')
            .gte('created_at', rangeStart)
            .order('created_at', { ascending: true }),
          supabase.from('pagos').select('*').gte('fecha_creacion', rangeStart),
        ])

        let prospectosFiltrados = pData || []
        if (filtros.productoInteres !== 'Todos') {
          prospectosFiltrados = prospectosFiltrados.filter((p: Prospecto) =>
            Array.isArray(p.productos_interes) &&
            p.productos_interes.includes(filtros.productoInteres as 'Campamento' | 'Taller')
          )
        }

        setProspectos(prospectosFiltrados)
        setConversaciones(cData || [])
        setPagos(pgData || [])
      } else {
        // ── DATOS MOCKEADOS ────────────────────────────────────
        const rangeStart = getDateRangeStart(filtros.dateRange)

        let filteredProspectos = mockProspectos.filter(
          (p) => new Date(p.ultima_interaccion) >= rangeStart
        )
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

        const filteredConversaciones = mockConversaciones.filter(
          (c) => new Date(c.created_at) >= rangeStart
        )
        const filteredPagos = mockPagos.filter(
          (p) => new Date(p.fecha_creacion) >= rangeStart
        )

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
