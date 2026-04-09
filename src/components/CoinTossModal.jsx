import { useState, useRef } from 'react'
import Portal from './Portal'
import { getInitials, TEAM_ROLE } from './BottomNav'

/* ── Coin face ──────────────────────────────────────────── */

function CoinFace({ side, flipped }) {
  const isCara = side === 'cara'
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      borderRadius: '50%',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      transform: flipped ? 'rotateY(180deg)' : 'none',
      background: isCara
        ? 'radial-gradient(circle at 38% 32%, #FFE066, #C8960C 55%, #8A6200)'
        : 'radial-gradient(circle at 38% 32%, #E8E8E8, #A0A0A0 55%, #585858)',
      boxShadow: isCara
        ? 'inset 0 3px 8px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.6)'
        : 'inset 0 3px 8px rgba(255,255,255,0.4), inset 0 -3px 6px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.6)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      userSelect: 'none',
    }}>
      {/* Rim ring */}
      <div style={{
        position: 'absolute',
        inset: 6,
        borderRadius: '50%',
        border: `2px solid ${isCara ? 'rgba(255,200,0,0.45)' : 'rgba(200,200,200,0.4)'}`,
        pointerEvents: 'none',
      }} />

      <span style={{ fontSize: 36, lineHeight: 1 }}>
        {isCara ? '⚽' : '👑'}
      </span>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 13,
        letterSpacing: '0.14em',
        color: isCara ? '#5A3A00' : '#2A2A2A',
        fontWeight: 700,
      }}>
        {isCara ? 'CARA' : 'COROA'}
      </span>
    </div>
  )
}

/* ── Main modal ─────────────────────────────────────────── */

