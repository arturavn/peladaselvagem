import { useState, useRef } from 'react'
import Logo from '../components/Logo'
import { TEAM_ROLE, getInitials } from '../components/BottomNav'

/* ── Next match preview — PRETO vs AMARELO ─────────────── */

function NextMatchPreview({ teamA, teamB }) {
  const rP = TEAM_ROLE.preto
  const rA = TEAM_ROLE.amarelo
  const initialsA = getInitials(teamA?.captain ?? teamA?.players?.[0] ?? '')
  const initialsB = getInitials(teamB?.captain ?? teamB?.players?.[0] ?? '')
  const capA = (teamA?.captain ?? teamA?.players?.[0] ?? '—').toUpperCase()
  const capB = (teamB?.captain ?? teamB?.players?.[0] ?? '—').toUpperCase()

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: 10, fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--accent)', opacity: 0.7,
      }}>
        Próxima partida
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* PRETO side */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40,
            background: rP.shieldBg,
            border: `1.5px solid ${rP.shieldBorder}`,
            borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: rP.shieldText }}>
              {initialsA}
            </span>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', color: rP.accent, textTransform: 'uppercase', marginBottom: 1 }}>
              Time Preto
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.04em', color: 'var(--text)' }}>
              {capA}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-3)' }}>
              {teamA?.players?.length ?? 0}j · {teamA?.wins ?? 0}W
            </div>
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.1em', flexShrink: 0 }}>
          VS
        </div>

        {/* AMARELO side */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', color: rA.accent, textTransform: 'uppercase', marginBottom: 1 }}>
              Time Amarelo
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.04em', color: 'var(--text)' }}>
              {capB}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-3)', textAlign: 'right' }}>
              {teamB?.players?.length ?? 0}j · {teamB?.wins ?? 0}W
            </div>
          </div>
          <div style={{
            width: 40, height: 40,
            background: rA.shieldBg,
            border: `1.5px solid ${rA.shieldBorder}`,
            borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: rA.shieldText }}>
              {initialsB}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Winner banner — no color, just name ────────────────── */

function WinnerBanner({ winner }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px',
      background: 'rgba(0,255,135,0.06)',
      border: '1px solid rgba(0,255,135,0.25)',
      borderRadius: 'var(--radius)',
    }}>
      <span style={{ fontSize: 22 }}>🏆</span>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 10, fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--accent)', opacity: 0.8, marginBottom: 2,
        }}>
          Última partida
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20, letterSpacing: '0.04em', color: 'var(--text)',
        }}>
          {(winner.captain ?? winner.players?.[0] ?? '').toUpperCase()} VENCEU
        </div>
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 22, color: 'var(--accent)', letterSpacing: '0.04em',
      }}>
        {winner.wins}W
      </div>
    </div>
  )
}

/* ── Late player input ──────────────────────────────────── */

function LatePlayerInput({ onAdd }) {
  const [input, setInput] = useState('')
  const [toast, setToast] = useState(false)
  const inputRef = useRef(null)

  const handleAdd = () => {
    const n = input.trim()
    if (!n) return
    onAdd(n)
    setInput('')
    inputRef.current?.focus()
    setToast(true)
    setTimeout(() => setToast(false), 2000)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div style={{
      padding: '14px 16px',
      background: 'rgba(0,255,135,0.03)',
      border: '1px solid rgba(0,255,135,0.12)',
      borderRadius: 'var(--radius)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          opacity: 0.7,
        }}>
          Chegou agora?
        </span>
        {toast && (
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: 'var(--accent)',
            animation: 'fadeIn 0.2s ease both',
          }}>
            ✓ Adicionado!
          </span>
        )}
      </div>
      <div className="input-group">
        <input
          ref={inputRef}
          className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Nome do jogador…"
          maxLength={24}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <button className="input-add-btn" onClick={handleAdd}>
          ADD
        </button>
      </div>
    </div>
  )
}

/* ── Queue row — neutral, no team color ─────────────────── */

function QueueRow({ number, name, team, isCaptain }) {
  const cap = team?.captain ?? team?.players?.[0] ?? ''
  return (
    <div
      className="queue-item"
      style={{ animation: 'fadeIn 0.3s ease both', animationDelay: `${number * 30}ms` }}
    >
      <span className="queue-num">{number}</span>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span className="queue-name" style={{ fontWeight: isCaptain ? 600 : 500 }}>
          {name}
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-3)', fontWeight: 500 }}>
          {cap}
        </span>
      </div>
      {isCaptain && (
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 9, fontWeight: 600,
          color: 'var(--warning)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          background: 'rgba(255,149,0,0.1)',
          border: '1px solid rgba(255,149,0,0.25)',
          padding: '2px 7px',
          borderRadius: 'var(--radius-sm)',
        }}>
          CAP
        </span>
      )}
    </div>
  )
}

