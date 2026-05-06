import { useState } from 'react'
import Confetti from './Confetti'
import { TEAM_ROLE, getInitials } from './BottomNav'
import ConfirmActionModal from './ConfirmActionModal'

/* ── Decorative confetti rectangles (background) ─────────── */

function DecoRects() {
  const rects = [
    { top: '8%',  left: '6%',  w: 8,  h: 24, rot: 15,  color: 'rgba(255,85,0,0.15)' },
    { top: '12%', right: '8%', w: 6,  h: 18, rot: -20, color: 'rgba(245,196,0,0.15)' },
    { top: '5%',  left: '40%', w: 5,  h: 14, rot: 35,  color: 'rgba(255,85,0,0.1)'  },
    { top: '20%', right: '4%', w: 4,  h: 20, rot: -10, color: 'rgba(255,255,255,0.06)' },
    { top: '3%',  left: '20%', w: 7,  h: 10, rot: 55,  color: 'rgba(245,196,0,0.1)'  },
    { top: '15%', left: '55%', w: 5,  h: 16, rot: -30, color: 'rgba(255,85,0,0.08)' },
    { top: '25%', left: '12%', w: 4,  h: 12, rot: 40,  color: 'rgba(255,255,255,0.05)' },
  ]

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {rects.map((r, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: r.top,
            left: r.left,
            right: r.right,
            width: r.w,
            height: r.h,
            background: r.color,
            borderRadius: 2,
            transform: `rotate(${r.rot}deg)`,
          }}
        />
      ))}
    </div>
  )
}

/* ── Winner button ──────────────────────────────────────────── */

