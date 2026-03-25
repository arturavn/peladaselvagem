// server/routes.js
// All API endpoints for the PeladaSelvagem app

import { Router } from 'express'
import { getState, saveState } from './db.js'
import {
  TEAM_SIZE,
  TEAM_EMOJIS,
  DEFAULT_STATE,
  buildTeams,
  buildTeamsManual,
  fillIncompleteFromLoser,
} from './gameLogic.js'

const router = Router()

/* ── GET /api/state ─────────────────────────────────────── */
router.get('/state', async (req, res) => {
  try {
    const state = await getState()
    res.json({ state })
  } catch (e) {
    console.error('GET /state error:', e)
    res.status(500).json({ error: e.message })
  }
})

/* ── POST /api/actions/add-player ───────────────────────── */
router.post('/actions/add-player', async (req, res) => {
  try {
    const { name } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' })
    }
    const n = name.trim()
    const state = await getState()

    // Case-insensitive duplicate check
    if (state.players.map(p => p.toLowerCase()).includes(n.toLowerCase())) {
      return res.json({ state })
    }

    state.players = [...state.players, n]
    await saveState(state)
    res.json({ state })
  } catch (e) {
    console.error('POST /actions/add-player error:', e)
    res.status(500).json({ error: e.message })
  }
})

/* ── POST /api/actions/remove-player ───────────────────── */
router.post('/actions/remove-player', async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'Name is required' })

    const state = await getState()
    state.players = state.players.filter(p => p !== name)
    await saveState(state)
    res.json({ state })
  } catch (e) {
    console.error('POST /actions/remove-player error:', e)
    res.status(500).json({ error: e.message })
  }
})

/* ── POST /api/actions/sort ─────────────────────────────── */
router.post('/actions/sort', async (req, res) => {
  try {
    const state = await getState()
    const teams = buildTeams(state.players)
    const teamQueue = teams.map(t => t.id)
    state.teams = teams
    state.teamQueue = teamQueue
    state.screen = 'teams'
    state.navDir = 'forward'
    await saveState(state)
    res.json({ state })
  } catch (e) {
    console.error('POST /actions/sort error:', e)
    res.status(500).json({ error: e.message })
  }
})

/* ── POST /api/actions/setup-teams-manual ───────────────── */
router.post('/actions/setup-teams-manual', async (req, res) => {
  try {
    const { teams: teamsData } = req.body
    if (!teamsData || !Array.isArray(teamsData) || teamsData.length < 2) {
      return res.status(400).json({ error: 'At least 2 teams are required' })
    }

    const state = await getState()
    const teams = buildTeamsManual(teamsData)
    const teamQueue = teams.map(t => t.id)

    state.teams = teams
    state.teamQueue = teamQueue
    state.isManualSetup = true
    state.screen = 'teams'
    state.navDir = 'forward'

    await saveState(state)
    res.json({ state })
  } catch (e) {
    console.error('POST /actions/setup-teams-manual error:', e)
    res.status(500).json({ error: e.message })
  }
})

/* ── POST /api/actions/set-initial-teams-order ──────────── */
router.post('/actions/set-initial-teams-order', async (req, res) => {
  try {
    const { pretoId, amareloId } = req.body
    if (!pretoId || !amareloId) {
      return res.status(400).json({ error: 'pretoId and amareloId are required' })
    }

    const state = await getState()
    const rest = state.teamQueue.filter(id => id !== pretoId && id !== amareloId)
    state.teamQueue = [pretoId, amareloId, ...rest]
    state.activeMatch = {
      teamAId: pretoId,
      teamBId: amareloId,
      endTime: null,
      duration: 7,
      isPaused: false,
      pausedRemaining: null,
    }
    state.isManualSetup = false
    state.screen = 'selection'
    state.navDir = 'forward'

    await saveState(state)
    res.json({ state })
  } catch (e) {
    console.error('POST /actions/set-initial-teams-order error:', e)
    res.status(500).json({ error: e.message })
  }
})

/* ── POST /api/actions/start-match ─────────────────────── */
router.post('/actions/start-match', async (req, res) => {
  try {
    const { teamAId, teamBId, duration } = req.body
    if (!teamAId || !teamBId || duration == null) {
      return res.status(400).json({ error: 'teamAId, teamBId, and duration are required' })
    }

    const state = await getState()
    state.activeMatch = {
      teamAId,
      teamBId,
      endTime: Date.now() + duration * 60 * 1000,
      duration,
      isPaused: false,
      pausedRemaining: null,
    }
    state.screen = 'match'
    state.navDir = 'forward'
    await saveState(state)
    res.json({ state })
  } catch (e) {
    console.error('POST /actions/start-match error:', e)
    res.status(500).json({ error: e.message })
  }
})