export default function CoinTossModal({ teamA, teamB, onResult, onCancel }) {
  // teamA = CARA, teamB = COROA (assignment shown to user)
  const [phase, setPhase] = useState('ready') // 'ready' | 'spinning' | 'result'
  const [result, setResult] = useState(null)  // 'cara' | 'coroa'
  const coinInnerRef = useRef(null)

  const handleFlip = () => {
    if (phase !== 'ready') return
    const isCara = Math.random() < 0.5
    const newResult = isCara ? 'cara' : 'coroa'
    setPhase('spinning')

    const spins = 5 + Math.floor(Math.random() * 4) // 5–8 full rotations
    // Extra 180° for coroa so it lands face-down (shows coroa face)
    const finalAngle = spins * 360 + (isCara ? 0 : 180)

    if (coinInnerRef.current) {
      const anim = coinInnerRef.current.animate(
        [
          { transform: 'rotateY(0deg) translateY(0px) scale(1)' },
          { transform: `rotateY(${finalAngle * 0.38}deg) translateY(-110px) scale(1.5)`, offset: 0.32 },
          { transform: `rotateY(${finalAngle * 0.72}deg) translateY(-50px) scale(1.2)`,  offset: 0.68 },
          { transform: `rotateY(${finalAngle}deg) translateY(0px) scale(1)` },
        ],
        { duration: 2400, easing: 'cubic-bezier(0.33, 1, 0.68, 1)', fill: 'forwards' }
      )
      anim.onfinish = () => {
        setResult(newResult)
        setPhase('result')
      }
    }
  }

  const winnerTeam = result === 'cara' ? teamA : teamB
  const loserTeam  = result === 'cara' ? teamB : teamA

  return (
    <Portal>
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        zIndex: 9999,
        padding: '0 0 calc(72px + var(--safe-bottom, 0px))',
      }}>
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 390,
            background: '#0E0E0E',
            borderRadius: '20px 20px 0 0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderBottom: 'none',
            padding: '28px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
          }}
        >
          {/* Header */}
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: 'rgba(255,149,0,0.8)',
            textTransform: 'uppercase',
            marginBottom: 6,
            alignSelf: 'flex-start',
          }}>
            Empate — sorteio
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            letterSpacing: '0.04em',
            color: '#F0F0F0',
            alignSelf: 'flex-start',
            marginBottom: 24,
            lineHeight: 1,
          }}>
            {phase === 'result'
              ? <><span style={{ color: result === 'cara' ? '#FFD700' : '#C0C0C0' }}>{result.toUpperCase()}</span>!</>
              : 'LANÇAR MOEDA'}
          </div>

          {/* Team assignments */}
          {phase !== 'result' && (
            <div style={{
              display: 'flex',
              width: '100%',
              gap: 8,
              marginBottom: 28,
            }}>
              {[
                { label: '⚽ CARA',  team: teamA, color: '#FFD700' },
                { label: '👑 COROA', team: teamB, color: '#C0C0C0' },
              ].map(({ label, team, color }) => (
                <div key={label} style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 'var(--radius)',
                  padding: '10px 12px',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    color,
                    marginBottom: 4,
                  }}>
                    {label}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 16,
                    letterSpacing: '0.04em',
                    color: '#CCCCCC',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {(team?.captain ?? '—').toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Coin */}
          <div style={{
            perspective: '700px',
            width: 140,
            height: 140,
            marginBottom: phase === 'result' ? 16 : 28,
          }}>
            <div
              ref={coinInnerRef}
              style={{
                width: 140,
                height: 140,
                transformStyle: 'preserve-3d',
                WebkitTransformStyle: 'preserve-3d',
                position: 'relative',
              }}
            >
              <CoinFace side="cara"  flipped={false} />
              <CoinFace side="coroa" flipped={true}  />
            </div>
          </div>

          {/* Result: show winner / loser */}
          {phase === 'result' && (
            <div style={{ width: '100%', marginBottom: 20 }}>
              <div style={{
                display: 'flex',
                gap: 8,
                width: '100%',
              }}>
                {[
                  { team: winnerTeam, label: 'VENCEDOR', color: 'rgba(255,200,0,0.15)', border: 'rgba(255,200,0,0.4)', textColor: '#FFD700', badge: '🏆 1º NA FILA' },
                  { team: loserTeam,  label: 'PERDEDOR',  color: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.07)', textColor: 'var(--text-3)', badge: '2º NA FILA' },
                ].map(({ team, label, color, border, textColor, badge }) => (
                  <div key={label} style={{
                    flex: 1,
                    background: color,
                    border: `1px solid ${border}`,
                    borderRadius: 'var(--radius)',
                    padding: '12px',
                    textAlign: 'center',
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      color: textColor,
                      marginBottom: 4,
                    }}>
                      {badge}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 17,
                      letterSpacing: '0.04em',
                      color: '#F0F0F0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {(team?.captain ?? '—').toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button
              onClick={onCancel}
              style={{
                flex: '0 0 auto',
                width: 100,
                height: 52,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-display)',
                fontSize: 13,
                letterSpacing: '0.08em',
                color: 'var(--text-3)',
                cursor: 'pointer',
              }}
            >
              VOLTAR
            </button>

            {phase === 'ready' && (
              <button
                onClick={handleFlip}
                style={{
                  flex: 1,
                  height: 52,
                  background: 'linear-gradient(135deg, #C8960C, #FFD700, #C8960C)',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-display)',
                  fontSize: 19,
                  letterSpacing: '0.1em',
                  color: '#080808',
                  cursor: 'pointer',
                  fontWeight: 700,
                  boxShadow: '0 0 20px rgba(200,150,0,0.4)',
                }}
              >
                LANÇAR 🪙
              </button>
            )}

            {phase === 'spinning' && (
              <button
                disabled
                style={{
                  flex: 1,
                  height: 52,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-display)',
                  fontSize: 15,
                  letterSpacing: '0.08em',
                  color: 'var(--text-3)',
                  cursor: 'not-allowed',
                }}
              >
                …
              </button>
            )}

            {phase === 'result' && (
              <button
                onClick={() => onResult(winnerTeam.id, loserTeam.id)}
                style={{
                  flex: 1,
                  height: 52,
                  background: 'var(--warning)',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-display)',
                  fontSize: 17,
                  letterSpacing: '0.1em',
                  color: '#080808',
                  cursor: 'pointer',
                  fontWeight: 700,
                  boxShadow: '0 0 14px rgba(255,149,0,0.35)',
                }}
              >
                CONFIRMAR
              </button>
            )}
          </div>
        </div>
      </div>
    </Portal>
  )
}