/* ── Full queue order — position-based labels only ──────── */

function FullQueueOrder({ teamQueue, teams }) {
  const getTeam = id => teams.find(t => t.id === id)
  const rP = TEAM_ROLE.preto
  const rA = TEAM_ROLE.amarelo

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{
        fontSize: 10, fontFamily: 'var(--font-body)',
        fontWeight: 600, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: 'var(--text-3)',
      }}>
        Ordem da fila
      </span>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {teamQueue.map((id, idx) => {
          const team = getTeam(id)
          if (!team) return null
          const cap = (team.captain ?? team.players?.[0] ?? '').toUpperCase()
          const isPreto   = idx === 0
          const isAmarelo = idx === 1

          return (
            <div key={id} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px',
              background: isPreto
                ? 'rgba(255,255,255,0.03)'
                : isAmarelo ? 'rgba(245,196,0,0.06)' : 'var(--surface)',
              border: `1px solid ${isPreto
                ? 'rgba(100,100,100,0.35)'
                : isAmarelo ? 'rgba(245,196,0,0.3)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
            }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 11,
                color: isPreto ? rP.accent : isAmarelo ? rA.accent : 'var(--text-3)',
                letterSpacing: '0.04em',
              }}>
                {idx + 1}.
              </span>
              {(isPreto || isAmarelo) && (
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 8, fontWeight: 700, letterSpacing: '0.1em',
                  color: isPreto ? rP.accent : rA.accent,
                  textTransform: 'uppercase', opacity: 0.8,
                }}>
                  {isPreto ? 'PRETO' : 'AMARELO'}
                </span>
              )}
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 11,
                color: (isPreto || isAmarelo) ? 'var(--text)' : 'var(--text-3)',
                letterSpacing: '0.04em',
              }}>
                {cap}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Icon ────────────────────────────────────────────────── */

function IconNext() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* ── Main component ─────────────────────────────────────── */

export default function WaitingQueue({ teams, teamQueue, waitingTeams, lastWinner, onNext, onAddLatePlayer }) {
  const nextTeamA = teams.find(t => t.id === teamQueue[0])
  const nextTeamB = teams.find(t => t.id === teamQueue[1])
  const canNext   = teamQueue.length >= 2

  // Players from waiting teams (not in next match)
  const waitingPlayers = waitingTeams.flatMap(team =>
    team.players.map((name, i) => ({ name, team, isCaptain: i === 0 }))
  )

  return (
    <div className="screen-content" style={{ paddingBottom: 0 }}>

      {/* Header */}
      <div className="screen-header" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Logo size="sm" />
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36, letterSpacing: '0.06em', lineHeight: 1, color: 'var(--text)',
          }}>
            PRÓXIMOS
          </div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginTop: 4,
          }}>
            Fila de espera · {waitingPlayers.length} {waitingPlayers.length === 1 ? 'jogador' : 'jogadores'}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Add late player input — always visible */}
        <LatePlayerInput onAdd={onAddLatePlayer} />

        {lastWinner && <WinnerBanner winner={lastWinner} />}

        {nextTeamA && nextTeamB && (
          <NextMatchPreview teamA={nextTeamA} teamB={nextTeamB} />
        )}

        {waitingPlayers.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{
              fontSize: 10, fontFamily: 'var(--font-body)',
              fontWeight: 600, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'var(--text-3)',
            }}>
              Aguardando
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {waitingPlayers.map(({ name, team, isCaptain }, idx) => (
                <QueueRow
                  key={`${team.id}-${name}`}
                  number={idx + 1}
                  name={name}
                  team={team}
                  isCaptain={isCaptain}
                />
              ))}
            </div>
          </div>
        )}

        {waitingPlayers.length === 0 && (
          <div className="empty-state">
            <span style={{ fontSize: 24 }}>⚽</span>
            <span>Todos os jogadores estão em campo</span>
          </div>
        )}

        {teamQueue.length > 0 && (
          <FullQueueOrder teamQueue={teamQueue} teams={teams} />
        )}
      </div>

      {/* PRÓXIMA PARTIDA — natural flow, below all content */}
      <div style={{ flex: 1 }} />
      <div style={{
        padding: '16px 20px',
        paddingBottom: 'calc(76px + var(--safe-bottom))',
      }}>
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={!canNext}
          style={{ height: 60, fontSize: 20, letterSpacing: '0.1em' }}
        >
          PRÓXIMA PARTIDA
          <IconNext />
        </button>
      </div>
    </div>
  )
}
