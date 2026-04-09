import { useState, useRef } from 'react'
import Portal from './Portal'

/* ── Geometry ───────────────────────────────────────────── */
const R  = 74    // radius px
const T  = 10    // thickness px
const D  = R * 2 // diameter
const N  = 60    // edge segments (more = smoother rim)
const SW = (2 * Math.PI * R) / N + 0.8  // segment width + overlap

/* ── Edge ring ──────────────────────────────────────────── */
function CoinEdge() {
  return (
    <>
      {Array.from({ length: N }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: SW,
            height: T,
            top: '50%',
            left: '50%',
            marginTop: -T / 2,
            marginLeft: -SW / 2,
            background: 'linear-gradient(to bottom, #FFE87A 0%, #C8900A 35%, #7A4E00 65%, #C8900A 100%)',
            transform: `rotateY(${i * (360 / N)}deg) translateZ(${R}px)`,
            transformOrigin: 'center center',
          }}
        />
      ))}
    </>
  )
}

/* ── Face shared style ──────────────────────────────────── */
const faceBase = {
  position: 'absolute',
  width: D,
  height: D,
  borderRadius: '50%',
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
}

/* ── CARA face ──────────────────────────────────────────── */
function CoinFront() {
  return (
    <div style={{
      ...faceBase,
      transform: `translateZ(${T / 2}px)`,
      background: [
        'radial-gradient(ellipse 55% 40% at 36% 28%, rgba(255,255,220,0.72) 0%, transparent 60%)',
        'radial-gradient(ellipse 50% 45% at 68% 74%, rgba(60,30,0,0.38) 0%, transparent 55%)',
        'radial-gradient(circle at 50% 50%, #FFE566 0%, #F0A800 38%, #8A5C00 68%, #4A3000 100%)',
      ].join(','),
      boxShadow: `inset 0 0 0 5px rgba(255,200,60,0.25), inset 0 0 0 8px rgba(180,110,0,0.18)`,
    }}>
      {/* Raised rim */}
      <div style={{
        position: 'absolute', inset: 5, borderRadius: '50%',
        border: '3px solid rgba(255,220,80,0.38)',
        boxShadow: 'inset 0 1px 3px rgba(255,255,180,0.2)',
        pointerEvents: 'none',
      }} />
      {/* Mint lines texture */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'repeating-linear-gradient(72deg, transparent, transparent 5px, rgba(255,255,255,0.025) 5px, rgba(255,255,255,0.025) 6px)',
        pointerEvents: 'none',
      }} />
      <span style={{
        fontSize: 48, lineHeight: 1, marginBottom: 4, position: 'relative',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5)) drop-shadow(0 0 8px rgba(255,200,0,0.4))',
      }}>⚽</span>
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: 15, letterSpacing: '0.22em',
        color: '#3A2000', fontWeight: 900, position: 'relative',
        textShadow: '0 1px 0 rgba(255,230,100,0.6)',
      }}>CARA</span>
    </div>
  )
}

/* ── COROA face ─────────────────────────────────────────── */
function CoinBack() {
  return (
    <div style={{
      ...faceBase,
      transform: `rotateY(180deg) translateZ(${T / 2}px)`,
      background: [
        'radial-gradient(ellipse 55% 40% at 64% 28%, rgba(255,255,220,0.68) 0%, transparent 60%)',
        'radial-gradient(ellipse 50% 45% at 34% 74%, rgba(60,30,0,0.38) 0%, transparent 55%)',
        'radial-gradient(circle at 50% 50%, #FFE040 0%, #D09000 38%, #7A5000 68%, #3E2800 100%)',
      ].join(','),
      boxShadow: `inset 0 0 0 5px rgba(255,190,50,0.22), inset 0 0 0 8px rgba(160,90,0,0.15)`,
    }}>
      <div style={{
        position: 'absolute', inset: 5, borderRadius: '50%',
        border: '3px solid rgba(255,200,60,0.35)',
        boxShadow: 'inset 0 1px 3px rgba(255,255,160,0.2)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'repeating-linear-gradient(108deg, transparent, transparent 5px, rgba(255,255,255,0.025) 5px, rgba(255,255,255,0.025) 6px)',
        pointerEvents: 'none',
      }} />
      <span style={{
        fontSize: 48, lineHeight: 1, marginBottom: 4, position: 'relative',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5)) drop-shadow(0 0 8px rgba(255,200,0,0.35))',
      }}>👑</span>
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: 15, letterSpacing: '0.22em',
        color: '#2E1800', fontWeight: 900, position: 'relative',
        textShadow: '0 1px 0 rgba(255,220,80,0.6)',
      }}>COROA</span>
    </div>
  )
}

