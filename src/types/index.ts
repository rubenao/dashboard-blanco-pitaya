export type NivelInteres =
  | 'Fantasma'
  | 'Curioso'
  | 'Muy_Interesado'
  | 'Lead_a_Futuro'
  | 'Listo_para_Pagar'
  | 'Cliente_Cerrado'

export const NIVEL_LABELS: Record<NivelInteres, string> = {
  'Fantasma':        'Fantasma',
  'Curioso':         'Curioso',
  'Muy_Interesado':  'Muy Interesado',
  'Lead_a_Futuro':   'Lead a Futuro',
  'Listo_para_Pagar':'Listo para Pagar',
  'Cliente_Cerrado': 'Cliente Cerrado',
}

export type ProductoInteres = 'Campamento' | 'Taller'

export type EstatusPago = 'Pendiente' | 'Por Validar' | 'Aprobado' | 'Rechazado'

export interface Prospecto {
  id: string
  telefono: string
  nombre: string
  correo: string
  nivel_interes: NivelInteres
  productos_interes: ProductoInteres[]
  origen: string
  ultima_interaccion: string
  fecha_creacion: string
}

export interface Conversacion {
  id: number
  created_at: string
  session_id: string
  message: {
    type: 'human' | 'ai'
    content: string
  }
}

export interface Pago {
  id: string
  prospecto_id: string
  nombre_experiencia: string
  monto: number
  foto_comprobante: string
  link_stripe: string
  estatus: EstatusPago
  monto_detectado_ia: number
  banco_origen: string
  fecha_creacion: string
}

export type DateRange = 'hoy' | '7dias' | 'mes'

export interface Filtros {
  dateRange: DateRange
  nivelInteres: NivelInteres | 'Todos'
  productoInteres: ProductoInteres | 'Todos'
}