/* ── POST /api/actions/end-match ────────────────────────── */
router.post('/actions/end-match', async (req, res) => {
  try {
    const state = await getState()
    state.showEndModal = true
    await saveState(state)
    res.json({ state })
  } catch (e) {
    console.error('POST /actions/end-match error:', e)
    res.status(500).json({ error: e.message })
  }
})

/* ── POST /api/actions/select-winner ───────────────────── */
router.post('/actions/select-winner', async (req, res) => {
  try {
    const { winnerTeamId } = req.body
    if (!winnerTeamId) return res.status(400).json({ error: 'winnerTeamId is required' })

    const state = await getState()

    // 1. Increment wins for winner team
    let teams = state.teams.map(t =>
      t.id === winnerTeamId ? { ...t, wins: (t.wins || 0) + 1 } : t
    )

    const { teamAId, teamBId } = state.activeMatch
    // 2. Get loserId
    const loserId = winnerTeamId === teamAId ? teamBId : teamAId

    // 2b. Return substituted players to their original team if loser had subs
    const subs = state.activeMatch.substitutions ?? []
    for (const sub of subs) {
      if (sub.toTeamId === loserId) {
        teams = teams.map(t => {
          if (t.id === loserId) {
            const players = t.players.filter(p => p !== sub.player)
            return { ...t, players, captain: players[0] ?? null, complete: players.length >= TEAM_SIZE }
          }
          if (t.id === sub.fromTeamId) {
            const players = [...t.players, sub.player]
            return { ...t, players, captain: players[0], complete: players.length >= TEAM_SIZE }
          }
          return t
        })
      }
    }

    // 3. Get rest = teamQueue filtered to remove both playing teams
    const rest = state.teamQueue.filter(id => id !== teamAId && id !== teamBId)

    // 4. If rest[0] exists and is incomplete, fill from loser
    if (rest.length > 0) {
      const nextId = rest[0]
      const nextTeam = teams.find(t => t.id === nextId)
      if (nextTeam && nextTeam.players.length < TEAM_SIZE) {
        teams = fillIncompleteFromLoser(teams, nextId, loserId)
      }
    }

    // 5. Remove loser from queue if it has 0 players after transfer
    const loserAfter = teams.find(t => t.id === loserId)
    const loserHasPlayers = loserAfter && loserAfter.players.length > 0

    // 6. Queue rotation
    let newQueue
    if (winnerTeamId === teamAId) {
      // PRETO wins → stays PRETO [0], rest → after, loser → back
      newQueue = [teamAId, ...rest, ...(loserHasPlayers ? [loserId] : [])]
    } else {
      // AMARELO wins → stays AMARELO, next waiting → PRETO, loser → back
      if (rest.length > 0) {
        newQueue = [rest[0], teamBId, ...rest.slice(1), ...(loserHasPlayers ? [loserId] : [])]
      } else {
        // Only 2 teams: loser takes PRETO, winner stays AMARELO
        newQueue = [loserId, teamBId]
      }
    }

    // 7. Update state
    state.teams = teams
    state.teamQueue = newQueue
    state.activeMatch = null
    state.showEndModal = false
    state.lastWinnerId = winnerTeamId
    state.screen = 'queue'
    state.navDir = 'forward'

    await saveState(state)
    res.json({ state })
  } catch (e) {
    console.error('POST /actions/select-winner error:', e)
    res.status(500).json({ error: e.message })
  }
})