function WinnerBtn({ role, team, isSelected, onClick }) {
  const r = TEAM_ROLE[role]
  const captainName = team?.captain ?? team?.players?.[0] ?? '—'
  const initials = getInitials(captainName)

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: isSelected ? r.cardBg : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isSelected ? r.borderLeft : 'rgba(255,255,255,0.06)'}`,
        borderLeft: `4px solid ${isSelected ? r.borderLeft : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 'var(--radius)',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        userSelect: 'none',
        boxShadow: isSelected && role === 'amarelo' ? '0 0 16px rgba(245,196,0,0.12)' : 'none',
      }}
    >
      {/* Shield */}
      <div style={{
        width: 48,
        height: 48,
        background: isSelected ? r.shieldBg : '#1E1E1E',
        border: `1.5px solid ${isSelected ? r.shieldBorder : '#2A2A2A'}`,
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.18s ease',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 17,
          color: isSelected ? r.shieldText : '#555',
          letterSpacing: '0.04em',
          transition: 'color 0.18s ease',
        }}>
          {initials}
        </span>
      </div>

      {/* Team info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: isSelected ? r.accent : 'var(--text-3)',
          marginBottom: 3,
          transition: 'color 0.18s ease',
        }}>
          {r.label}
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          letterSpacing: '0.04em',
          color: isSelected ? '#F0F0F0' : '#555',
          lineHeight: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          transition: 'color 0.18s ease',
        }}>
          {captainName.toUpperCase()}
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 10,
          color: 'var(--text-3)',
          fontWeight: 500,
          marginTop: 3,
        }}>
          {team?.players?.length ?? 0} jogadores
        </div>
      </div>

      {/* Check indicator */}
      {isSelected && (
        <div style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: role === 'amarelo' ? '#F5C400' : '#444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke={role === 'amarelo' ? '#080808' : '#fff'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  )
}

/* ── Main component ──────────────────────────────────────── */

export default function MatchEndModal({ teamA, teamB, onSelect, onEmpate }) {
  const [selected, setSelected] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [pendingWinner, setPendingWinner] = useState(false)
  const [pendingEmpate, setPendingEmpate] = useState(false)

  const executeWinner = async () => {
    setPendingWinner(false)
    if (confirming || !selected) return
    setConfirming(true)
    try {
      setShowConfetti(true)
      await new Promise(r => setTimeout(r, 800))
      await onSelect(selected.id)
    } catch (e) {
      console.error('confirm error:', e)
      setConfirming(false)
      setShowConfetti(false)
    }
  }

  const executeEmpate = async () => {
    setPendingEmpate(false)
    if (confirming) return
    setConfirming(true)
    try {
      await onEmpate()
    } catch (e) {
      console.error('empate error:', e)
      setConfirming(false)
    }
  }

  return (
    <>
      <Confetti active={showConfetti} />

      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(10px)',
        animation: 'backdropIn 0.25s ease both',
      }}>
        <div style={{
          background: '#0E0E0E',
          borderTop: '1px solid rgba(255,85,0,0.2)',
          borderRadius: '16px 16px 0 0',
          padding: '28px 24px',
          paddingBottom: 'calc(28px + 60px + var(--safe-bottom))',
          position: 'relative',
          animation: 'modalIn 0.32s cubic-bezier(0.25,0.46,0.45,0.94) both',
        }}>
          {/* Decorative background rects */}
          <DecoRects />

          {/* Header */}
          <div style={{ marginBottom: 24, position: 'relative' }}>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              opacity: 0.8,
              marginBottom: 6,
            }}>
              Partida finalizada
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 42,
              letterSpacing: '0.04em',
              lineHeight: 1,
            }}>
              <span style={{ color: '#F0F0F0' }}>QUEM </span>
              <span style={{ color: 'var(--accent)' }}>GANHOU?</span>
            </div>
          </div>

          {/* Team buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, position: 'relative' }}>
            {teamA && (
              <WinnerBtn
                role="preto"
                team={teamA}
                isSelected={selected?.id === teamA.id}
                onClick={() => !confirming && setSelected(teamA)}
              />
            )}
            {teamB && (
              <WinnerBtn
                role="amarelo"
                team={teamB}
                isSelected={selected?.id === teamB.id}
                onClick={() => !confirming && setSelected(teamB)}
              />
            )}
          </div>

          {/* Empate button */}
          <button
            onClick={() => !confirming && setPendingEmpate(true)}
            style={{
              width: '100%',
              height: 40,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-3)',
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.06em',
              cursor: confirming ? 'not-allowed' : 'pointer',
              marginBottom: 14,
              transition: 'all 0.15s ease',
              position: 'relative',
            }}
          >
            SEM VENCEDORES / EMPATE TÉCNICO
          </button>

          {/* Confirm winner button */}
          <button
            onClick={() => !confirming && selected && setPendingWinner(true)}
            disabled={!selected || confirming}
            style={{
              width: '100%',
              height: 54,
              background: selected && !confirming ? 'var(--warning)' : 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-display)',
              fontSize: 19,
              letterSpacing: '0.1em',
              color: selected && !confirming ? '#080808' : 'var(--text-3)',
              cursor: selected && !confirming ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              boxShadow: selected && !confirming ? '0 0 12px rgba(255,149,0,0.35)' : 'none',
              position: 'relative',
            }}
          >
            {confirming
              ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span className="loading-ball">⚽</span> CONFIRMANDO…
                </span>
              : 'CONFIRMAR VENCEDOR'
            }
          </button>

          {/* Footer bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid rgba(255,255,255,0.04)',
            position: 'relative',
          }}>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'var(--text-3)',
            }}>
              PELADA SELVAGEM
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: 'rgba(255,85,0,0.4)',
            }}>
              TACTICAL INTERFACE V2.0
            </span>
          </div>
        </div>
      </div>

      {pendingWinner && (
        <ConfirmActionModal
          message={`VENCEDOR: ${selected?.captain?.toUpperCase()}?`}
          onConfirm={executeWinner}
          onCancel={() => setPendingWinner(false)}
        />
      )}

      {pendingEmpate && (
        <ConfirmActionModal
          message="EMPATE — OS DOIS TIMES SAEM?"
          onConfirm={executeEmpate}
          onCancel={() => setPendingEmpate(false)}
        />
      )}
    </>
  )
}
