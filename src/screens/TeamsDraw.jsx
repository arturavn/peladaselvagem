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

export default function TeamsDraw({ teams, teamQueue, onContinue, onBack }) {
  // Only complete teams are eligible for PRETO/AMARELO — must match MatchSelection logic
  const completeQueueIds = teamQueue.filter(id => {
    const t = teams.find(t => t.id === id)
    return t && t.complete
  })

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
            TIMES DO DIA
          </div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--text-3)',
            fontWeight: 500,
            marginTop: 4,
          }}>
            {teams.length} {teams.length === 1 ? 'time sorteado' : 'times sorteados'}
            {' · '}
            {teams.reduce((acc, t) => acc + t.players.length, 0)} jogadores
          </div>
        </div>
      </div>

      {/* ── Teams list — ordered by queue (complete first) ── */}
      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {teamQueue.map(id => {
          const team = teams.find(t => t.id === id)
          if (!team) return null
          const playingPosition = completeQueueIds.indexOf(id)
          return (
            <TeamCard key={team.id} team={team} queuePosition={playingPosition >= 0 && playingPosition < 2 ? playingPosition : undefined} />
          )
        })}
      </div>

      {/* Spacer — empurra o botão para baixo da lista */}
      <div style={{ flex: 1 }} />

      {/* ── Footer — fluxo natural, sempre após o último time ── */}
      <div style={{
        padding: '16px 20px',
        paddingBottom: 'calc(76px + var(--safe-bottom))',
      }}>
        <button
          className="btn btn-primary"
          onClick={onContinue}
          style={{ height: 56, fontSize: 18, letterSpacing: '0.1em' }}
        >
          SELECIONAR TIMES PARA JOGAR
          <IconArrow />
        </button>
      </div>
    </div>
  )
}

/* ── TeamCard ─────────────────────────────────────────────── */

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
