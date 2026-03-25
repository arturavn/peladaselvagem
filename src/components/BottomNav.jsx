import { useState, useEffect } from 'react'

/* ── Mini timer hook ─────────────────────────────────────── */
function useMiniTimer(activeMatch) {
  const [ms, setMs] = useState(0)
  useEffect(() => {
    if (!activeMatch) { setMs(0); return }
    const update = () => {
      if (activeMatch.isPaused) {
        setMs(activeMatch.pausedRemaining ?? 0)
      } else {
        setMs(Math.max(0, (activeMatch.endTime ?? 0) - Date.now()))
      }
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [activeMatch])
  return ms
}

/* ── Bottom Navigation ───────────────────────────────────── */

function IconHome({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M3 8.5L10 2l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V8.5z"
        stroke={active ? '#00FF87' : '#555'}
        strokeWidth="1.5"
        fill={active ? 'rgba(0,255,135,0.1)' : 'none'}
        strokeLinejoin="round"
      />
      <path d="M7.5 18V12h5v6" stroke={active ? '#00FF87' : '#555'} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

function IconDraws({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="7" cy="7" r="3" stroke={active ? '#00FF87' : '#555'} strokeWidth="1.5"/>
      <circle cx="14" cy="7" r="3" stroke={active ? '#00FF87' : '#555'} strokeWidth="1.5"/>
      <path d="M2 17c0-2.76 2.24-5 5-5h6c2.76 0 5 2.24 5 5" stroke={active ? '#00FF87' : '#555'} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function IconMatch({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke={active ? '#00FF87' : '#555'} strokeWidth="1.5"/>
      <path d="M10 4.5l1.8 3.6 4 .58-2.9 2.83.68 3.99L10 13.3l-3.58 1.88.69-4L4.2 8.68l4-.58L10 4.5z"
        fill={active ? '#00FF87' : '#555'} opacity={active ? 1 : 0.6}/>
    </svg>
  )
}

function IconWaitlist({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="4" y="2" width="12" height="16" rx="2" stroke={active ? '#00FF87' : '#555'} strokeWidth="1.5"/>
      <path d="M7 7h6M7 10h6M7 13h4" stroke={active ? '#00FF87' : '#555'} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

/* ── Shared color helper ─────────────────────────────────── */
export const TEAM_ROLE = {
  preto: {
    label: 'TIME PRETO',
    status: 'PRONTO',
    borderLeft: '#444444',
    accent: '#AAAAAA',
    shieldBg: '#1E1E1E',
    shieldBorder: '#3A3A3A',
    shieldText: '#F0F0F0',
    cardBg: 'rgba(255,255,255,0.02)',
  },
  amarelo: {
    label: 'TIME AMARELO',
    status: 'AGUARDANDO',
    borderLeft: '#F5C400',
    accent: '#F5C400',
    shieldBg: 'rgba(245,196,0,0.12)',
    shieldBorder: 'rgba(245,196,0,0.4)',
    shieldText: '#F5C400',
    cardBg: 'rgba(245,196,0,0.03)',
  },
}

export function getInitials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return '??'
}

/* ── Component ─────────────────────────────────────────── */

export default function BottomNav({ screen, hasTeams, hasHistory, activeMatch, onNavigate }) {
  const remainingMs = useMiniTimer(activeMatch)
  const mins = Math.floor(remainingMs / 60000)
  const secs = Math.floor((remainingMs % 60000) / 1000)
  const timerStr = `${mins}:${String(secs).padStart(2, '0')}`
  const timerRunning = activeMatch && !activeMatch.isPaused

  const activeTab =
    screen === 'match' || screen === 'selection' ? 'match'
    : screen === 'teams' ? 'draws'
    : screen === 'queue' ? 'waitlist'
    : screen === 'manual-setup' ? 'home'
    : 'home'

  const matchTarget = activeMatch ? 'match' : 'selection'

  const tabs = [
    { id: 'home',     targetScreen: 'registration', label: 'HOME',     Icon: IconHome,     available: true },
    { id: 'draws',    targetScreen: 'teams',         label: 'DRAWS',    Icon: IconDraws,    available: hasTeams },
    { id: 'match',    targetScreen: matchTarget,     label: 'MATCH',    Icon: IconMatch,    available: hasTeams },
    { id: 'waitlist', targetScreen: 'queue',          label: 'WAITLIST', Icon: IconWaitlist, available: hasHistory },
  ]

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id
        const isDisabled = !tab.available
        const isMatchTab = tab.id === 'match'
        const showTimer = isMatchTab && activeMatch

        return (
          <button
            key={tab.id}
            className={`bnav-tab${isActive ? ' bnav-active' : ''}${isDisabled ? ' bnav-disabled' : ''}`}
            onClick={() => !isDisabled && onNavigate(tab.targetScreen)}
          >
            {showTimer ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 13,
                  letterSpacing: '0.05em',
                  color: timerRunning ? 'var(--accent)' : '#888',
                  lineHeight: 1,
                  animation: timerRunning ? 'timerPulse 2s ease-in-out infinite' : 'none',
                }}>
                  {timerStr}
                </span>
                <tab.Icon active={isActive} />
              </div>
            ) : (
              <div className="bnav-icon">
                <tab.Icon active={isActive} />
              </div>
            )}
            <span className="bnav-label">{tab.label}</span>
            {isActive && <div className="bnav-dot" />}
          </button>
        )
      })}
    </nav>
  )
}
