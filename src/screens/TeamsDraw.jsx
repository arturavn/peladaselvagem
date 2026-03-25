import { useState } from 'react'
import Logo from '../components/Logo'

/* ── Icons ─────────────────────────────────────────────── */

function IconBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* ── Component ─────────────────────────────────────────── */

export default function TeamsDraw({ teams, teamQueue, onContinue, onBack, isManualSetup, onConfirmManual }) {
  // For manual setup: user picks which team is PRETO and which is AMARELO
  const [pretoId, setPretoId] = useState(null)
  const [amareloId, setAmareloId] = useState(null)

  // Only complete teams are eligible for PRETO/AMARELO — must match MatchSelection logic
  const completeQueueIds = teamQueue.filter(id => {
    const t = teams.find(t => t.id === id)
    return t && t.complete
  })

  const handlePreto = (id) => {
    setPretoId(id)
    if (amareloId === id) setAmareloId(null)
  }

  const handleAmarelo = (id) => {
    setAmareloId(id)
    if (pretoId === id) setPretoId(null)
  }

  const canConfirmManual = pretoId && amareloId && pretoId !== amareloId

  return (
    <div className="screen-content" style={{ paddingBottom: 0 }}>
      {/* ── Header ── */}
      <div className="screen-header" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo size="sm" />
          <button className="back-btn" onClick={onBack}>
            <IconBack /> Voltar
          </button>
        </div>

        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            letterSpacing: '0.06em',
            lineHeight: 1,
            color: 'var(--text)',
          }}>
            {isManualSetup ? 'ESCOLHER TIMES' : 'TIMES DO DIA'}
          </div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--text-3)',
            fontWeight: 500,
            marginTop: 4,
          }}>
            {isManualSetup
              ? 'Selecione qual time começa como Preto e Amarelo'
              : `${teams.length} ${teams.length === 1 ? 'time sorteado' : 'times sorteados'} · ${teams.reduce((acc, t) => acc + t.players.length, 0)} jogadores`
            }
          </div>
        </div>
      </div>

      {/* ── Teams list ── */}
      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {teamQueue.map(id => {
          const team = teams.find(t => t.id === id)
          if (!team) return null

          if (isManualSetup) {
            return (
              <ManualTeamCard
                key={team.id}
                team={team}
                isPreto={pretoId === team.id}
                isAmarelo={amareloId === team.id}
                onSelectPreto={() => handlePreto(team.id)}
                onSelectAmarelo={() => handleAmarelo(team.id)}
              />
            )
          }

          const playingPosition = completeQueueIds.indexOf(id)
          return (
            <TeamCard
              key={team.id}
              team={team}
              queuePosition={playingPosition >= 0 && playingPosition < 2 ? playingPosition : undefined}
            />
          )
        })}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* ── Footer ── */}
      <div style={{
        padding: '16px 20px',
        paddingBottom: 'calc(76px + var(--safe-bottom))',
      }}>
        {isManualSetup ? (
          <>
            {!canConfirmManual && (
              <div style={{
                textAlign: 'center',
                marginBottom: 10,
                fontSize: 11,
                color: 'var(--text-3)',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                letterSpacing: '0.04em',
              }}>
                {!pretoId && !amareloId
                  ? 'Selecione o Time Preto e o Time Amarelo'
                  : !pretoId
                  ? 'Selecione o Time Preto'
                  : 'Selecione o Time Amarelo'}
              </div>
            )}
            <button
              className="btn btn-primary"
              onClick={() => canConfirmManual && onConfirmManual(pretoId, amareloId)}
              disabled={!canConfirmManual}
              style={{ height: 56, fontSize: 18, letterSpacing: '0.1em' }}
            >
              CONFIRMAR SELEÇÃO
              <IconArrow />
            </button>
          </>
        ) : (
          <button
            className="btn btn-primary"
            onClick={onContinue}
            style={{ height: 56, fontSize: 18, letterSpacing: '0.1em' }}
          >
            SELECIONAR TIMES PARA JOGAR
            <IconArrow />
          </button>
        )}
      </div>
    </div>
  )
}

/* ── ManualTeamCard — shown during manual setup for PRETO/AMARELO selection ── */

