import { useEffect, useState, useRef } from 'react'
import { X, MessageCircle, Bot, User } from 'lucide-react'
import { formatMexDate } from '../lib/utils'
import { parseMessage } from '../lib/utils'
import type { Prospecto, Conversacion } from '../types'
import { NivelBadge } from './ui/Badge'

interface ChatModalProps {
  prospecto: Prospecto | null
  onClose: () => void
  getConversaciones: (telefono: string) => Promise<Conversacion[]>
}

export function ChatModal({ prospecto, onClose, getConversaciones }: ChatModalProps) {
  const [mensajes, setMensajes] = useState<Conversacion[]>([])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!prospecto) return
    setLoading(true)
    getConversaciones(prospecto.telefono).then((data) => {
      setMensajes(data)
      setLoading(false)
    })
  }, [prospecto, getConversaciones])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  if (!prospecto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-4 text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <MessageCircle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base leading-tight">{prospecto.nombre}</p>
            <p className="text-violet-200 text-xs mt-0.5">{prospecto.telefono}</p>
          </div>
          <div className="flex items-center gap-3">
            <NivelBadge label={prospecto.nivel_interes} className="bg-white/20 text-white border-white/30" />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Info rápida */}
        <div className="border-b border-border px-5 py-2 flex gap-4 text-xs text-muted-foreground bg-slate-50">
          <span>Origen: <strong>{prospecto.origen}</strong></span>
          <span>Última interacción: <strong>{formatMexDate(prospecto.ultima_interaccion)}</strong></span>
          <span>{mensajes.length} mensajes</span>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-slate-50">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {!loading && mensajes.length === 0 && (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              Sin conversaciones registradas
            </div>
          )}

          {!loading && mensajes.map((conv) => {
            const msg = parseMessage(conv.message)
            if (!msg) return null
            const isHuman = msg.type === 'human'

            return (
              <div
                key={conv.id}
                className={`flex gap-2 ${isHuman ? 'flex-row' : 'flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isHuman ? 'bg-slate-300' : 'bg-violet-100'
                }`}>
                  {isHuman
                    ? <User size={14} className="text-slate-600" />
                    : <Bot size={14} className="text-violet-600" />
                  }
                </div>

                {/* Burbuja */}
                <div className={`max-w-[75%] ${isHuman ? '' : ''}`}>
                  <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    isHuman
                      ? 'bg-white text-foreground rounded-tl-sm border border-border'
                      : 'bg-violet-600 text-white rounded-tr-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <p className={`text-[10px] text-muted-foreground mt-1 ${isHuman ? 'text-left' : 'text-right'}`}>
                    {formatMexDate(conv.created_at, 'dd/MM HH:mm')}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  )
}
