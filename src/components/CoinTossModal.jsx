import { useState, useRef } from 'react'
import Portal from './Portal'

/* ── Coin faces ─────────────────────────────────────────── */

function CoinFront() {
  return (
    <div style={{
      position: 'absolute', inset: 0, borderRadius: '50%',
      backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
      background: 'radial-gradient(circle at 38% 32%, #FFF3A0, #F5C200 28%, #C48800 58%, #7A5000)',
      boxShadow: 'inset 0 3px 10px rgba(255,255,200,0.55), inset 0 -4px 8px rgba(0,0,0,0.45), 0 6px 24px rgba(0,0,0,0.7)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Outer rim */}
      <div style={{
        position: 'absolute', inset: 5, borderRadius: '50%',
        border: '2.5px solid rgba(255,220,80,0.5)',
        pointerEvents: 'none',
      }} />
      {/* Inner rim */}
      <div style={{
        position: 'absolute', inset: 11, borderRadius: '50%',
        border: '1px solid rgba(255,220,80,0.25)',
        pointerEvents: 'none',
      }} />
      <span style={{ fontSize: 42, lineHeight: 1, marginBottom: 2, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}>⚽</span>
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.2em',
        color: '#5A3500', fontWeight: 900, textShadow: '0 1px 0 rgba(255,220,100,0.5)',
      }}>CARA</span>
    </div>
  )
}

function CoinBack() {
  return (
    <div style={{
      position: 'absolute', inset: 0, borderRadius: '50%',
      backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
      transform: 'rotateY(180deg)',
      background: 'radial-gradient(circle at 62% 35%, #FFF3A0, #E8B400 28%, #A87000 58%, #5A3800)',
      boxShadow: 'inset 0 3px 10px rgba(255,255,200,0.55), inset 0 -4px 8px rgba(0,0,0,0.45), 0 6px 24px rgba(0,0,0,0.7)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 5, borderRadius: '50%',
        border: '2.5px solid rgba(255,200,60,0.5)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 11, borderRadius: '50%',
        border: '1px solid rgba(255,200,60,0.25)', pointerEvents: 'none',
      }} />
      <span style={{ fontSize: 42, lineHeight: 1, marginBottom: 2, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}>👑</span>
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.2em',
        color: '#3A2000', fontWeight: 900, textShadow: '0 1px 0 rgba(255,200,80,0.5)',
      }}>COROA</span>
    </div>
  )
}

/* ── Main modal ─────────────────────────────────────────── */

