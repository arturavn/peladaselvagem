// server/gameLogic.js
// All core game logic extracted from App.jsx

export const TEAM_SIZE = 5
export const MIN_PLAYERS_TO_SORT = 5
export const TEAM_EMOJIS = ['⚫', '🟡', '🔴', '🔵', '⚪', '🟢']

export const DEFAULT_STATE = {
  screen: 'registration',
  navDir: 'forward',
  players: [],
  teams: [],
  teamQueue: [],       // ordered team IDs
  activeMatch: null,   // { teamAId, teamBId, endTime, duration, isPaused, pausedRemaining }
  lastWinnerId: null,
  showEndModal: false,
  isManualSetup: false,
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildTeams(players) {
  const shuffled = shuffle(players)
  const teams = []
  for (let i = 0; i < shuffled.length; i += TEAM_SIZE) {
    const idx = Math.floor(i / TEAM_SIZE)
    if (idx >= TEAM_EMOJIS.length) break
    const teamPlayers = shuffled.slice(i, i + TEAM_SIZE)
    teams.push({
      id: `team-${idx}`,
      emoji: TEAM_EMOJIS[idx],
      players: teamPlayers,
      captain: teamPlayers[0],
      complete: teamPlayers.length === TEAM_SIZE,
      wins: 0,
    })
  }
  return teams
}

export function buildTeamsManual(teamsData) {
  return teamsData.map((teamData, idx) => ({
    id: `team-${idx}`,
    emoji: TEAM_EMOJIS[idx] ?? '⚽',
    players: teamData.players,
    captain: teamData.players[0] ?? null,
    complete: teamData.players.length >= TEAM_SIZE,
    wins: 0,
  }))
}

/* Consolidate fragmented incomplete waiting teams into complete ones.
   Pools all players from incomplete waiting teams and redistributes
   them in queue order: fill teams of TEAM_SIZE first, leftover in last. */
export function consolidateWaitingTeams(teams, teamQueue, playingIds) {
  const waitingIds = teamQueue.filter(id => !playingIds.includes(id))
  const incompleteIds = waitingIds.filter(id => {
    const t = teams.find(t => t.id === id)
    return t && t.players.length > 0 && t.players.length < TEAM_SIZE
  })
  if (incompleteIds.length < 2) return { teams, teamQueue }

  // Pool all players from incomplete waiting teams
  const pool = incompleteIds.flatMap(id => teams.find(t => t.id === id)?.players ?? [])

  // Clear those teams first
  teams = teams.map(t =>
    incompleteIds.includes(t.id) ? { ...t, players: [], captain: null, complete: false } : t
  )

  // Redistribute in queue order: fill TEAM_SIZE each, remainder stays in last
  let remaining = [...pool]
  for (const id of incompleteIds) {
    if (!remaining.length) break
    const players = remaining.splice(0, TEAM_SIZE)
    teams = teams.map(t => t.id !== id ? t : {
      ...t, players, captain: players[0], complete: players.length >= TEAM_SIZE,
    })
  }

  // Remove teams that ended up empty
  const emptyIds = new Set(incompleteIds.filter(id => {
    const t = teams.find(t => t.id === id)
    return !t || t.players.length === 0
  }))
  teams = teams.filter(t => !emptyIds.has(t.id))
  teamQueue = teamQueue.filter(id => !emptyIds.has(id))

  return { teams, teamQueue }
}

/* Transfer players from loser team to fill an incomplete waiting team */
export function fillIncompleteFromLoser(teams, targetId, loserId) {
  const target = teams.find(t => t.id === targetId)
  const loser  = teams.find(t => t.id === loserId)
  if (!target || !loser) return teams

  const shortage = TEAM_SIZE - target.players.length
  if (shortage <= 0) return teams // already full

  const toTransfer = Math.min(shortage, loser.players.length)
  if (toTransfer === 0) return teams

  const transferred   = loser.players.slice(0, toTransfer)
  const loserLeftover = loser.players.slice(toTransfer)

  return teams.map(t => {
    if (t.id === targetId) {
      const p = [...t.players, ...transferred]
      return { ...t, players: p, captain: p[0], complete: p.length >= TEAM_SIZE }
    }
    if (t.id === loserId) {
      return { ...t, players: loserLeftover, captain: loserLeftover[0] ?? t.captain, complete: false }
    }
    return t
  })
}
