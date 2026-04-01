import { useState, useRef, useEffect } from 'react'
import Logo from '../components/Logo'
import { TEAM_ROLE, getInitials } from '../components/BottomNav'
import Portal from '../components/Portal'

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
      background: 'rgba(255,85,0,0.06)',
      border: '1px solid rgba(255,85,0,0.25)',
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

const firstWord = str => str.trim().split(/\s+/)[0].toLowerCase()

function LatePlayerInput({ onAdd, allPlayers }) {
  const [input, setInput]   = useState('')
  const [toast, setToast]   = useState(false)
  const [pending, setPending] = useState('') // name waiting for surname
  const [warn, setWarn]     = useState('')   // duplicate warning message
  const inputRef = useRef(null)

  const handleAdd = () => {
    const val = input.trim()
    if (!val) return

    if (pending) {
      // Surname step — combine and check full name
      const full = `${pending} ${val}`
      const conflict = allPlayers.some(p => p.toLowerCase() === full.toLowerCase())
      if (conflict) {
        setPending(full)
        setInput('')
        setWarn(`Já existe "${full}". Informe outro sobrenome:`)
        inputRef.current?.focus()
        return
      }
      onAdd(full)
      setPending('')
      setWarn('')
    } else {
      // First-name step — check if first word clashes
      const conflict = allPlayers.some(p => firstWord(p) === firstWord(val))
      if (conflict) {
        setPending(val)
        setInput('')
        setWarn(`Já existe um "${val}". Informe o sobrenome:`)
        inputRef.current?.focus()
        return
      }
      onAdd(val)
    }

    setInput('')
    inputRef.current?.focus()
    setToast(true)
    setTimeout(() => setToast(false), 2000)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleAdd()
  }

  const handleCancel = () => {
    setPending('')
    setWarn('')
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <div style={{
      padding: '14px 16px',
      background: 'rgba(255,85,0,0.03)',
      border: '1px solid rgba(255,85,0,0.12)',
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

      {warn && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          padding: '8px 10px',
          background: 'rgba(255,208,0,0.08)',
          border: '1px solid rgba(255,208,0,0.25)',
          borderRadius: 'var(--radius-sm)',
        }}>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--warning)', lineHeight: 1.4,
          }}>
            {warn}
          </span>
          <button onClick={handleCancel} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-3)', fontSize: 14, padding: '0 2px', flexShrink: 0,
          }}>✕</button>
        </div>
      )}

      <div className="input-group">
        <input
          ref={inputRef}
          className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={pending ? `Sobrenome de ${pending}…` : 'Nome do jogador…'}
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

/* ── Remove player modal ────────────────────────────────── */