export default function CoinTossModal({ teamA, teamB, onResult, onCancel }) {
  const [phase, setPhase] = useState('ready')      // 'ready' | 'spinning' | 'result' | 'pick'
  const [result, setResult] = useState(null)        // 'cara' | 'coroa'
  const coinRef = useRef(null)

  const handleFlip = () => {
    if (phase !== 'ready') return
    const isCara = Math.random() < 0.5
    setPhase('spinning')

    const spins = 9 + Math.floor(Math.random() * 7)   // 9-15 full rotations
    const finalAngle = isCara ? spins * 360 : spins * 360 + 180

    coinRef.current.animate(
      [
        { transform: 'translateY(0px)   rotateY(0deg)             scale(1)'   },
        { transform: `translateY(-240px) rotateY(${finalAngle * 0.42}deg) scale(1.25)`, offset: 0.30 },
        { transform: `translateY(-130px) rotateY(${finalAngle * 0.70}deg) scale(1.12)`, offset: 0.58 },
        { transform: `translateY(-24px)  rotateY(${finalAngle * 0.94}deg) scale(1.03)`, offset: 0.85 },
        { transform: `translateY(0px)   rotateY(${finalAngle}deg)   scale(1)`   },
      ],
      { duration: 2400, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)', fill: 'forwards' }
    ).onfinish = () => {
      setResult(isCara ? 'cara' : 'coroa')
      setPhase('result')
    }
  }

  const handleSelectWinner = (team) => {
    const loser = team.id === teamA.id ? teamB : teamA
    onResult(team.id, loser.id)
  }

  const resultLabel = result === 'cara' ? '⚽ CARA!' : '👑 COROA!'
  const resultColor = result === 'cara' ? '#FFD700' : '#E8B400'

  return (
    <Portal>
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        zIndex: 9999,
        padding: '0 0 calc(68px + var(--safe-bottom, 0px))',
        overflow: 'hidden',
      }}>
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 390,
            background: '#0E0E0E',
            borderRadius: '20px 20px 0 0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderBottom: 'none',
            padding: '32px 24px 24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            overflow: 'visible',
            position: 'relative',
          }}
        >
          {/* Header */}
          <div style={{
            alignSelf: 'flex-start', marginBottom: 24, width: '100%',
          }}>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700,
              letterSpacing: '0.18em', color: 'rgba(255,149,0,0.8)',
              textTransform: 'uppercase', marginBottom: 5,
            }}>Empate — sorteio</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 32,
              letterSpacing: '0.04em', lineHeight: 1, color: '#F0F0F0',
            }}>
              {phase === 'result' || phase === 'pick'
                ? <span style={{ color: resultColor }}>{resultLabel}</span>
                : 'LANÇAR MOEDA'}
            </div>
            {(phase === 'result' || phase === 'pick') && (
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: 12,
                color: 'var(--text-3)', marginTop: 6, fontWeight: 500,
              }}>
                Qual time ganhou o sorteio?
              </div>
            )}
          </div>

          {/* Coin — overflow visible so it can fly above modal */}
          <div style={{
            perspective: '600px',
            width: 148, height: 148,
            marginBottom: 28,
            overflow: 'visible',
            position: 'relative',
            zIndex: 10,
          }}>
            <div
              ref={coinRef}
              style={{
                width: 148, height: 148,
                transformStyle: 'preserve-3d',
                WebkitTransformStyle: 'preserve-3d',
                position: 'relative',
              }}
            >
              <CoinFront />
              <CoinBack />
            </div>
          </div>

          {/* Team picker — shown after result */}
          {(phase === 'result' || phase === 'pick') && (
            <div style={{ display: 'flex', gap: 10, width: '100%', marginBottom: 16 }}>
              {[teamA, teamB].map(team => (
                <button
                  key={team?.id}
                  onClick={() => team && handleSelectWinner(team)}
                  style={{
                    flex: 1, height: 64,
                    background: 'rgba(255,149,0,0.08)',
                    border: '1px solid rgba(255,149,0,0.25)',
                    borderRadius: 'var(--radius)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 2,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = 'rgba(255,149,0,0.18)'
                    e.currentTarget.style.border = '1px solid rgba(255,149,0,0.5)'
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = 'rgba(255,149,0,0.08)'
                    e.currentTarget.style.border = '1px solid rgba(255,149,0,0.25)'
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: 18,
                    letterSpacing: '0.06em', color: '#F0F0F0',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    maxWidth: '100%', padding: '0 8px',
                  }}>
                    {(team?.captain ?? '—').toUpperCase()}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 10,
                    color: 'rgba(255,149,0,0.7)', fontWeight: 600, letterSpacing: '0.08em',
                  }}>
                    GANHOU O SORTEIO
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Bottom buttons */}
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button
              onClick={onCancel}
              style={{
                flex: '0 0 auto', width: 92, height: 48,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-display)', fontSize: 12,
                letterSpacing: '0.08em', color: 'var(--text-3)', cursor: 'pointer',
              }}
            >
              VOLTAR
            </button>

            {phase === 'ready' && (
              <button
                onClick={handleFlip}
                style={{
                  flex: 1, height: 48,
                  background: 'linear-gradient(135deg, #B87800, #FFD700 50%, #B87800)',
                  border: 'none', borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-display)', fontSize: 20,
                  letterSpacing: '0.1em', color: '#3A2000',
                  cursor: 'pointer', fontWeight: 700,
                  boxShadow: '0 0 24px rgba(200,150,0,0.45)',
                }}
              >
                🪙 LANÇAR
              </button>
            )}

            {phase === 'spinning' && (
              <div style={{
                flex: 1, height: 48, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-3)', fontFamily: 'var(--font-display)',
                fontSize: 13, letterSpacing: '0.1em',
              }}>
                …
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  )
}
