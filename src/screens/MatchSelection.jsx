import { useState } from 'react'
import { TEAM_ROLE, getInitials } from '../components/BottomNav'

/* ── Icons ─────────────────────────────────────────────── */

function IconPlay() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 2.5l12 6.5-12 6.5V2.5z" fill="currentColor"/>
    </svg>
  )
}

function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconChevronUp() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 9l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* ── Team Picker Modal ───────────────────────────────────── */

function TeamPickerModal({ allTeams, currentTeamAId, currentTeamBId, onConfirm, onClose }) {
  const [selectedA, setSelectedA] = useState(currentTeamAId)
  const [selectedB, setSelectedB] = useState(currentTeamBId)
  const [pickingSlot, setPickingSlot] = useState(null) // 'a' | 'b' | null

  const getTeam = id => allTeams.find(t => t.id === id)
  const teamA = getTeam(selectedA)
  const teamB = getTeam(selectedB)

  const overlay = {
    position: 'fixed', inset: 0, zIndex: 100,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  }
  const sheet = {
    width: '100%', maxWidth: 390,
    background: 'var(--surface)',
    borderRadius: '20px 20px 0 0',
    maxHeight: '85dvh',
    display: 'flex', flexDirection: 'column',
  }

  const canConfirm = selectedA && selectedB && selectedA !== selectedB

  // Picker list view
  if (pickingSlot) {
    const excludeId = pickingSlot === 'a' ? selectedB : selectedA
    const available = allTeams.filter(t => t.id !== excludeId)
    return (
      <div style={overlay} onClick={() => setPickingSlot(null)}>
        <div style={sheet} onClick={e => e.stopPropagation()}>
          <div style={{
            padding: '16px 20px 12px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          }}>
            <button onClick={() => setPickingSlot(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 18, padding: '4px 8px 4px 0' }}>
              ←
            </button>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.06em', color: 'var(--text)' }}>
                {pickingSlot === 'a' ? '⚫ TIME PRETO' : '🟡 TIME AMARELO'}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                Escolha o time
              </div>
            </div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {available.map(team => {
              const cap = team.captain ?? team.players?.[0] ?? '—'
              const isSelected = (pickingSlot === 'a' ? selectedA : selectedB) === team.id
              return (
                <div
                  key={team.id}
                  onClick={() => {
                    if (pickingSlot === 'a') setSelectedA(team.id)
                    else setSelectedB(team.id)
                    setPickingSlot(null)
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(0,255,135,0.04)' : 'transparent',
                  }}
                >
                  <div style={{
                    width: 44, height: 44,
                    background: 'var(--bg)', border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: isSelected ? 'var(--accent)' : 'var(--text-2)', letterSpacing: '0.04em' }}>
                      {cap.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, letterSpacing: '0.04em', color: 'var(--text)' }}>
                      {cap.toUpperCase()}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                      {team.players.length} jog. · {team.wins ?? 0}W
                      {!team.complete && <span style={{ color: 'var(--warning)', marginLeft: 6 }}>incompleto</span>}
                    </div>
                  </div>
                  {isSelected && <span style={{ color: 'var(--accent)', fontSize: 16 }}>✓</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Main view: show both slots
  return (
    <div style={overlay} onClick={onClose}>
      <div style={sheet} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px 20px 12px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.06em', color: 'var(--text)' }}>
            TROCAR TIMES
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 20, padding: 4 }}>✕</button>
        </div>

        {/* Slots */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { slot: 'a', label: '⚫ TIME PRETO', team: teamA, accent: '#AAAAAA' },
            { slot: 'b', label: '🟡 TIME AMARELO', team: teamB, accent: '#F5C400' },
          ].map(({ slot, label, team, accent }) => {
            const cap = team?.captain ?? team?.players?.[0] ?? '—'
            return (
              <div
                key={slot}
                onClick={() => setPickingSlot(slot)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: accent, marginBottom: 3 }}>
                    {label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.04em', color: 'var(--text)' }}>
                    {cap.toUpperCase()}
                  </div>
                  {team && (
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
                      {team.players.length} jog. · {team.wins ?? 0}W
                    </div>
                  )}
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.08em' }}>
                  TROCAR ›
                </span>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '0 20px 28px', flexShrink: 0 }}>
          <button
            onClick={() => canConfirm && onConfirm(selectedA, selectedB)}
            disabled={!canConfirm}
            style={{
              width: '100%', height: 52,
              background: canConfirm ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
              border: 'none', borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.1em',
              color: canConfirm ? '#080808' : 'var(--text-3)',
              cursor: canConfirm ? 'pointer' : 'not-allowed',
            }}
          >
            CONFIRMAR TIMES
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── TeamCard (PRETO or AMARELO slot) ────────────────────── */

function TeamCard({ role, team, isExpanded, onToggle }) {
  const r = TEAM_ROLE[role]
  const initials = team ? getInitials(team.captain ?? team.players?.[0] ?? '') : '?'
  const captainName = team?.captain ?? team?.players?.[0] ?? '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Main card header */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          background: r.cardBg,
          border: `1px solid ${isExpanded ? r.borderLeft : 'rgba(255,255,255,0.06)'}`,
          borderLeft: `4px solid ${r.borderLeft}`,
          borderRadius: isExpanded ? 'var(--radius) var(--radius) 0 0' : 'var(--radius)',
          padding: '14px 16px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          userSelect: 'none',
          boxShadow: isExpanded
            ? role === 'amarelo'
              ? '0 0 20px rgba(245,196,0,0.1)'
              : '0 0 16px rgba(255,255,255,0.04)'
            : 'none',
        }}
      >
        {/* Shield */}
        <div style={{
          width: 52,
          height: 52,
          background: r.shieldBg,
          border: `1.5px solid ${r.shieldBorder}`,
          borderRadius: 'var(--radius)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 19,
            color: r.shieldText,
            letterSpacing: '0.04em',
            lineHeight: 1,
          }}>
            {initials}
          </span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: r.accent,
            marginBottom: 3,
          }}>
            {r.label}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            letterSpacing: '0.04em',
            color: '#F0F0F0',
            lineHeight: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {captainName.toUpperCase()}
          </div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: 11,
            color: 'var(--text-3)',
            fontWeight: 500,
            marginTop: 3,
          }}>
            Status: <span style={{ color: role === 'preto' ? '#888' : r.accent }}>{r.status}</span>
            {team && <span style={{ marginLeft: 8, color: 'var(--text-3)' }}>· {team.players.length} jog.</span>}
          </div>
        </div>

        {/* Chevron */}
        <div style={{ color: isExpanded ? r.accent : 'var(--text-3)', transition: 'color 0.2s' }}>
          {isExpanded ? <IconChevronUp /> : <IconChevronDown />}
        </div>
      </div>

      {/* Expanded: full player list */}
      {isExpanded && team && (
        <div style={{
          background: 'rgba(0,0,0,0.4)',
          border: `1px solid ${r.borderLeft}`,
          borderTop: 'none',
          borderRadius: '0 0 var(--radius) var(--radius)',
          padding: '12px 16px',
        }}>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--text-3)',
            marginBottom: 8,
          }}>
            Elenco
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {team.players.map((name, i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 10,
                  color: 'var(--text-3)',
                  width: 14,
                  textAlign: 'right',
                  flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: i === 0 ? 600 : 400,
                  color: i === 0 ? (role === 'amarelo' ? '#F5C400' : '#F0F0F0') : 'var(--text-2)',
                }}>
                  {name}
                </span>
                {i === 0 && (
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 8,
                    fontWeight: 700,
                    color: r.accent,
                    letterSpacing: '0.1em',
                    opacity: 0.8,
                    textTransform: 'uppercase',
                  }}>
                    CAP
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main Component ─────────────────────────────────────── */

export default function MatchSelection({
  teams,
  defaultTeamAId,
  defaultTeamBId,
  defaultDuration,
  onStart,
}) {
  const [teamAId, setTeamAId] = useState(defaultTeamAId)
  const [teamBId, setTeamBId] = useState(defaultTeamBId)
  const [duration, setDuration] = useState(defaultDuration ?? 7)
  const [expandedSlot, setExpandedSlot] = useState(null) // 'a' | 'b' | null
  const [showPickerModal, setShowPickerModal] = useState(false)

  const getTeam = id => teams.find(t => t.id === id)
  const teamA = getTeam(teamAId)
  const teamB = getTeam(teamBId)
  const canStart = teamAId && teamBId && teamAId !== teamBId

  const handleToggle = (slot) => {
    setExpandedSlot(prev => prev === slot ? null : slot)
  }

  const handleConfirmSwap = (newAId, newBId) => {
    setTeamAId(newAId)
    setTeamBId(newBId)
    setShowPickerModal(false)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      paddingBottom: 'calc(80px + var(--safe-bottom))',
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: 'calc(var(--safe-top) + 20px) 20px 0',
      }}>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--text-3)',
          marginBottom: 4,
        }}>
          Próximo confronto
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 32,
          letterSpacing: '0.06em',
          lineHeight: 1,
          color: 'var(--text)',
          marginBottom: 4,
        }}>
          SELEÇÃO DE
          <br />
          PARTIDA
        </div>
        <div style={{
          width: 32,
          height: 2,
          background: 'var(--accent)',
          borderRadius: 1,
          marginTop: 8,
          marginBottom: 24,
        }} />
      </div>

      {/* ── Team slots ── */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <TeamCard
          role="preto"
          team={teamA}
          isExpanded={expandedSlot === 'a'}
          onToggle={() => handleToggle('a')}
        />

        {/* VS divider */}
        {expandedSlot === null && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 8px',
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.04)' }} />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 12,
              color: 'var(--text-3)',
              letterSpacing: '0.12em',
            }}>
              VS
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.04)' }} />
          </div>
        )}

        <TeamCard
          role="amarelo"
          team={teamB}
          isExpanded={expandedSlot === 'b'}
          onToggle={() => handleToggle('b')}
        />

        {/* Trocar times button */}
        {expandedSlot === null && (
          <button
            onClick={() => setShowPickerModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              height: 44,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              letterSpacing: '0.1em',
              color: 'var(--text-3)',
              cursor: 'pointer',
              marginTop: 4,
            }}
          >
            ⇄ TROCAR TIMES
          </button>
        )}
      </div>

      {/* ── Duration ── */}
      {expandedSlot === null && (
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--text-3)',
            marginBottom: 10,
          }}>
            Duração da partida
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { value: 0.5, display: '30', unit: 'SEG', test: true },
              { value: 7,   display: '7',  unit: 'MIN', test: false },
              { value: 8,   display: '8',  unit: 'MIN', test: false },
            ].map(opt => {
              const isActive = duration === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  style={{
                    flex: 1,
                    height: 64,
                    background: isActive ? 'rgba(0,255,135,0.08)' : 'var(--surface)',
                    border: `1.5px solid ${isActive ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    boxShadow: isActive ? 'var(--glow-sm)' : 'none',
                    transition: 'all 0.18s ease',
                    position: 'relative',
                  }}
                >
                  {opt.test && (
                    <span style={{
                      position: 'absolute',
                      top: 4,
                      right: 6,
                      fontFamily: 'var(--font-body)',
                      fontSize: 7,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: isActive ? 'var(--accent)' : 'var(--text-3)',
                      textTransform: 'uppercase',
                      opacity: 0.7,
                    }}>
                      TEST
                    </span>
                  )}
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 28,
                    color: isActive ? 'var(--accent)' : 'var(--text)',
                    lineHeight: 1,
                  }}>
                    {opt.display}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--text-3)',
                  }}>
                    {opt.unit}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Spacer — pushes button to bottom when content is short */}
      <div style={{ flex: 1 }} />

      {/* ── Start button — natural flow, always below all content ── */}
      <div style={{ padding: '16px 20px' }}>
        <button
          onClick={() => canStart && onStart(teamAId, teamBId, duration)}
          disabled={!canStart}
          style={{
            width: '100%',
            height: 56,
            background: canStart ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
            border: 'none',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            letterSpacing: '0.1em',
            color: canStart ? '#080808' : 'var(--text-3)',
            cursor: canStart ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            boxShadow: canStart ? 'var(--glow-sm)' : 'none',
          }}
        >
          <IconPlay />
          INICIAR PARTIDA
        </button>
      </div>

      {/* Team picker modal */}
      {showPickerModal && (
        <TeamPickerModal
          allTeams={teams}
          currentTeamAId={teamAId}
          currentTeamBId={teamBId}
          onConfirm={handleConfirmSwap}
          onClose={() => setShowPickerModal(false)}
        />
      )}
    </div>
  )
}
