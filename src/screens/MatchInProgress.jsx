import { useState, useEffect } from 'react'
import { TEAM_ROLE, getInitials } from '../components/BottomNav'

/* ── Timer hook ─────────────────────────────────────────── */

function useTimer(endTime) {
  const [remaining, setRemaining] = useState(() =>
    endTime ? Math.max(0, endTime - Date.now()) : 0
  )

  useEffect(() => {
    if (!endTime) return  // paused or no endTime — freeze display
    const tick = () => setRemaining(Math.max(0, endTime - Date.now()))
    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [endTime])

  return remaining
}

function formatTime(ms) {
  const totalSecs = Math.ceil(ms / 1000)
  const m = Math.floor(totalSecs / 60)
  const s = totalSecs % 60
  return { min: String(m).padStart(2, '0'), sec: String(s).padStart(2, '0') }
}

/* ── Icons ─────────────────────────────────────────────── */

function IconStop() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="3" width="10" height="10" rx="1.5" fill="currentColor"/>
    </svg>
  )
}

function IconPause() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="4" y="3" width="3" height="10" rx="1" fill="currentColor"/>
      <rect x="9" y="3" width="3" height="10" rx="1" fill="currentColor"/>
    </svg>
  )
}

function IconPlay() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 2.5l10 5.5-10 5.5V2.5z" fill="currentColor"/>
    </svg>
  )
}

/* ── Team box ───────────────────────────────────────────── */

function TeamBox({ team, role }) {
  const r = TEAM_ROLE[role]
  const initials = team ? getInitials(team.captain ?? team.players?.[0] ?? '') : '??'
  const captainName = team?.captain ?? team?.players?.[0] ?? '—'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    }}>
      <div style={{
        width: 64,
        height: 64,
        background: r.shieldBg,
        border: `2px solid ${r.shieldBorder}`,
        borderRadius: 'var(--radius)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: role === 'amarelo' ? '0 0 20px rgba(245,196,0,0.15)' : '0 0 12px rgba(255,255,255,0.05)',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          color: r.shieldText,
          letterSpacing: '0.04em',
          lineHeight: 1,
        }}>
          {initials}
        </span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: r.accent,
          marginBottom: 2,
        }}>
          {r.label}
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 14,
          letterSpacing: '0.04em',
          color: '#F0F0F0',
          lineHeight: 1.1,
        }}>
          {captainName.toUpperCase()}
        </div>
      </div>
    </div>
  )
}

/* ── Substitution Modal ─────────────────────────────────── */

