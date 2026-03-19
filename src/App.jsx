import { useState, useEffect, useCallback } from 'react'
import PlayerRegistration from './screens/PlayerRegistration'
import TeamsDraw from './screens/TeamsDraw'
import MatchSelection from './screens/MatchSelection'
import MatchInProgress from './screens/MatchInProgress'
import WaitingQueue from './screens/WaitingQueue'
import MatchEndModal from './components/MatchEndModal'
import BottomNav from './components/BottomNav'
import { api } from './api'

/* ── Constants (still needed for MIN_PLAYERS_TO_SORT export) ── */
export const MIN_PLAYERS_TO_SORT = 5

/* ── Default state for initial render before API responds ── */
const DEFAULT_STATE = {
  screen: 'registration',
  navDir: 'forward',
  players: [],
  teams: [],
  teamQueue: [],
  activeMatch: null,
  lastWinnerId: null,
  showEndModal: false,
}

/* ── App ─────────────────────────────────────────────────── */

export default function App() {
  const [state, setState] = useState(DEFAULT_STATE)
  const [loading, setLoading] = useState(true)

  // On mount: fetch state from API
  useEffect(() => {
    api.getState()
      .then(data => {
        setState(data.state)
        setLoading(false)
      })
      .catch(e => {
        console.error('Failed to load state:', e)
        setLoading(false)
      })
  }, [])

  /* Navigation */
  const go = useCallback(async (screen, dir = 'forward') => {
    try {
      const data = await api.navigate(screen, dir)
      setState(data.state)
    } catch (e) {
      console.error('navigate error:', e)
      // Fallback: update locally
      setState(s => ({ ...s, screen, navDir: dir }))
    }
  }, [])

  /* Player registration */
  const addPlayer = useCallback(async (name) => {
    try {
      const data = await api.addPlayer(name)
      setState(data.state)
    } catch (e) { console.error('addPlayer error:', e) }
  }, [])

  const removePlayer = useCallback(async (name) => {
    try {
      const data = await api.removePlayer(name)
      setState(data.state)
    } catch (e) { console.error('removePlayer error:', e) }
  }, [])

  /* Team sorting */
  const sortTeams = useCallback(async () => {
    try {
      const data = await api.sortTeams()
      setState(data.state)
    } catch (e) { console.error('sortTeams error:', e) }
  }, [])

  /* Start a match */
  const startMatch = useCallback(async (teamAId, teamBId, duration) => {
    try {
      const data = await api.startMatch(teamAId, teamBId, duration)
      setState(data.state)
    } catch (e) { console.error('startMatch error:', e) }
  }, [])

  /* Trigger end modal */
  const endMatch = useCallback(async () => {
    try {
      const data = await api.endMatch()
      setState(data.state)
    } catch (e) { console.error('endMatch error:', e) }
  }, [])

  /* Select winner */
  const selectWinner = useCallback(async (winnerTeamId) => {
    try {
      const data = await api.selectWinner(winnerTeamId)
      setState(data.state)
    } catch (e) { console.error('selectWinner error:', e) }
  }, [])

  /* Resolve empate */
  const resolveEmpate = useCallback(async (coinTossWinnerId) => {
    try {
      const data = await api.resolveEmpate(coinTossWinnerId)
      setState(data.state)
    } catch (e) { console.error('resolveEmpate error:', e) }
  }, [])

  /* Pause match */
  const pauseMatch = useCallback(async (remaining) => {
    try {
      const data = await api.pauseMatch(true, remaining)
      setState(data.state)
    } catch (e) { console.error('pauseMatch error:', e) }
  }, [])

  /* Resume match */
  const resumeMatch = useCallback(async () => {
    try {
      const data = await api.pauseMatch(false, null)
      setState(data.state)
    } catch (e) { console.error('resumeMatch error:', e) }
  }, [])

  /* Add late player */
  const addLatePlayer = useCallback(async (name) => {
    try {
      const data = await api.addLatePlayer(name)
      setState(data.state)
    } catch (e) { console.error('addLatePlayer error:', e) }
  }, [])

  /* Start next match from queue */
  const startNextMatch = useCallback(async () => {
    try {
      const data = await api.nextMatch()
      setState(data.state)
    } catch (e) { console.error('startNextMatch error:', e) }
  }, [])

  /* Reset everything */
  const handleReset = useCallback(async () => {
    try {
      const data = await api.reset()
      setState(data.state)
    } catch (e) { console.error('reset error:', e) }
  }, [])

  /* Export */
  const handleExport = useCallback(async () => {
    try {
      const data = await api.getExport()
      await navigator.clipboard.writeText(data.text)
    } catch (e) { console.error('export error:', e) }
  }, [])

  /* Derived */
  const getTeam = (id) => state.teams.find(t => t.id === id)

  const playingIds = state.activeMatch
    ? [state.activeMatch.teamAId, state.activeMatch.teamBId]
    : state.teamQueue.slice(0, 2)

  const waitingTeams = state.teamQueue
    .filter(id => !playingIds.includes(id))
    .map(getTeam)
    .filter(Boolean)

  const defaultTeamAId = state.teamQueue[0] ?? null
  const defaultTeamBId = state.teamQueue[1] ?? null

  /* Active match teams for passing to screens */
  const matchTeamA = state.activeMatch ? getTeam(state.activeMatch.teamAId) : null
  const matchTeamB = state.activeMatch ? getTeam(state.activeMatch.teamBId) : null

  /* Screen key for slide animation */
  const screenKey = `${state.screen}-${state.navDir}`

  /* BottomNav availability */
  const hasTeams = state.teams.length > 0
  const hasHistory = !!state.lastWinnerId

  /* Hide bottom nav during active match (full-screen experience) */
  const showBottomNav = state.screen !== 'match'

  /* Loading screen */
  if (loading) {
    return (
      <div className="app-shell" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}>
          <span style={{
            fontSize: 32,
            animation: 'timerPulse 1s ease-in-out infinite',
          }}>
            ⚽
          </span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 14,
            letterSpacing: '0.18em',
            color: 'var(--text-3)',
            textTransform: 'uppercase',
          }}>
            Carregando...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div
        key={screenKey}
        className={`screen ${state.navDir === 'back' ? 'slide-from-left' : 'slide-from-right'}`}
      >
        {state.screen === 'registration' && (
          <PlayerRegistration
            players={state.players}
            onAdd={addPlayer}
            onRemove={removePlayer}
            onSort={sortTeams}
            onExport={handleExport}
            onReset={handleReset}
            hasTeams={hasTeams}
          />
        )}

        {state.screen === 'teams' && (
          <TeamsDraw
            teams={state.teams}
            onContinue={() => go('selection')}
            onBack={() => go('registration', 'back')}
          />
        )}

        {state.screen === 'selection' && (
          <MatchSelection
            teams={state.teams}
            defaultTeamAId={
              state.activeMatch?.teamAId ?? defaultTeamAId
            }
            defaultTeamBId={
              state.activeMatch?.teamBId ?? defaultTeamBId
            }
            defaultDuration={state.activeMatch?.duration ?? 7}
            onStart={startMatch}
          />
        )}

        {state.screen === 'match' && state.activeMatch && (
          <MatchInProgress
            endTime={state.activeMatch.endTime}
            duration={state.activeMatch.duration}
            isPaused={state.activeMatch.isPaused ?? false}
            pausedRemaining={state.activeMatch.pausedRemaining}
            teamA={matchTeamA}
            teamB={matchTeamB}
            onEnd={endMatch}
            onPause={pauseMatch}
            onResume={resumeMatch}
          />
        )}

        {state.screen === 'queue' && (
          <WaitingQueue
            teams={state.teams}
            teamQueue={state.teamQueue}
            waitingTeams={waitingTeams}
            lastWinner={getTeam(state.lastWinnerId)}
            onNext={startNextMatch}
            onAddLatePlayer={addLatePlayer}
          />
        )}
      </div>

      {/* Bottom navigation — hidden during match */}
      {showBottomNav && (
        <BottomNav
          screen={state.screen}
          hasTeams={hasTeams}
          hasHistory={hasHistory}
          onNavigate={go}
        />
      )}

      {state.showEndModal && (
        <MatchEndModal
          teamA={matchTeamA}
          teamB={matchTeamB}
          onSelect={selectWinner}
          onEmpate={resolveEmpate}
        />
      )}
    </div>
  )
}
