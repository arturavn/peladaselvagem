import { useEffect } from 'react'

const ANIM_CSS = `
@keyframes msa-teamLeft {
  0%   { transform: perspective(700px) translateX(-130%) rotateY(-50deg) scale(0.6); opacity: 0; filter: blur(10px); }
  65%  { transform: perspective(700px) translateX(3%)    rotateY(6deg)   scale(1.03); opacity: 1; filter: blur(0); }
  100% { transform: perspective(700px) translateX(0)     rotateY(0deg)   scale(1);    opacity: 1; }
}
@keyframes msa-teamRight {
  0%   { transform: perspective(700px) translateX(130%)  rotateY(50deg)  scale(0.6); opacity: 0; filter: blur(10px); }
  65%  { transform: perspective(700px) translateX(-3%)   rotateY(-6deg)  scale(1.03); opacity: 1; filter: blur(0); }
  100% { transform: perspective(700px) translateX(0)     rotateY(0deg)   scale(1);    opacity: 1; }
}
@keyframes msa-vs {
  0%   { transform: perspective(700px) scale(0) rotateZ(-180deg) translateZ(-300px); opacity: 0; }
  65%  { transform: perspective(700px) scale(1.3) rotateZ(8deg) translateZ(30px); opacity: 1; }
  100% { transform: perspective(700px) scale(1)   rotateZ(0deg)  translateZ(0);    opacity: 1; }
}
@keyframes msa-comecou {
  0%   { transform: perspective(700px) translateY(-110%) rotateX(65deg) scale(0.35); opacity: 0; filter: blur(18px); }
  55%  { transform: perspective(700px) translateY(6%)    rotateX(-5deg) scale(1.08); opacity: 1; filter: blur(0); }
  75%  { transform: perspective(700px) translateY(-2%)   rotateX(2deg)  scale(0.99); }
  100% { transform: perspective(700px) translateY(0)     rotateX(0deg)  scale(1);    opacity: 1; }
}
@keyframes msa-flash {
  0%   { opacity: 0; }
  18%  { opacity: 0.55; }
  100% { opacity: 0; }
}
@keyframes msa-exit {
  0%   { opacity: 1; transform: scale(1);    filter: blur(0); }
  35%  { opacity: 1; transform: scale(1.06); filter: blur(0); }
  100% { opacity: 0; transform: scale(1.55); filter: blur(20px); }
}
@keyframes msa-bgpulse {
  0%   { opacity: 0; transform: scale(0.6); }
  45%  { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.3); }
}
@keyframes msa-scan {
  0%   { transform: translateY(-5px); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(110vh); opacity: 0; }
}
`

export default function MatchStartAnimation({ teamA, teamB, onComplete }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2900)
    return () => clearTimeout(t)
  }, [onComplete])

  const nameA = (teamA?.captain ?? teamA?.players?.[0] ?? 'PRETO').toUpperCase()
  const nameB = (teamB?.captain ?? teamB?.players?.[0] ?? 'AMARELO').toUpperCase()
  const sizeA = nameA.length > 8 ? 30 : nameA.length > 6 ? 34 : 40
  const sizeB = nameB.length > 8 ? 30 : nameB.length > 6 ? 34 : 40

  return (
    <>
      <style>{ANIM_CSS}</style>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: '#070707',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        animation: 'msa-exit 0.55s 2.35s cubic-bezier(0.4,0,1,1) both',
      }}>
        {/* Radial glow atmosphere */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 90% 55% at center, rgba(255,85,0,0.13) 0%, transparent 70%)',
          animation: 'msa-bgpulse 2.6s 0.4s ease-out both',
        }} />

        {/* Pitch center circle hint */}
        <div style={{
          position: 'absolute', pointerEvents: 'none',
          width: 320, height: 320, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.035)',
          left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
        }} />
        <div style={{
          position: 'absolute', pointerEvents: 'none',
          width: 2, height: '100%',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.025) 50%, transparent 100%)',
          left: '50%', transform: 'translateX(-50%)',
        }} />

        {/* Scan line */}
        <div style={{
          position: 'absolute', width: '100%', height: 1, pointerEvents: 'none',
          background: 'linear-gradient(to right, transparent, rgba(255,85,0,0.5), transparent)',
          animation: 'msa-scan 1.4s 0.05s linear both',
          zIndex: 1,
        }} />

        {/* Flash on COMEÇOU */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'rgba(255,85,0,0.22)',
          animation: 'msa-flash 0.65s 1.22s ease-out both',
          zIndex: 2,
        }} />

        {/* Teams + VS */}
        <div style={{
          position: 'relative', zIndex: 3,
          width: '100%', padding: '0 20px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 12,
        }}>
          {/* Team A — PRETO */}
          <div style={{
            flex: 1, textAlign: 'right',
            animation: 'msa-teamLeft 0.55s 0s cubic-bezier(0.17,0.67,0.13,1.15) both',
          }}>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 8, fontWeight: 800,
              letterSpacing: '0.22em', color: 'rgba(255,255,255,0.3)',
              marginBottom: 8, textTransform: 'uppercase',
            }}>⚫ TIME PRETO</div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: sizeA,
              letterSpacing: '0.04em', color: '#F2F2F2', lineHeight: 1,
              textShadow: '0 0 30px rgba(255,255,255,0.12)',
            }}>{nameA}</div>
          </div>

          {/* VS */}
          <div style={{
            flexShrink: 0,
            animation: 'msa-vs 0.42s 0.58s cubic-bezier(0.17,0.67,0.13,1.7) both',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 18,
              color: '#FF5500', letterSpacing: '0.12em',
              textShadow: '0 0 20px rgba(255,85,0,1), 0 0 55px rgba(255,85,0,0.6)',
            }}>VS</div>
          </div>

          {/* Team B — AMARELO */}
          <div style={{
            flex: 1, textAlign: 'left',
            animation: 'msa-teamRight 0.55s 0.14s cubic-bezier(0.17,0.67,0.13,1.15) both',
          }}>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 8, fontWeight: 800,
              letterSpacing: '0.22em', color: 'rgba(245,196,0,0.65)',
              marginBottom: 8, textTransform: 'uppercase',
            }}>🟡 TIME AMARELO</div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: sizeB,
              letterSpacing: '0.04em', color: '#F2F2F2', lineHeight: 1,
              textShadow: '0 0 30px rgba(255,255,255,0.12)',
            }}>{nameB}</div>
          </div>
        </div>

        {/* COMEÇOU! */}
        <div style={{
          position: 'absolute', bottom: '22%',
          left: 0, right: 0, textAlign: 'center', zIndex: 3,
          animation: 'msa-comecou 0.52s 1.28s cubic-bezier(0.17,0.67,0.13,1.25) both',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 58,
            letterSpacing: '0.08em', color: '#FF5500', lineHeight: 1,
            textShadow: '0 0 35px rgba(255,85,0,1), 0 0 90px rgba(255,85,0,0.55)',
          }}>COMEÇOU!</div>
        </div>
      </div>
    </>
  )
}