/* ── POST /api/actions/resolve-empate ──────────────────── */
router.post('/actions/resolve-empate', async (req, res) => {
  try {
    const { coinTossWinnerId } = req.body
    if (!coinTossWinnerId) return res.status(400).json({ error: 'coinTossWinnerId is required' })

    const state = await getState()

    let teams = [...state.teams]
    const { teamAId, teamBId } = state.activeMatch
    const loserId = coinTossWinnerId === teamAId ? teamBId : teamAId

    // Return substituted players to their original team if loser had subs
    const subs = state.activeMatch.substitutions ?? []
    for (const sub of subs) {
      if (sub.toTeamId === loserId) {
        teams = teams.map(t => {
          if (t.id === loserId) {
            const players = t.players.filter(p => p !== sub.player)
            return { ...t, players, captain: players[0] ?? null, complete: players.length >= TEAM_SIZE }
          }
          if (t.id === sub.fromTeamId) {
            const players = [...t.players, sub.player]
            return { ...t, players, captain: players[0], complete: players.length >= TEAM_SIZE }
          }
          return t
        })
      }
    }

    const rest = state.teamQueue.filter(id => id !== teamAId && id !== teamBId)

    // If next waiting team is incomplete, fill from loser
    if (rest.length > 0) {
      const nextId = rest[0]
      const nextTeam = teams.find(t => t.id === nextId)
      if (nextTeam && nextTeam.players.length < TEAM_SIZE) {
        teams = fillIncompleteFromLoser(teams, nextId, loserId)
      }
    }

    const loserAfter = teams.find(t => t.id === loserId)
    const loserHasPlayers = loserAfter && loserAfter.players.length > 0

    let newQueue
    if (coinTossWinnerId === teamAId) {
      newQueue = [teamAId, ...rest, ...(loserHasPlayers ? [loserId] : [])]
    } else {
      if (rest.length > 0) {
        newQueue = [rest[0], teamBId, ...rest.slice(1), ...(loserHasPlayers ? [loserId] : [])]
      } else {
        newQueue = [loserId, teamBId]
      }
    }

    state.teams = teams
    state.teamQueue = newQueue
    state.activeMatch = null
    state.showEndModal = false
    state.lastWinnerId = null
    state.screen = 'queue'
    state.navDir = 'forward'

    await saveState(state)
    res.json({ state })
  } catch (e) {
    console.error('POST /actions/resolve-empate error:', e)
    res.status(500).json({ error: e.message })
  }
})

/* ── POST /api/actions/remove-match-player ─────────────── */
router.post('/actions/remove-match-player', async (req, res) => {
  try {
    const { playerName, remaining } = req.body
    if (!playerName) return res.status(400).json({ error: 'playerName required' })

    const state = await getState()
    if (!state.activeMatch) return res.status(400).json({ error: 'No active match' })

    const { teamAId, teamBId } = state.activeMatch

    // Find which playing team the player is on
    const playerTeam = state.teams.find(t =>
      (t.id === teamAId || t.id === teamBId) && t.players.includes(playerName)
    )
    if (!playerTeam) return res.status(400).json({ error: 'Player not found in active match' })

    // Remove player from their team (stays in state.players for export)
    const newPlayers = playerTeam.players.filter(p => p !== playerName)
    state.teams = state.teams.map(t => {
      if (t.id !== playerTeam.id) return t
      return { ...t, players: newPlayers, captain: newPlayers[0] ?? null, complete: newPlayers.length >= TEAM_SIZE }
    })

    // Find next player from last waiting team (not currently playing)
    const waitingIds = state.teamQueue.filter(id => id !== teamAId && id !== teamBId)
    let substitution = null

    for (let i = waitingIds.length - 1; i >= 0; i--) {
      const donor = state.teams.find(t => t.id === waitingIds[i])
      if (donor && donor.players.length > 0) {
        const subPlayer = donor.players[donor.players.length - 1]
        const donorNewPlayers = donor.players.filter(p => p !== subPlayer)

        // Remove sub from donor team
        state.teams = state.teams.map(t => {
          if (t.id !== donor.id) return t
          return { ...t, players: donorNewPlayers, captain: donorNewPlayers[0] ?? null, complete: donorNewPlayers.length >= TEAM_SIZE }
        })

        // Add sub to depleted playing team
        const subTeamPlayers = [...newPlayers, subPlayer]
        state.teams = state.teams.map(t => {
          if (t.id !== playerTeam.id) return t
          return { ...t, players: subTeamPlayers, captain: subTeamPlayers[0], complete: subTeamPlayers.length >= TEAM_SIZE }
        })

        // Remove donor if now empty
        if (donorNewPlayers.length === 0) {
          state.teams = state.teams.filter(t => t.id !== donor.id)
          state.teamQueue = state.teamQueue.filter(id => id !== donor.id)
        }

        // Track substitution: sub player's original team
        substitution = { player: subPlayer, fromTeamId: donor.id, toTeamId: playerTeam.id }
        break
      }
    }

    // Pause timer
    state.activeMatch = {
      ...state.activeMatch,
      isPaused: true,
      pausedRemaining: remaining ?? state.activeMatch.pausedRemaining ?? 0,
      endTime: null,
      substitutions: [
        ...(state.activeMatch.substitutions ?? []),
        ...(substitution ? [substitution] : []),
      ],
    }

    await saveState(state)
    res.json({ state })
  } catch (e) {
    console.error('POST /actions/remove-match-player error:', e)
    res.status(500).json({ error: e.message })
  }
})