function SubModal({ teamA, teamB, onClose, onRemove }) {
  const [confirm, setConfirm] = useState(null)

  const overlay = {
    position: 'fixed', inset: 0, zIndex: 100,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  }
  const sheet = {
    width: '100%', maxWidth: 390,
    background: 'var(--surface)',
    borderRadius: '20px 20px 0 0',
    padding: '24px 20px',
    paddingBottom: 'calc(24px + var(--safe-bottom))',
    maxHeight: '80dvh',
    overflowY: 'auto',
  }

  if (confirm) {
    return (
      <div style={overlay}>
        <div style={sheet}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.06em', color: 'var(--text)', marginBottom: 8 }}>
            REMOVER {confirm.toUpperCase()}?
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-3)', marginBottom: 24 }}>
            Ele sai da partida mas permanece na lista de exportação. O sistema chama o próximo da fila para substituir.
          </p>
          <button
            onClick={() => { onRemove(confirm); setConfirm(null); onClose() }}
            style={{
              width: '100%', height: 52, marginBottom: 10,
              background: 'var(--danger)', border: 'none',
              borderRadius: 'var(--radius)', fontFamily: 'var(--font-display)',
              fontSize: 18, letterSpacing: '0.1em', color: '#fff', cursor: 'pointer',
            }}
          >
            SIM, REMOVER
          </button>
          <button
            onClick={() => setConfirm(null)}
            style={{
              width: '100%', height: 48,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius)', fontFamily: 'var(--font-display)',
              fontSize: 16, letterSpacing: '0.1em', color: 'var(--text-2)', cursor: 'pointer',
            }}
          >
            CANCELAR
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={overlay}>
      <div style={sheet}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.08em', color: 'var(--text)' }}>
            SUBSTITUIÇÃO
          </span>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)', border: 'none',
              color: 'var(--text-2)', fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        {[teamA, teamB].filter(Boolean).map((team, ti) => (
          <div key={team.id} style={{ marginBottom: ti === 0 ? 20 : 0 }}>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.14em', color: ti === 0 ? '#888' : '#c8a400',
              marginBottom: 8, textTransform: 'uppercase',
            }}>
              {ti === 0 ? '⚫ PRETO' : '🟡 AMARELO'}
            </div>
            {(team.players ?? []).map((player) => (
              <div
                key={player}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', marginBottom: 6,
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text)' }}>
                  {player}
                  {player === team.captain && (
                    <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.1em' }}>CAP</span>
                  )}
                </span>
                <button
                  onClick={() => setConfirm(player)}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'rgba(255,59,59,0.15)',
                    border: '1px solid rgba(255,59,59,0.3)',
                    color: 'var(--danger)', fontSize: 14, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >✕</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────── */

export default function MatchInProgress({
  endTime,
  duration,
  teamA,
  teamB,
  onEnd,
  isPaused,
  pausedRemaining,
  onPause,
  onResume,
  onRemoveMatchPlayer,
}) {
  // activeEndTime: null when paused (freezes useTimer)
  const activeEndTime = isPaused ? null : endTime
  const remaining = useTimer(activeEndTime)

  // Display time: if paused use pausedRemaining prop
  const displayMs = isPaused ? (pausedRemaining ?? 0) : remaining

  const totalMs    = duration * 60 * 1000
  const isFinished = !isPaused && remaining <= 0
  const isDanger   = displayMs <= 30_000 && displayMs > 0 && !isPaused
  const progress   = totalMs > 0 ? Math.max(0, displayMs / totalMs) : 0

  const [showSubModal, setShowSubModal] = useState(false)

  const handlePause  = () => onPause(remaining)
  const handleResume = () => onResume()

  const handleOpenSub = () => {
    if (!isPaused) onPause(remaining)
    setShowSubModal(true)
  }

  // Auto-end when time runs out (only when not paused)
  const [autoEnded, setAutoEnded] = useState(false)
  useEffect(() => {
    if (isFinished && !autoEnded) {
      setAutoEnded(true)
      onEnd()
    }
  }, [isFinished, autoEnded, onEnd])

  // Reset autoEnded when a new match starts (endTime changes to non-zero future)
  useEffect(() => {
    if (endTime && endTime > Date.now()) {
      setAutoEnded(false)
    }
  }, [endTime])

  const { min, sec } = (isFinished || (isPaused && (pausedRemaining ?? 0) === 0))
    ? { min: '00', sec: '00' }
    : formatTime(displayMs)

  const durationLabel = duration < 1
    ? `${Math.round(duration * 60)} SEG`
    : `${duration} MIN`

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top accent bar */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 2,
        background: isPaused
          ? 'rgba(255,149,0,0.6)'
          : isDanger
            ? 'var(--danger)'
            : 'linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)',
        zIndex: 2,
        transition: 'background 0.5s ease',
      }} />

      {/* Status chip */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 'calc(var(--safe-top) + 20px)',
        paddingBottom: 4,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 14px',
          background: isPaused
            ? 'rgba(255,149,0,0.1)'
            : isDanger ? 'rgba(255,59,59,0.12)' : 'rgba(255,85,0,0.08)',
          border: `1px solid ${isPaused
            ? 'rgba(255,149,0,0.3)'
            : isDanger ? 'rgba(255,59,59,0.3)' : 'rgba(255,85,0,0.25)'}`,
          borderRadius: 20,
          transition: 'all 0.4s ease',
        }}>
          <div style={{
            width: 6, height: 6,
            borderRadius: '50%',
            background: isPaused ? 'var(--warning)' : isDanger ? 'var(--danger)' : 'var(--accent)',
            boxShadow: isPaused ? '0 0 6px var(--warning)' : isDanger ? '0 0 6px var(--danger)' : '0 0 6px var(--accent)',
            animation: isPaused ? 'none' : 'timerPulse 1s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: isPaused ? 'var(--warning)' : isDanger ? 'var(--danger)' : 'var(--accent)',
            textTransform: 'uppercase',
          }}>
            {isPaused ? 'PAUSADO' : isDanger ? 'APITO FINAL' : 'AO VIVO'}
          </span>
        </div>
      </div>

      {/* Center — teams + timer */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        gap: 20,
      }}>
        {/* Team boxes */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          gap: 10,
        }}>
          <TeamBox team={teamA} role="preto" />
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 13,
            color: 'var(--text-3)',
            letterSpacing: '0.12em',
            flexShrink: 0,
          }}>
            VS
          </div>
          <TeamBox team={teamB} role="amarelo" />
        </div>

        {/* Timer */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          width: '100%',
        }}>
          {/* Big timer */}
          <span
            className={isDanger && !isPaused ? 'timer-danger' : ''}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 96,
              letterSpacing: '0.02em',
              lineHeight: 1,
              color: isPaused
                ? 'var(--warning)'
                : isDanger ? 'var(--danger)' : 'var(--text)',
              textShadow: isPaused
                ? '0 0 40px rgba(255,149,0,0.25)'
                : isDanger
                  ? '0 0 48px rgba(255,59,59,0.5)'
                  : '0 0 40px rgba(255,85,0,0.12)',
              transition: 'color 0.4s ease, text-shadow 0.4s ease',
              userSelect: 'none',
              opacity: isPaused ? 0.75 : 1,
            }}
          >
            {min}:{sec}
          </span>

          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: isPaused ? 'var(--warning)' : isDanger ? 'var(--danger)' : 'var(--text-3)',
            transition: 'color 0.4s ease',
          }}>
            {isPaused ? 'EM PAUSA' : 'MINUTOS RESTANTES'}
          </span>

          {/* Progress bar */}
          <div style={{
            width: '100%',
            height: 3,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 2,
            overflow: 'hidden',
            marginTop: 12,
          }}>
            <div style={{
              height: '100%',
              width: `${progress * 100}%`,
              background: isPaused ? 'var(--warning)' : isDanger ? 'var(--danger)' : 'var(--accent)',
              borderRadius: 2,
              boxShadow: isPaused ? '0 0 6px var(--warning)' : isDanger ? '0 0 8px var(--danger)' : '0 0 6px var(--accent)',
              transition: 'width 1s linear, background 0.4s ease',
            }} />
          </div>

          {/* Start / end labels */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            marginTop: 4,
          }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.08em' }}>
              INÍCIO
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.08em' }}>
              {durationLabel}
            </span>
          </div>
        </div>

        {/* Substituir jogador */}
        <button
          onClick={handleOpenSub}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            height: 44,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--font-display)',
            fontSize: 15,
            letterSpacing: '0.1em',
            color: 'var(--text-3)',
            cursor: 'pointer',
          }}
        >
          ↔ SUBSTITUIR JOGADOR
        </button>

        {/* Pause / Resume button */}
        <button
          onClick={isPaused ? handleResume : handlePause}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            height: 48,
            background: isPaused ? 'rgba(255,149,0,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isPaused ? 'rgba(255,149,0,0.35)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--font-display)',
            fontSize: 17,
            letterSpacing: '0.1em',
            color: isPaused ? 'var(--warning)' : 'var(--text-2)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {isPaused ? <IconPlay /> : <IconPause />}
          {isPaused ? 'RETOMAR' : 'PAUSAR'}
        </button>
      </div>

      {/* Substitution modal */}
      {showSubModal && (
        <SubModal
          teamA={teamA}
          teamB={teamB}
          onClose={() => setShowSubModal(false)}
          onRemove={(playerName) => onRemoveMatchPlayer(playerName, remaining)}
        />
      )}

      {/* ENCERRAR button — fixed at bottom */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 390,
        padding: '10px 20px',
        paddingBottom: 'calc(10px + 60px + var(--safe-bottom))',
        background: 'linear-gradient(to top, var(--bg) 60%, transparent)',
        zIndex: 10,
      }}>
        <button
          onClick={onEnd}
          style={{
            width: '100%',
            height: 56,
            background: 'var(--danger)',
            border: 'none',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            letterSpacing: '0.1em',
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(255,59,59,0.3)',
            transition: 'all 0.15s ease',
          }}
        >
          <IconStop />
          ENCERRAR PARTIDA
        </button>
      </div>
    </div>
  )
}
