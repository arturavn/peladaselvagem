import { useState, useEffect, useRef } from 'react'
import Portal from './Portal'

const TIMEOUT_SEC = 5

export default function ConfirmActionModal({ message, onConfirm, onCancel }) {
  const [remaining, setRemaining] = useState(TIMEOUT_SEC)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const tick = () => {
      const elapsed = (Date.now() - startRef.current) / 1000
      const left = Math.max(0, TIMEOUT_SEC - elapsed)
      setRemaining(left)
      if (left === 0) onCancel()
    }
    const id = setInterval(tick, 100)
    return () => clearInterval(id)
  }, [onCancel])

  const progress = remaining / TIMEOUT_SEC // 1 → 0

  return (
    <Portal>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.72)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '0 0 calc(80px + var(--safe-bottom, 0px))',
        }}
        onClick={onCancel}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 390,
            background: 'var(--surface)',
            borderRadius: '20px 20px 0 0',
            padding: '24px 20px 20px',
            border: '1px solid rgba(255,255,255,0.08)',
            borderBottom: 'none',
          }}
        >
          {/* Countdown bar */}
          <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progress * 100}%`,
                background: progress > 0.4 ? 'var(--accent)' : 'var(--danger)',
                borderRadius: 2,
                transition: 'width 0.1s linear, background 0.3s ease',
              }}
            />
          </div>

          {/* Message */}
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            letterSpacing: '0.05em',
            color: 'var(--text-1)',
            textAlign: 'center',
            margin: '0 0 8px',
          }}>
            {message}
          </p>

          {/* Countdown seconds */}
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 13,
            color: 'var(--text-3)',
            textAlign: 'center',
            margin: '0 0 24px',
            letterSpacing: '0.05em',
          }}>
            Cancela em {Math.ceil(remaining)}s
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                height: 48,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-display)',
                fontSize: 15,
                letterSpacing: '0.08em',
                color: 'var(--text-2)',
                cursor: 'pointer',
              }}
            >
              CANCELAR
            </button>
            <button
              onClick={onConfirm}
              style={{
                flex: 1,
                height: 48,
                background: 'var(--accent)',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-display)',
                fontSize: 15,
                letterSpacing: '0.08em',
                color: '#080808',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              CONFIRMAR
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}