/* ── POST /api/actions/pause-match ─────────────────────── */
router.post('/actions/pause-match', async (req, res) => {
  try {
    const { pause, remaining } = req.body
    const state = await getState()

    if (!state.activeMatch) {
      return res.status(400).json({ error: 'No active match' })
    }

    if (pause === true) {
      state.activeMatch = {
        ...state.activeMatch,
        isPaused: true,
        pausedRemaining: remaining,
        endTime: null,
      }
    } else {
      state.activeMatch = {
        ...state.activeMatch,
        endTime: Date.now() + state.activeMatch.pausedRemaining,
        isPaused: false,
        pausedRemaining: null,
      }
    }

    await saveState(state)
    res.json({ state })
  } catch (e) {
    console.error('POST /actions/pause-match error:', e)
    res.status(500).json({ error: e.message })
  }
})

/* ── POST /api/actions/remove-queue-player ─────────────── */
router.post('/actions/remove-queue-player', async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'Name is required' })

    const state = await getState()

    // NOTE: keep in state.players (used for export/payment control)

    // Find team containing this player
    const team = state.teams.find(t => t.players.includes(name))
    if (team) {
      const newPlayers = team.players.filter(p => p !== name)
      if (newPlayers.length === 0) {
        // Team empty — remove from teams and queue
        state.teams = state.teams.filter(t => t.id !== team.id)
        state.teamQueue = state.teamQueue.filter(id => id !== team.id)
      } else {
        // Update the team with removed player
        state.teams = state.teams.map(t => {
          if (t.id !== team.id) return t
          return {
            ...t,
            players: newPlayers,
            captain: newPlayers[0],
            complete: newPlayers.length >= TEAM_SIZE,
          }
        })

        // Auto-fill from last team in queue if this team became incomplete
        if (newPlayers.length < TEAM_SIZE) {
          const donorIds = state.teamQueue.filter(id => {
            const t = state.teams.find(t => t.id === id)
            return t && t.players.length > 0 && t.id !== team.id
          })
          if (donorIds.length > 0) {
            const donorId = donorIds[donorIds.length - 1]
            state.teams = fillIncompleteFromLoser(state.teams, team.id, donorId)
            // Remove donor if now empty
            const donorAfter = state.teams.find(t => t.id === donorId)
            if (donorAfter && donorAfter.players.length === 0) {
              state.teams = state.teams.filter(t => t.id !== donorId)
              state.teamQueue = state.teamQueue.filter(id => id !== donorId)
            }
          }
        }
      }
    }

    // Reorganize queue: complete teams first (preserving order), incomplete at end
    const complete = state.teamQueue.filter(id => {
      const t = state.teams.find(t => t.id === id)
      return t && t.complete
    })
    const incomplete = state.teamQueue.filter(id => {
      const t = state.teams.find(t => t.id === id)
      return t && !t.complete
    })
    state.teamQueue = [...complete, ...incomplete]

    await saveState(state)
    res.json({ state })
  } catch (e) {
    console.error('POST /actions/remove-queue-player error:', e)
    res.status(500).json({ error: e.message })
  }
})