/* ── Modal ──────────────────────────────────────────────── */
export default function CoinTossModal({ teamA, teamB, onResult, onCancel }) {
  const [phase, setPhase]   = useState('ready')   // ready | spinning | result
  const [result, setResult] = useState(null)       // 'cara' | 'coroa'
  const coinRef = useRef(null)

  const handleFlip = () => {
    if (phase !== 'ready') return
    const isCara  = Math.random() < 0.5
    const newResult = isCara ? 'cara' : 'coroa'
    setPhase('spinning')

    const spins      = 10 + Math.floor(Math.random() * 7)   // 10–16 rotations
    const finalAngle = isCara ? spins * 360 : spins * 360 + 180

    coinRef.current.animate(
      [
        { transform: 'translateY(0px)    rotateY(0deg)                  scale(1)',    offset: 0    },
        { transform: `translateY(-60px)  rotateY(${finalAngle*0.12}deg) scale(1.06)`, offset: 0.10 },
        { transform: `translateY(-185px) rotateY(${finalAngle*0.38}deg) scale(1.18)`, offset: 0.32 },
        { transform: `translateY(-240px) rotateY(${finalAngle*0.50}deg) scale(1.22)`, offset: 0.43 },
        { transform: `translateY(-190px) rotateY(${finalAngle*0.63}deg) scale(1.18)`, offset: 0.55 },
        { transform: `translateY(-80px)  rotateY(${finalAngle*0.84}deg) scale(1.07)`, offset: 0.76 },
        { transform: `translateY(-12px)  rotateY(${finalAngle*0.97}deg) scale(1.01)`, offset: 0.93 },
        { transform: `translateY(0px)    rotateY(${finalAngle}deg)      scale(1)`,    offset: 1    },
      ],
      { duration: 2600, easing: 'linear', fill: 'forwards' }
    ).onfinish = () => {
      setResult(newResult)
      setPhase('result')
    }
  }

  const handleSelectWinner = (team) => {
    const loser = team.id === teamA.id ? teamB : teamA
    onResult(team.id, loser.id)
  }

  const resultColor = result === 'cara' ? '#FFD700' : '#E8B000'
  const resultLabel = result === 'cara' ? '⚽  CARA!' : '👑  COROA!'

  return (
    <Portal>
      <div
        onClick={onCancel}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.90)',
          backdropFilter: 'blur(12px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-end',
          zIndex: 9999,
          padding: '0 0 calc(68px + var(--safe-bottom, 0px))',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 390,
            background: '#0E0E0E',
            borderRadius: '20px 20px 0 0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderBottom: 'none',
            padding: '36px 24px 24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Header */}
          <div style={{ alignSelf: 'flex-start', marginBottom: 28, width: '100%' }}>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700,
              letterSpacing: '0.18em', color: 'rgba(255,149,0,0.8)',
              textTransform: 'uppercase', marginBottom: 5,
            }}>Empate — sorteio</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 34,
              letterSpacing: '0.04em', lineHeight: 1.1, color: '#F0F0F0',
            }}>
              {phase === 'result'
                ? <span style={{ color: resultColor }}>{resultLabel}</span>
                : 'LANÇAR MOEDA'}
            </div>
            {phase === 'result' && (
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: 12,
                color: 'var(--text-3)', marginTop: 8, fontWeight: 500,
              }}>
                Qual time ganhou o sorteio?
              </div>
            )}
          </div>

          {/* ── Coin stage — overflow visible so it can fly up ── */}
          <div style={{
            width: D, height: D,
            perspective: '700px',
            overflow: 'visible',
            marginBottom: 32,
            flexShrink: 0,
            position: 'relative',
            zIndex: 5,
          }}>
            <div
              ref={coinRef}
              style={{
                width: D, height: D,
                transformStyle: 'preserve-3d',
                WebkitTransformStyle: 'preserve-3d',
                position: 'relative',
              }}
            >
              <CoinFront />
              <CoinBack />
              <CoinEdge />
            </div>
          </div>

          {/* Team picker — after result */}
          {phase === 'result' && (
            <div style={{ display: 'flex', gap: 10, width: '100%', marginBottom: 16 }}>
              {[teamA, teamB].map(team => (
                <button
                  key={team?.id}
                  onClick={() => team && handleSelectWinner(team)}
                  style={{
                    flex: 1, height: 62,
                    background: 'rgba(255,149,0,0.07)',
                    border: '1px solid rgba(255,149,0,0.22)',
                    borderRadius: 'var(--radius)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 3,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onPointerOver={e => {
                    e.currentTarget.style.background = 'rgba(255,149,0,0.18)'
                    e.currentTarget.style.border = '1px solid rgba(255,149,0,0.5)'
                  }}
                  onPointerOut={e => {
                    e.currentTarget.style.background = 'rgba(255,149,0,0.07)'
                    e.currentTarget.style.border = '1px solid rgba(255,149,0,0.22)'
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: 17,
                    letterSpacing: '0.05em', color: '#F0F0F0',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', maxWidth: '90%', padding: '0 6px',
                  }}>
                    {(team?.captain ?? '—').toUpperCase()}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 9,
                    color: 'rgba(255,149,0,0.7)', fontWeight: 700,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                  }}>
                    ganhou o sorteio
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Bottom row */}
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button
              onClick={onCancel}
              style={{
                flex: '0 0 auto', width: 90, height: 48,
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
                  background: 'linear-gradient(135deg, #A06800, #FFD700 50%, #A06800)',
                  border: 'none', borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-display)', fontSize: 20,
                  letterSpacing: '0.1em', color: '#3A2000',
                  cursor: 'pointer', fontWeight: 700,
                  boxShadow: '0 0 28px rgba(180,130,0,0.5)',
                }}
              >
                🪙 LANÇAR
              </button>
            )}

            {phase === 'spinning' && (
              <div style={{
                flex: 1, height: 48,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: 14,
                letterSpacing: '0.1em', color: 'var(--text-3)',
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