function ManualTeamCard({ team, isPreto, isAmarelo, onSelectPreto, onSelectAmarelo }) {
  const borderColor = isPreto ? '#555' : isAmarelo ? '#F5C400' : 'rgba(255,255,255,0.06)'

  return (
    <div
      className="card"
      style={{
        border: `1px solid ${borderColor}`,
        background: isPreto
          ? 'rgba(255,255,255,0.02)'
          : isAmarelo
          ? 'rgba(245,196,0,0.03)'
          : 'var(--surface)',
        transition: 'border-color 0.15s ease, background 0.15s ease',
        animation: 'fadeIn 0.35s ease both',
      }}
    >
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isPreto && <span style={{ fontSize: 18 }}>⚫</span>}
          {isAmarelo && <span style={{ fontSize: 18 }}>🟡</span>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {isPreto && (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: '#AAAAAA' }}>
                PRETO
              </span>
            )}
            {isAmarelo && (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: '#F5C400' }}>
                AMARELO
              </span>
            )}
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.06em', color: 'var(--text)' }}>
              {team.captain.toUpperCase()}
            </span>
          </div>
        </div>

        <div className={`team-badge ${team.complete ? 'complete' : 'incomplete'}`}>
          {team.complete ? '✓ COMPLETO' : `${team.players.length}/5`}
        </div>
      </div>

      {/* Divider */}
      <div className="divider" style={{ marginBottom: 10 }} />

      {/* Players */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
        {team.players.map((name, i) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '3px 0' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--text-3)', width: 16, textAlign: 'right', flexShrink: 0 }}>
              {i + 1}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: i === 0 ? 600 : 500, color: i === 0 ? 'var(--text)' : 'var(--text-2)', flex: 1 }}>
              {name}
            </span>
            {i === 0 && (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.1em', opacity: 0.7 }}>
                CAPITÃO
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Selection buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onSelectPreto}
          style={{
            flex: 1,
            height: 36,
            borderRadius: 8,
            border: isPreto ? '1.5px solid #666' : '1px solid rgba(255,255,255,0.1)',
            background: isPreto ? 'rgba(255,255,255,0.08)' : 'transparent',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: isPreto ? '#F0F0F0' : 'var(--text-3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            transition: 'all 0.15s ease',
          }}
        >
          ⚫ PRETO
        </button>
        <button
          onClick={onSelectAmarelo}
          style={{
            flex: 1,
            height: 36,
            borderRadius: 8,
            border: isAmarelo ? '1.5px solid #F5C400' : '1px solid rgba(255,255,255,0.1)',
            background: isAmarelo ? 'rgba(245,196,0,0.1)' : 'transparent',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: isAmarelo ? '#F5C400' : 'var(--text-3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            transition: 'all 0.15s ease',
          }}
        >
          🟡 AMARELO
        </button>
      </div>
    </div>
  )
}

/* ── TeamCard — normal (non-manual) draw display ────────── */

function TeamCard({ team, queuePosition }) {
  const slotLabel = queuePosition === 0 ? 'PRETO' : queuePosition === 1 ? 'AMARELO' : null
  const slotEmoji = queuePosition === 0 ? '⚫' : queuePosition === 1 ? '🟡' : null

  return (
    <div
      className="card"
      style={{
        animation: 'fadeIn 0.35s ease both',
        animationDelay: `${(queuePosition ?? 3) * 50}ms`,
      }}
    >
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {slotEmoji && <span style={{ fontSize: 18 }}>{slotEmoji}</span>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {slotLabel && (
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: queuePosition === 1 ? '#F5C400' : '#AAAAAA',
              }}>
                {slotLabel}
              </span>
            )}
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              letterSpacing: '0.06em',
              color: 'var(--text)',
            }}>
              {team.captain.toUpperCase()}
            </span>
          </div>
        </div>

        <div className={`team-badge ${team.complete ? 'complete' : 'incomplete'}`}>
          {team.complete ? '✓ COMPLETO' : `${team.players.length}/5`}
        </div>
      </div>

      {/* Divider */}
      <div className="divider" style={{ marginBottom: 12 }} />

      {/* Players */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {team.players.map((name, i) => (
          <PlayerRow
            key={name}
            name={name}
            number={i + 1}
            isCaptain={i === 0}
          />
        ))}
      </div>
    </div>
  )
}

function PlayerRow({ name, number, isCaptain }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '6px 0',
    }}>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 13,
        color: 'var(--text-3)',
        width: 16,
        textAlign: 'right',
        flexShrink: 0,
      }}>
        {number}
      </span>
      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        fontWeight: isCaptain ? 600 : 500,
        color: isCaptain ? 'var(--text)' : 'var(--text-2)',
        flex: 1,
      }}>
        {name}
      </span>
      {isCaptain && (
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 9,
          fontWeight: 600,
          color: 'var(--accent)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          opacity: 0.7,
        }}>
          CAPITÃO
        </span>
      )}
    </div>
  )
}
