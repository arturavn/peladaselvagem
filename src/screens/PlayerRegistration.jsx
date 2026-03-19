import { useState, useRef, useEffect } from 'react'
import Logo from '../components/Logo'
import { MIN_PLAYERS_TO_SORT } from '../App'

/* ── Icons ────────────────────────────────────────────────── */

function IconX() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

function IconSort() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3" width="14" height="2" rx="1" fill="currentColor"/>
      <rect x="4" y="8" width="10" height="2" rx="1" fill="currentColor"/>
      <rect x="6" y="13" width="6" height="2" rx="1" fill="currentColor"/>
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity="0.3">
      <circle cx="16" cy="10" r="5" stroke="#F0F0F0" strokeWidth="1.5"/>
      <path d="M6 26c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#F0F0F0" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function IconExport() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 10v3h10v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 2v7M5 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 5h12M7 5V3.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V5M14 5l-.8 9.2a1 1 0 0 1-1 .8H5.8a1 1 0 0 1-1-.8L4 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* ── Component ───────────────────────────────────────────── */

export default function PlayerRegistration({ players, onAdd, onRemove, onSort, onExport, onReset, hasTeams }) {
  const [input, setInput] = useState('')
  const [exportToast, setExportToast] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const inputRef = useRef(null)
  const canSort = players.length >= MIN_PLAYERS_TO_SORT

  const handleAdd = () => {
    if (!input.trim()) return
    onAdd(input)
    setInput('')
    inputRef.current?.focus()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleAdd()
  }

  const handleExport = async () => {
    if (onExport) {
      await onExport()
      setExportToast(true)
      setTimeout(() => setExportToast(false), 2000)
    }
  }

  // Chip animation key — we track which chips are "new"
  const [newChip, setNewChip] = useState(null)
  const prevCount = useRef(players.length)

  useEffect(() => {
    if (players.length > prevCount.current) {
      setNewChip(players[players.length - 1])
      setTimeout(() => setNewChip(null), 400)
    }
    prevCount.current = players.length
  }, [players])

  const teamsCount = Math.floor(players.length / 5)
  const waitingCount = players.length % 5

  const handleReset = async () => {
    if (onReset) await onReset()
    setShowResetConfirm(false)
  }

  return (
    <div className="screen-content">
      {/* ── Reset Confirmation Modal ── */}
      {showResetConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            width: '100%', maxWidth: 390,
            background: 'var(--surface)',
            borderRadius: '20px 20px 0 0',
            padding: '28px 24px calc(28px + var(--safe-bottom, 0px))',
            display: 'flex', flexDirection: 'column', gap: 20,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                letterSpacing: '0.08em',
                color: '#FF3B3B',
              }}>RESETAR TUDO?</span>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                color: 'var(--text-2)',
                lineHeight: 1.6,
              }}>
                Isso vai apagar todos os jogadores, times e partidas. Não tem como desfazer.
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                className="btn"
                onClick={handleReset}
                style={{
                  height: 52, fontSize: 16, letterSpacing: '0.08em',
                  background: '#FF3B3B', color: '#fff', border: 'none',
                }}
              >
                SIM, RESETAR TUDO
              </button>
              <button
                className="btn"
                onClick={() => setShowResetConfirm(false)}
                style={{
                  height: 48, fontSize: 14, letterSpacing: '0.08em',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-2)',
                }}
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="screen-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo />
        {players.length > 0 && (
          <button
            onClick={() => setShowResetConfirm(true)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              color: 'rgba(255,59,59,0.5)',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#FF3B3B'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,59,59,0.5)'}
            aria-label="Resetar tudo"
          >
            <IconTrash />
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>

        {/* Section: Add player */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span className="section-label">Adicionar jogadores</span>
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

        {/* Section: Player list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="section-label">Escalação</span>
            {players.length > 0 && (
              <div className="counter-badge">
                <span className="num">{players.length}</span>
                {players.length === 1 ? 'jogador' : 'jogadores'}
                {teamsCount > 0 && (
                  <span style={{ color: 'rgba(0,255,135,0.6)', fontSize: 10 }}>
                    · {teamsCount} {teamsCount === 1 ? 'time' : 'times'}
                    {waitingCount > 0 ? ` +${waitingCount}` : ''}
                  </span>
                )}
              </div>
            )}
          </div>

          {players.length === 0 ? (
            <div className="empty-state">
              <IconUser />
              <span style={{ fontWeight: 500, color: 'var(--text-3)' }}>
                Nenhum jogador ainda
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>
                Adicione pelo menos {MIN_PLAYERS_TO_SORT} para sortear os times
              </span>
            </div>
          ) : (
            <div className="chips-grid">
              {players.map((name, i) => (
                <PlayerChip
                  key={name}
                  name={name}
                  isNew={name === newChip}
                  index={i}
                  onRemove={() => onRemove(name)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Teams preview info */}
        {players.length >= MIN_PLAYERS_TO_SORT && (
          <TeamsPreviewInfo count={players.length} />
        )}
      </div>

      {/* ── Footer ── */}
      <div className="bottom-bar">
        {!canSort && (
          <div style={{
            textAlign: 'center',
            marginBottom: 10,
            fontSize: 11,
            color: 'var(--text-3)',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            letterSpacing: '0.04em',
          }}>
            Adicione {MIN_PLAYERS_TO_SORT - players.length} {MIN_PLAYERS_TO_SORT - players.length === 1 ? 'jogador' : 'jogadores'} para sortear
          </div>
        )}

        {/* Export button — shown when teams exist */}
        {hasTeams && (
          <button
            className="btn"
            onClick={handleExport}
            style={{
              height: 44,
              marginBottom: 10,
              fontSize: 14,
              letterSpacing: '0.08em',
              background: 'transparent',
              border: '1px solid rgba(0,255,135,0.25)',
              color: exportToast ? 'var(--accent)' : 'var(--text-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
            }}
          >
            <IconExport />
            {exportToast ? 'COPIADO!' : 'EXPORTAR LISTA'}
          </button>
        )}

        <button
          className="btn btn-primary"
          onClick={onSort}
          disabled={!canSort}
          style={{ height: 56, fontSize: 20, letterSpacing: '0.1em' }}
        >
          <IconSort />
          SORTEAR TIMES
        </button>
      </div>
    </div>
  )
}

/* ── Sub-components ───────────────────────────────────────── */

function PlayerChip({ name, onRemove, isNew }) {
  return (
    <div
      className="chip"
      style={isNew ? { borderColor: 'rgba(0,255,135,0.35)' } : undefined}
    >
      <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
      <button className="chip-remove" onClick={onRemove} aria-label={`Remover ${name}`}>
        <IconX />
      </button>
    </div>
  )
}

function TeamsPreviewInfo({ count }) {
  const full = Math.floor(count / 5)
  const rem  = count % 5

  return (
    <div style={{
      padding: '12px 14px',
      background: 'rgba(0,255,135,0.04)',
      border: '1px solid rgba(0,255,135,0.12)',
      borderRadius: 'var(--radius)',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--accent)',
        opacity: 0.7,
      }}>
        Prévia do sorteio
      </span>
      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--text-2)',
        lineHeight: 1.6,
      }}>
        {full} {full === 1 ? 'time completo' : 'times completos'} de 5
        {rem > 0 && ` · ${rem} ${rem === 1 ? 'jogador' : 'jogadores'} na reserva`}
      </span>
    </div>
  )
}