function RemovePlayerModal({ teams, teamQueue, onRemove, onClose }) {
  const [confirm, setConfirm] = useState(null) // { name, teamName }

  // All players across all teams in queue order
  const allPlayers = teamQueue.flatMap(id => {
    const team = teams.find(t => t.id === id)
    if (!team) return []
    return team.players.map((name, i) => ({
      name,
      teamCap: team.captain ?? team.players[0] ?? '',
      isCaptain: i === 0,
    }))
  })

  const handleTap = (player) => {
    setConfirm(player)
  }

  const handleConfirm = () => {
    onRemove(confirm.name)
    setConfirm(null)
    onClose()
  }

  return (
    <Portal><div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth: 390,
        background: 'var(--surface)',
        borderRadius: '20px 20px 0 0',
        maxHeight: '75dvh',
        display: 'flex', flexDirection: 'column',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '20px 20px 12px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.06em', color: 'var(--text)' }}>
              REMOVER JOGADOR
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
              Jogador sai da pelada mas fica na lista de pagamentos
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-3)', fontSize: 20, padding: 4,
          }}>✕</button>
        </div>

        {/* Confirm overlay */}
        {confirm && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '20px 20px 0 0',
          }}>
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px 20px',
              margin: 20,
              display: 'flex', flexDirection: 'column', gap: 16,
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--danger)', letterSpacing: '0.06em' }}>
                REMOVER {confirm.name.toUpperCase()}?
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
                Ele sai da pelada de hoje mas permanece na lista de pagamentos.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirm(null)} style={{
                  flex: 1, padding: '12px 0',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-3)',
                  fontFamily: 'var(--font-display)',
                  fontSize: 14, letterSpacing: '0.06em', cursor: 'pointer',
                }}>
                  CANCELAR
                </button>
                <button onClick={handleConfirm} style={{
                  flex: 1, padding: '12px 0',
                  background: 'var(--danger)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontFamily: 'var(--font-display)',
                  fontSize: 14, letterSpacing: '0.06em', cursor: 'pointer',
                }}>
                  REMOVER
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Player list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
          {allPlayers.map(({ name, teamCap, isCaptain }, idx) => (
            <div key={`${name}-${idx}`} onClick={() => handleTap({ name, teamCap })} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 20px',
              borderBottom: '1px solid var(--border)',
              cursor: 'pointer',
              background: 'transparent',
            }}>
              <div style={{
                width: 32, height: 32,
                background: 'var(--bg)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--text-3)' }}>
                  {idx + 1}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: isCaptain ? 600 : 400, color: 'var(--text)' }}>
                  {name}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-3)' }}>
                  Time do {teamCap}
                </div>
              </div>
              {isCaptain && (
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700,
                  color: 'var(--warning)', letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: 'rgba(255,149,0,0.1)', border: '1px solid rgba(255,149,0,0.25)',
                  padding: '2px 7px', borderRadius: 'var(--radius-sm)',
                }}>CAP</span>
              )}
              <span style={{ color: 'var(--danger)', fontSize: 14, opacity: 0.6 }}>✕</span>
            </div>
          ))}
        </div>
      </div>
    </div></Portal>
  )
}

/* ── AdjustTeamsModal ───────────────────────────────────── */

const TEAM_SIZE_LOCAL = 5

