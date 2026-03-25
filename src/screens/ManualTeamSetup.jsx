import { useState } from 'react'
import Logo from '../components/Logo'

const TEAM_SIZE = 5
const MAX_TEAMS = 6

function IconBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
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

export default function ManualTeamSetup({ players, onBack, onConfirm }) {
  const [teams, setTeams] = useState([
    { tmpId: 'tmp-0', players: [] },
    { tmpId: 'tmp-1', players: [] },
  ])
  const [activeTeam, setActiveTeam] = useState('tmp-0')

  const assigned = new Set(teams.flatMap(t => t.players))
  const unassigned = players.filter(p => !assigned.has(p))

  const allAssigned = unassigned.length === 0
  const teamsWithPlayers = teams.filter(t => t.players.length > 0)
  const canConfirm = allAssigned && teamsWithPlayers.length >= 2

  const handlePlayerClick = (playerName) => {
    if (!assigned.has(playerName)) {
      // Add to active team
      setTeams(prev => prev.map(t =>
        t.tmpId === activeTeam
          ? { ...t, players: [...t.players, playerName] }
          : t
      ))
    } else {
      // Remove from whichever team → back to unassigned pool
      setTeams(prev => prev.map(t => ({
        ...t,
        players: t.players.filter(p => p !== playerName),
      })))
    }
  }

  const addTeam = () => {
    if (teams.length >= MAX_TEAMS) return
    const newId = `tmp-${Date.now()}`
    setTeams(prev => [...prev, { tmpId: newId, players: [] }])
    setActiveTeam(newId)
  }

  const removeTeam = (tmpId) => {
    const team = teams.find(t => t.tmpId === tmpId)
    if (!team || team.players.length > 0) return
    setTeams(prev => prev.filter(t => t.tmpId !== tmpId))
    if (activeTeam === tmpId) {
      setActiveTeam(teams.find(t => t.tmpId !== tmpId)?.tmpId ?? null)
    }
  }

  const handleConfirm = () => {
    const result = teamsWithPlayers.map(t => ({ players: t.players }))
    onConfirm(result)
  }

  return (
    <div className="screen-content" style={{ paddingBottom: 0 }}>
      {/* Header */}
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
            MONTAR TIMES
          </div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--text-3)',
            fontWeight: 500,
            marginTop: 4,
          }}>
            {assigned.size} de {players.length} jogadores distribuídos
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflowY: 'auto' }}>

        {/* Unassigned pool */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="section-label">
            Sem time ({unassigned.length})
          </span>
          {unassigned.length === 0 ? (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(0,255,135,0.04)',
              border: '1px solid rgba(0,255,135,0.12)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              color: 'var(--accent)',
              fontWeight: 500,
            }}>
              ✓ Todos os jogadores foram distribuídos
            </div>
          ) : (
            <>
              <div className="chips-grid">
                {unassigned.map(name => (
                  <button
                    key={name}
                    onClick={() => handlePlayerClick(name)}
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 13,
                      fontWeight: 600,
                      padding: '6px 12px',
                      borderRadius: 999,
                      border: '1px solid rgba(0,255,135,0.4)',
                      background: 'rgba(0,255,135,0.06)',
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                color: 'var(--text-3)',
                fontWeight: 500,
              }}>
                Toque para adicionar ao time selecionado (destacado em verde)
              </div>
            </>
          )}
        </div>

        {/* Teams */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="section-label">Times ({teams.length})</span>
            {teams.length < MAX_TEAMS && (
              <button
                onClick={addTeam}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8,
                  padding: '5px 10px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: 'var(--text-2)',
                }}
              >
                <IconPlus />
                ADD TIME
              </button>
            )}
          </div>

          {teams.map((team, idx) => {
            const isActive = team.tmpId === activeTeam
            return (
              <div
                key={team.tmpId}
                className="card"
                onClick={() => setActiveTeam(team.tmpId)}
                style={{
                  cursor: 'pointer',
                  border: isActive
                    ? '1px solid rgba(0,255,135,0.4)'
                    : '1px solid rgba(255,255,255,0.06)',
                  background: isActive ? 'rgba(0,255,135,0.04)' : 'var(--surface)',
                  transition: 'border-color 0.15s ease, background 0.15s ease',
                }}
              >
                {/* Team header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 18,
                      letterSpacing: '0.06em',
                      color: isActive ? 'var(--accent)' : 'var(--text)',
                    }}>
                      TIME {idx + 1}
                    </span>
                    {isActive && (
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        color: 'var(--accent)',
                        opacity: 0.8,
                      }}>
                        ● ATIVO
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`team-badge ${team.players.length >= TEAM_SIZE ? 'complete' : 'incomplete'}`}>
                      {team.players.length >= TEAM_SIZE ? '✓ COMPLETO' : `${team.players.length}/5`}
                    </span>
                    {team.players.length === 0 && teams.length > 2 && (
                      <button
                        onClick={e => { e.stopPropagation(); removeTeam(team.tmpId) }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'rgba(255,59,59,0.6)',
                          fontSize: 20,
                          padding: '0 4px',
                          lineHeight: 1,
                        }}
                        aria-label="Remover time"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Players in team */}
                {team.players.length === 0 ? (
                  <div style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 12,
                    color: 'var(--text-3)',
                    fontStyle: 'italic',
                    padding: '4px 0',
                  }}>
                    {isActive
                      ? 'Toque nos jogadores acima para adicionar'
                      : 'Vazio — toque aqui para selecionar'}
                  </div>
                ) : (
                  <div className="chips-grid">
                    {team.players.map(name => (
                      <button
                        key={name}
                        className="chip"
                        onClick={e => { e.stopPropagation(); handlePlayerClick(name) }}
                        style={{ cursor: 'pointer' }}
                      >
                        <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {name}
                        </span>
                        <span style={{ marginLeft: 4, opacity: 0.4, fontSize: 10 }}>×</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 20px', paddingBottom: 'calc(76px + var(--safe-bottom))' }}>
        {!allAssigned && (
          <div style={{
            textAlign: 'center',
            marginBottom: 10,
            fontSize: 11,
            color: 'var(--text-3)',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            letterSpacing: '0.04em',
          }}>
            {unassigned.length} {unassigned.length === 1 ? 'jogador sem time' : 'jogadores sem time'}
          </div>
        )}
        <button
          className="btn btn-primary"
          onClick={handleConfirm}
          disabled={!canConfirm}
          style={{ height: 56, fontSize: 18, letterSpacing: '0.1em' }}
        >
          CONFIRMAR TIMES
          <IconArrow />
        </button>
      </div>
    </div>
  )
}