/* ── POST /api/actions/add-late-player ─────────────────── */
router.post('/actions/add-late-player', async (req, res) => {
  try {
    const { name } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' })
    }
    const n = name.trim()
    const state = await getState()

    // Add player to global players list if not duplicate
    if (!state.players.map(p => p.toLowerCase()).includes(n.toLowerCase())) {
      state.players = [...state.players, n]
    }

    // Determine playing team IDs
    const playingIds = state.activeMatch
      ? [state.activeMatch.teamAId, state.activeMatch.teamBId]
      : []

    // Find last team in queue that is NOT currently playing
    const waitingQueueIds = state.teamQueue.filter(id => !playingIds.includes(id))
    const lastWaitingId = waitingQueueIds.length > 0
      ? waitingQueueIds[waitingQueueIds.length - 1]
      : null

    const lastWaitingTeam = lastWaitingId
      ? state.teams.find(t => t.id === lastWaitingId)
      : null

    if (lastWaitingTeam && lastWaitingTeam.players.length < TEAM_SIZE) {
      // Add player to the last waiting team
      state.teams = state.teams.map(t => {
        if (t.id === lastWaitingId) {
          const newPlayers = [...t.players, n]
          return {
            ...t,
            players: newPlayers,
            captain: newPlayers[0],
            complete: newPlayers.length >= TEAM_SIZE,
          }
        }
        return t
      })
    } else {
      // Create a new team at the end
      const newIdx = state.teams.length
      const newTeam = {
        id: `team-${newIdx}`,
        emoji: TEAM_EMOJIS[newIdx] ?? '⚽',
        players: [n],
        captain: n,
        complete: false,
        wins: 0,
      }
      state.teams = [...state.teams, newTeam]
      state.teamQueue = [...state.teamQueue, newTeam.id]
    }

    // Reorganize queue: complete teams first, incomplete at end
    const complete = state.teamQueue.filter(id => {
      const t = state.teams.find(t => t.id === id)
      return t && t.complete
    })
    const incomplete = state.teamQueue.filter(id => {
      const t = state.teams.find(t => t.id === id)
      return t && !t.complete
    })
    state.teamQueue = [...complete, ...incomplete]

    await saveState(state)
    res.json({ state })
  } catch (e) {
    console.error('POST /actions/add-late-player error:', e)
    res.status(500).json({ error: e.message })
  }
})

/* ── POST /api/actions/next-match ───────────────────────── */
router.post('/actions/next-match', async (req, res) => {
  try {
    const state = await getState()

    // Only select complete teams for the next match
    const completeIds = state.teamQueue.filter(id => {
      const t = state.teams.find(t => t.id === id)
      return t && t.complete
    })
    const [teamAId, teamBId] = completeIds

    if (!teamAId || !teamBId) {
      return res.status(400).json({ error: 'Not enough complete teams in queue' })
    }

    state.activeMatch = {
      teamAId,
      teamBId,
      endTime: null,
      duration: state.activeMatch?.duration ?? 7,
      isPaused: false,
      pausedRemaining: null,
    }
    state.screen = 'selection'
    state.navDir = 'forward'

    await saveState(state)
    res.json({ state })
  } catch (e) {
    console.error('POST /actions/next-match error:', e)
    res.status(500).json({ error: e.message })
  }
})

/* ── POST /api/actions/navigate ─────────────────────────── */
router.post('/actions/navigate', async (req, res) => {
  try {
    const { screen, navDir } = req.body
    if (!screen) return res.status(400).json({ error: 'screen is required' })

    const state = await getState()
    state.screen = screen
    state.navDir = navDir ?? 'forward'

    await saveState(state)
    res.json({ state })
  } catch (e) {
    console.error('POST /actions/navigate error:', e)
    res.status(500).json({ error: e.message })
  }
})

/* ── POST /api/actions/reset ────────────────────────────── */
router.post('/actions/reset', async (req, res) => {
  try {
    const { DEFAULT_STATE: ds } = await import('./gameLogic.js')
    await saveState({ ...ds })
    res.json({ state: { ...ds } })
  } catch (e) {
    console.error('POST /actions/reset error:', e)
    res.status(500).json({ error: e.message })
  }
})

/* ── GET /api/export ────────────────────────────────────── */
router.get('/export', async (req, res) => {
  try {
    const state = await getState()

    const now = new Date()
    const dd = String(now.getDate()).padStart(2, '0')
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const yyyy = now.getFullYear()
    const dateStr = `${dd}/${mm}/${yyyy}`

    let text = `PELADA SELVAGEM\n`
    text += `Data: ${dateStr}\n`
    text += `Total: ${state.players.length} jogadores\n`
    text += `\n`
    text += `JOGADORES:\n`

    state.players.forEach((name, i) => {
      text += `${i + 1}. ${name}\n`
    })

    if (state.teams.length > 0) {
      text += `\nTIMES:\n`
      state.teams.forEach((team, i) => {
        const captain = team.captain ?? team.players[0] ?? '—'
        const playersStr = team.players.join(', ')
        text += `Time ${i + 1} (${captain} - ${team.wins ?? 0}W): ${playersStr}\n`
      })
    }

    res.json({ text })
  } catch (e) {
    console.error('GET /export error:', e)
    res.status(500).json({ error: e.message })
  }
})

export default router