function AdjustTeamsModal({ teams, teamQueue, onSave, onClose }) {
  const [localQueue, setLocalQueue] = useState(() => [...teamQueue])
  const [localTeams, setLocalTeams] = useState(() =>
    teams.map(t => ({ ...t, players: [...t.players] }))
  )
  const [editingId, setEditingId] = useState(null) // null = list view

  const getLocalTeam = id => localTeams.find(t => t.id === id)

  /* ── Reorder ── */
  const moveUp = (idx) => {
    if (idx <= 0) return
    const q = [...localQueue]
    ;[q[idx - 1], q[idx]] = [q[idx], q[idx - 1]]
    setLocalQueue(q)
  }
  const moveDown = (idx) => {
    if (idx >= localQueue.length - 1) return
    const q = [...localQueue]
    ;[q[idx], q[idx + 1]] = [q[idx + 1], q[idx]]
    setLocalQueue(q)
  }

  /* ── Roster edit ── */
  const removeFromTeam = (teamId, playerName) => {
    setLocalTeams(prev => prev.map(t => {
      if (t.id !== teamId) return t
      const players = t.players.filter(p => p !== playerName)
      return { ...t, players, captain: players[0] ?? null, complete: players.length >= TEAM_SIZE_LOCAL }
    }))
  }

  const movePlayerToTeam = (targetTeamId, playerName) => {
    setLocalTeams(prev => {
      const without = prev.map(t => {
        if (!t.players.includes(playerName)) return t
        const players = t.players.filter(p => p !== playerName)
        return { ...t, players, captain: players[0] ?? null, complete: players.length >= TEAM_SIZE_LOCAL }
      })
      return without.map(t => {
        if (t.id !== targetTeamId) return t
        const players = [...t.players, playerName]
        return { ...t, players, captain: players[0], complete: players.length >= TEAM_SIZE_LOCAL }
      })
    })
  }

  /* ── Floating players (removed but not reassigned) ── */
  const currentlyAssigned = new Set(localTeams.flatMap(t => t.players))
  const originalPlayers = teams.filter(t => teamQueue.includes(t.id)).flatMap(t => t.players)
  const floating = originalPlayers.filter(p => !currentlyAssigned.has(p))

  /* ── Save ── */
  const handleSave = () => {
    let finalTeams = localTeams
    if (floating.length > 0 && localQueue.length > 0) {
      const lastId = localQueue[localQueue.length - 1]
      finalTeams = localTeams.map(t => {
        if (t.id !== lastId) return t
        const players = [...t.players, ...floating]
        return { ...t, players, captain: players[0], complete: players.length >= TEAM_SIZE_LOCAL }
      })
    }
    const teamsPayload = localQueue.map(id => {
      const t = finalTeams.find(t => t.id === id)
      return { id, players: t?.players ?? [] }
    })
    onSave(localQueue, teamsPayload)
  }

  const editingTeam = editingId ? getLocalTeam(editingId) : null
  const otherPlayers = editingId
    ? localTeams
        .filter(t => t.id !== editingId && localQueue.includes(t.id))
        .flatMap(t => t.players.map(name => ({ name, fromTeamCap: t.captain ?? t.players[0] ?? '' })))
    : []
  const floatingForEdit = editingId ? floating : []

  return (
    <Portal><div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 390,
          background: 'var(--surface)',
          borderRadius: '20px 20px 0 0',
          maxHeight: '88dvh',
          display: 'flex', flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 12px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {editingId && (
              <button
                onClick={() => setEditingId(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '4px 8px 4px 0', fontSize: 18 }}
              >
                ←
              </button>
            )}
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.06em', color: 'var(--text)' }}>
                {editingId
                  ? `EDITAR ${(editingTeam?.captain ?? '').toUpperCase()}`
                  : 'AJUSTAR TIMES'}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                {editingId
                  ? 'Mova jogadores entre times'
                  : 'Reordene a fila ou edite elencos'}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 20, padding: 4 }}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '12px 0' }}>

          {/* ── LIST VIEW ── */}
          {!editingId && localQueue.map((id, idx) => {
            const team = getLocalTeam(id)
            if (!team) return null
            const isPreto   = idx === 0
            const isAmarelo = idx === 1
            const cap = (team.captain ?? team.players[0] ?? '').toUpperCase()

            return (
              <div key={id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 20px',
                borderBottom: '1px solid var(--border)',
              }}>
                {/* Position + reorder */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    style={{
                      background: 'transparent', border: 'none', cursor: idx === 0 ? 'default' : 'pointer',
                      color: idx === 0 ? 'var(--border)' : 'var(--text-2)',
                      fontSize: 16, padding: '2px 6px', lineHeight: 1,
                    }}
                  >
                    ▲
                  </button>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 12,
                    color: isPreto ? '#AAAAAA' : isAmarelo ? '#F5C400' : 'var(--text-3)' }}>
                    {idx + 1}
                  </span>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === localQueue.length - 1}
                    style={{
                      background: 'transparent', border: 'none',
                      cursor: idx === localQueue.length - 1 ? 'default' : 'pointer',
                      color: idx === localQueue.length - 1 ? 'var(--border)' : 'var(--text-2)',
                      fontSize: 16, padding: '2px 6px', lineHeight: 1,
                    }}
                  >
                    ▼
                  </button>
                </div>

                {/* Team info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {(isPreto || isAmarelo) && (
                    <div style={{
                      fontFamily: 'var(--font-body)', fontSize: 8, fontWeight: 700,
                      letterSpacing: '0.14em', textTransform: 'uppercase',
                      color: isPreto ? '#AAAAAA' : '#F5C400', marginBottom: 2,
                    }}>
                      {isPreto ? '⚫ PRETO' : '🟡 AMARELO'}
                    </div>
                  )}
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, letterSpacing: '0.04em', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cap}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>
                    {team.players.length} jog. · {team.wins ?? 0}W
                    {!team.complete && <span style={{ color: 'var(--warning)', marginLeft: 6 }}>incompleto</span>}
                  </div>
                </div>

                {/* Edit button */}
                <button
                  onClick={() => setEditingId(id)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8, padding: '6px 12px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.08em', color: 'var(--text-2)',
                    flexShrink: 0,
                  }}
                >
                  EDITAR
                </button>
              </div>
            )
          })}

          {/* ── EDIT VIEW ── */}
          {editingId && (
            <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Current players */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)', paddingTop: 4 }}>
                  Neste time ({editingTeam?.players.length ?? 0})
                </span>
                {editingTeam?.players.length === 0 ? (
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic', padding: '4px 0' }}>
                    Nenhum jogador — adicione abaixo
                  </div>
                ) : (
                  <div className="chips-grid">
                    {editingTeam?.players.map(name => (
                      <button
                        key={name}
                        className="chip"
                        onClick={() => removeFromTeam(editingId, name)}
                        style={{ cursor: 'pointer' }}
                      >
                        <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                        <span style={{ marginLeft: 4, opacity: 0.45, fontSize: 10 }}>×</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Floating players (removed, nowhere to go) */}
              {floatingForEdit.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--warning)' }}>
                    Sem time ({floatingForEdit.length})
                  </span>
                  <div className="chips-grid">
                    {floatingForEdit.map(name => (
                      <button
                        key={name}
                        onClick={() => movePlayerToTeam(editingId, name)}
                        style={{
                          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                          padding: '6px 12px', borderRadius: 999,
                          border: '1px solid rgba(255,149,0,0.4)',
                          background: 'rgba(255,149,0,0.06)',
                          color: 'var(--warning)', cursor: 'pointer', whiteSpace: 'nowrap',
                        }}
                      >
                        + {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Players from other teams */}
              {otherPlayers.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
                    Outros times
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {otherPlayers.map(({ name, fromTeamCap }, idx) => (
                      <div
                        key={`${name}-${idx}`}
                        onClick={() => movePlayerToTeam(editingId, name)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 12px',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{name}</div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-3)' }}>Time do {fromTeamCap}</div>
                        </div>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>+ MOVER</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px 24px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          {floating.length > 0 && !editingId && (
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--warning)',
              fontWeight: 500, textAlign: 'center', marginBottom: 10,
            }}>
              {floating.length} {floating.length === 1 ? 'jogador sem time' : 'jogadores sem time'} — serão adicionados ao último time ao salvar
            </div>
          )}
          <button
            onClick={handleSave}
            style={{
              width: '100%', height: 52,
              background: 'var(--accent)', border: 'none',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.1em',
              color: '#080808', cursor: 'pointer',
            }}
          >
            SALVAR ALTERAÇÕES
          </button>
        </div>
      </div>
    </div></Portal>
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

export default function WaitingQueue({ teams, teamQueue, waitingTeams, lastWinner, onNext, onAddLatePlayer, onRemoveQueuePlayer, onAdjustTeams }) {
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)

  const completeIds = teamQueue.filter(id => {
    const t = teams.find(t => t.id === id)
    return t && t.complete
  })
  const nextTeamA = teams.find(t => t.id === completeIds[0])
  const nextTeamB = teams.find(t => t.id === completeIds[1])
  const canNext   = completeIds.length >= 2

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
        <LatePlayerInput onAdd={onAddLatePlayer} allPlayers={teams.flatMap(t => t.players)} />

        {/* Adjust teams button */}
        {teams.length > 0 && (
          <button
            onClick={() => setShowAdjustModal(true)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'transparent',
              border: '1px solid rgba(255,149,0,0.3)',
              borderRadius: 'var(--radius)',
              color: 'var(--warning)',
              fontFamily: 'var(--font-display)',
              fontSize: 14,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            ⇅ AJUSTAR TIMES
          </button>
        )}

        {/* Remove player button */}
        {teams.length > 0 && (
          <button
            onClick={() => setShowRemoveModal(true)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'transparent',
              border: '1px solid rgba(255,59,59,0.3)',
              borderRadius: 'var(--radius)',
              color: 'var(--danger)',
              fontFamily: 'var(--font-display)',
              fontSize: 14,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            ✕ REMOVER JOGADOR
          </button>
        )}

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

      {showRemoveModal && (
        <RemovePlayerModal
          teams={teams}
          teamQueue={teamQueue}
          onRemove={onRemoveQueuePlayer}
          onClose={() => setShowRemoveModal(false)}
        />
      )}

      {showAdjustModal && (
        <AdjustTeamsModal
          teams={teams}
          teamQueue={teamQueue}
          onSave={(newQueue, teamsPayload) => {
            onAdjustTeams(newQueue, teamsPayload)
            setShowAdjustModal(false)
          }}
          onClose={() => setShowAdjustModal(false)}
        />
      )}

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
