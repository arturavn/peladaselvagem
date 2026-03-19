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
