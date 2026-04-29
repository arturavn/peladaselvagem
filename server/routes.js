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
  consolidateWaitingTeams,
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

    // 2b. Handle substitutions based on outcome:
    //   • Sub won  → earned their spot, stays with winner (no change)
    //   • Sub lost → removed from loser, goes to front of original team (first in line)
    //     If original team is already full (a "continues" player filled the gap), the
    //     last player of that team is displaced back to the loser team.
    const subs = state.activeMatch.substitutions ?? []
    for (const sub of subs) {
      if (sub.toTeamId !== loserId) continue  // sub is on winning team → keep them there

      let overflowPlayer = null
      teams = teams.map(t => {
        if (t.id === loserId) {
          const players = t.players.filter(p => p !== sub.player)
          return { ...t, players, captain: players[0] ?? null, complete: players.length >= TEAM_SIZE }
        }
        if (t.id === sub.fromTeamId) {
          const players = [sub.player, ...t.players]
          if (players.length > TEAM_SIZE) {
            // Original team was filled while sub was playing — displace the last player
            overflowPlayer = players[players.length - 1]
            return { ...t, players: players.slice(0, TEAM_SIZE), captain: players[0], complete: true }
          }
          return { ...t, players, captain: players[0], complete: players.length >= TEAM_SIZE }
        }
        return t
      })

      // Displaced player goes to loser team (going to back of queue anyway)
      if (overflowPlayer) {
        teams = teams.map(t => {
          if (t.id !== loserId) return t
          const players = [...t.players, overflowPlayer]
          return { ...t, players, captain: players[0], complete: players.length >= TEAM_SIZE }
        })
      }

      // If fromTeam was deleted (emptied during match), add sub to first incomplete waiting team
      if (!teams.find(t => t.id === sub.fromTeamId)) {
        const playingIds2 = [teamAId, teamBId]
        const firstIncompleteWaiting = state.teamQueue
          .filter(id => !playingIds2.includes(id))
          .find(id => { const t = teams.find(t => t.id === id); return t && t.players.length < TEAM_SIZE })
        if (firstIncompleteWaiting) {
          teams = teams.map(t => {
            if (t.id !== firstIncompleteWaiting) return t
            const players = [sub.player, ...t.players]
            return { ...t, players, captain: players[0], complete: players.length >= TEAM_SIZE }
          })
        }
      }
    }

    // 3. Get rest in original queue order — no resorting, no redistribution from loser
    const restRaw = state.teamQueue.filter(id => id !== teamAId && id !== teamBId)
    const rest = [...restRaw]

    // 4. Loser goes to back of queue as-is; waiting teams stay in their original order
    const loserAfter = teams.find(t => t.id === loserId)
    const loserHasPlayers = loserAfter && loserAfter.players.length > 0

    // 5. Queue rotation
    let newQueue
    if (winnerTeamId === teamAId) {
      // PRETO wins → stays PRETO [0], rest in order, loser → back
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

    // 6. Spreadsheet rotation: fill the last incomplete team (not winner, not loser) from loser.
    //    Loser's first N players complete the tail; remaining loser players become new tail.
    const lastIncompleteId = [...newQueue].reverse().find(id => {
      if (id === loserId) return false
      if (id === winnerTeamId) return false
      const t = teams.find(t => t.id === id)
      return t && t.players.length > 0 && t.players.length < TEAM_SIZE
    })
    if (lastIncompleteId) {
      teams = fillIncompleteFromLoser(teams, lastIncompleteId, loserId)
      // If loser was fully consumed by the fill, remove it from queue
      const loserNow = teams.find(t => t.id === loserId)
      if (!loserNow || loserNow.players.length === 0) {
        teams = teams.filter(t => t.id !== loserId)
        newQueue = newQueue.filter(id => id !== loserId)
      }
    }

    // 7. Consolidate any remaining fragmented incomplete waiting teams
    const consolidatedW = consolidateWaitingTeams(teams, newQueue, [newQueue[0], newQueue[1], loserId].filter(Boolean))
    teams = consolidatedW.teams
    newQueue = consolidatedW.teamQueue

    // 8. Update state
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

    // Handle substitutions based on outcome:
    //   • Sub won  → earned their spot, stays with coin-toss winner (no change)
    //   • Sub lost → removed from loser, goes to front of original team (first in line)
    //     If original team is already full, displace the last player to the loser team.
    const subs = state.activeMatch.substitutions ?? []
    for (const sub of subs) {
      if (sub.toTeamId !== loserId) continue  // sub is on winning team → keep them there

      let overflowPlayer = null
      teams = teams.map(t => {
        if (t.id === loserId) {
          const players = t.players.filter(p => p !== sub.player)
          return { ...t, players, captain: players[0] ?? null, complete: players.length >= TEAM_SIZE }
        }
        if (t.id === sub.fromTeamId) {
          const players = [sub.player, ...t.players]
          if (players.length > TEAM_SIZE) {
            overflowPlayer = players[players.length - 1]
            return { ...t, players: players.slice(0, TEAM_SIZE), captain: players[0], complete: true }
          }
          return { ...t, players, captain: players[0], complete: players.length >= TEAM_SIZE }
        }
        return t
      })

      if (overflowPlayer) {
        teams = teams.map(t => {
          if (t.id !== loserId) return t
          const players = [...t.players, overflowPlayer]
          return { ...t, players, captain: players[0], complete: players.length >= TEAM_SIZE }
        })
      }

      if (!teams.find(t => t.id === sub.fromTeamId)) {
        const playingIds2 = [teamAId, teamBId]
        const firstIncompleteWaiting = state.teamQueue
          .filter(id => !playingIds2.includes(id))
          .find(id => { const t = teams.find(t => t.id === id); return t && t.players.length < TEAM_SIZE })
        if (firstIncompleteWaiting) {
          teams = teams.map(t => {
            if (t.id !== firstIncompleteWaiting) return t
            const players = [sub.player, ...t.players]
            return { ...t, players, captain: players[0], complete: players.length >= TEAM_SIZE }
          })
        }
      }
    }

    const restRaw = state.teamQueue.filter(id => id !== teamAId && id !== teamBId)
    const rest = [...restRaw]

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

    // Spreadsheet rotation: fill last incomplete team (not winner, not loser) from loser
    const lastIncompleteIdE = [...newQueue].reverse().find(id => {
      if (id === loserId) return false
      if (id === coinTossWinnerId) return false
      const t = teams.find(t => t.id === id)
      return t && t.players.length > 0 && t.players.length < TEAM_SIZE
    })
    if (lastIncompleteIdE) {
      teams = fillIncompleteFromLoser(teams, lastIncompleteIdE, loserId)
      const loserNowE = teams.find(t => t.id === loserId)
      if (!loserNowE || loserNowE.players.length === 0) {
        teams = teams.filter(t => t.id !== loserId)
        newQueue = newQueue.filter(id => id !== loserId)
      }
    }

    // Consolidate any remaining fragmented incomplete waiting teams
    const consolidatedE = consolidateWaitingTeams(teams, newQueue, [newQueue[0], newQueue[1], loserId].filter(Boolean))
    teams = consolidatedE.teams
    newQueue = consolidatedE.teamQueue

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

/* ── POST /api/actions/resolve-empate-swap ─────────────── */
// Called when empate AND 2+ complete teams are waiting:
// both playing teams leave, coin-toss winner gets queue priority.
router.post('/actions/resolve-empate-swap', async (req, res) => {
  try {
    const { priorityTeamId } = req.body
    const state = await getState()
    const { teamAId, teamBId } = state.activeMatch

    let teams = [...state.teams]

    // Return all subs to their original teams (both teams are going back).
    // If original team is already full, displace the last player to the team the sub was on.
    const subs = state.activeMatch.substitutions ?? []
    for (const sub of subs) {
      let overflowPlayer = null
      teams = teams.map(t => {
        if (t.id === sub.toTeamId) {
          const players = t.players.filter(p => p !== sub.player)
          return { ...t, players, captain: players[0] ?? null, complete: players.length >= TEAM_SIZE }
        }
        if (t.id === sub.fromTeamId) {
          const players = [sub.player, ...t.players]
          if (players.length > TEAM_SIZE) {
            overflowPlayer = players[players.length - 1]
            return { ...t, players: players.slice(0, TEAM_SIZE), captain: players[0], complete: true }
          }
          return { ...t, players, captain: players[0], complete: players.length >= TEAM_SIZE }
        }
        return t
      })

      if (overflowPlayer) {
        teams = teams.map(t => {
          if (t.id !== sub.toTeamId) return t
          const players = [...t.players, overflowPlayer]
          return { ...t, players, captain: players[0], complete: players.length >= TEAM_SIZE }
        })
      }
    }

    // Waiting teams in original queue order (no re-sort)
    const rest = state.teamQueue.filter(id => id !== teamAId && id !== teamBId)

    // Coin-toss winner gets queue priority over the loser
    const otherId = priorityTeamId === teamAId ? teamBId : teamAId
    const priorityAfter = teams.find(t => t.id === priorityTeamId)
    const otherAfter    = teams.find(t => t.id === otherId)

    let newQueue = [
      ...rest,
      ...(priorityAfter?.players?.length > 0 ? [priorityTeamId] : []),
      ...(otherAfter?.players?.length > 0    ? [otherId]         : []),
    ]

    // Consolidate fragmented incomplete waiting teams
    const consolidatedS = consolidateWaitingTeams(teams, newQueue, [newQueue[0], newQueue[1]].filter(Boolean))
    teams = consolidatedS.teams
    newQueue = consolidatedS.teamQueue

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
    console.error('POST /actions/resolve-empate-swap error:', e)
    res.status(500).json({ error: e.message })
  }
})

/* ── POST /api/actions/remove-match-player ─────────────── */
router.post('/actions/remove-match-player', async (req, res) => {
  try {
    const { playerName, remaining, continues } = req.body
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

    // Find next player from first waiting team (not currently playing)
    const waitingIds = state.teamQueue.filter(id => id !== teamAId && id !== teamBId)
    let substitution = null

    for (let i = 0; i < waitingIds.length; i++) {
      const donor = state.teams.find(t => t.id === waitingIds[i])
      if (donor && donor.players.length > 0) {
        const subPlayer = donor.players[0]
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

    // Cascade refill: donor team lost a player → pull from next team in queue, propagating gap to tail
    if (substitution) {
      let currentId = substitution.fromTeamId
      while (true) {
        const currentTeam = state.teams.find(t => t.id === currentId)
        if (!currentTeam || currentTeam.players.length >= TEAM_SIZE) break
        const waitingNow = state.teamQueue.filter(id => id !== teamAId && id !== teamBId)
        const currentIdx = waitingNow.indexOf(currentId)
        if (currentIdx === -1 || currentIdx === waitingNow.length - 1) break
        const nextId = waitingNow[currentIdx + 1]
        const nextTeam = state.teams.find(t => t.id === nextId)
        if (!nextTeam || nextTeam.players.length === 0) break
        const refillPlayer = nextTeam.players[0]
        const nextTeamNew = nextTeam.players.filter(p => p !== refillPlayer)
        state.teams = state.teams.map(t => {
          if (t.id === currentId) {
            const players = [...t.players, refillPlayer]
            return { ...t, players, captain: players[0], complete: players.length >= TEAM_SIZE }
          }
          if (t.id === nextId) {
            return { ...t, players: nextTeamNew, captain: nextTeamNew[0] ?? null, complete: nextTeamNew.length >= TEAM_SIZE }
          }
          return t
        })
        if (nextTeamNew.length === 0) {
          state.teams = state.teams.filter(t => t.id !== nextId)
          state.teamQueue = state.teamQueue.filter(id => id !== nextId)
        }
        currentId = nextId
      }
    }

    // If player continues, add them to the last waiting team (tail)
    if (continues) {
      const playingIds = [teamAId, teamBId]
      const waitingQueueIds = state.teamQueue.filter(id => !playingIds.includes(id))
      const lastId = waitingQueueIds[waitingQueueIds.length - 1]
      const lastTeam = lastId ? state.teams.find(t => t.id === lastId) : null

      if (lastTeam && lastTeam.players.length < TEAM_SIZE) {
        state.teams = state.teams.map(t => {
          if (t.id !== lastId) return t
          const players = [...t.players, playerName]
          return { ...t, players, captain: players[0], complete: players.length >= TEAM_SIZE }
        })
      } else {
        const newIdx = state.teams.length
        const newTeam = {
          id: `team-${newIdx}`,
          emoji: TEAM_EMOJIS[newIdx] ?? '⚽',
          players: [playerName],
          captain: playerName,
          complete: false,
          wins: 0,
        }
        state.teams = [...state.teams, newTeam]
        state.teamQueue = [...state.teamQueue, newTeam.id]
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
        state.teams = state.teams.filter(t => t.id !== team.id)
        state.teamQueue = state.teamQueue.filter(id => id !== team.id)
      } else {
        state.teams = state.teams.map(t => {
          if (t.id !== team.id) return t
          return { ...t, players: newPlayers, captain: newPlayers[0], complete: newPlayers.length >= TEAM_SIZE }
        })
      }
    }

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

    // Late players always go to the last waiting team (tail)
    const waitingQueueIds = state.teamQueue.filter(id => !playingIds.includes(id))
    const lastId = waitingQueueIds[waitingQueueIds.length - 1]
    const lastTeam = lastId ? state.teams.find(t => t.id === lastId) : null

    if (lastTeam && lastTeam.players.length < TEAM_SIZE) {
      state.teams = state.teams.map(t => {
        if (t.id !== lastId) return t
        const newPlayers = [...t.players, n]
        return { ...t, players: newPlayers, captain: newPlayers[0], complete: newPlayers.length >= TEAM_SIZE }
      })
    } else {
      // No incomplete tail — create new team at end
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

    // Pick the first two teams in queue order that have at least one player.
    // Incomplete teams can still play (4v5 happens in real pelada).
    const playableIds = state.teamQueue.filter(id => {
      const t = state.teams.find(t => t.id === id)
      return t && t.players.length > 0
    })
    const [teamAId, teamBId] = playableIds

    if (!teamAId || !teamBId) {
      return res.status(400).json({ error: 'Não há times suficientes na fila' })
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

/* ── POST /api/actions/change-match-teams ───────────────── */
router.post('/actions/change-match-teams', async (req, res) => {
  try {
    const { teamAId, teamBId, remaining } = req.body
    if (!teamAId || !teamBId) {
      return res.status(400).json({ error: 'teamAId and teamBId are required' })
    }
    const state = await getState()
    if (!state.activeMatch) {
      return res.status(400).json({ error: 'No active match' })
    }
    state.activeMatch = {
      ...state.activeMatch,
      teamAId,
      teamBId,
      isPaused: true,
      pausedRemaining: remaining ?? state.activeMatch.pausedRemaining ?? 0,
      endTime: null,
    }
    await saveState(state)
    res.json({ state })
  } catch (e) {
    console.error('POST /actions/change-match-teams error:', e)
    res.status(500).json({ error: e.message })
  }
})

/* ── POST /api/actions/adjust-teams ────────────────────── */
router.post('/actions/adjust-teams', async (req, res) => {
  try {
    const { teamQueue: newQueue, teams: teamsPayload } = req.body
    if (!Array.isArray(newQueue) || !Array.isArray(teamsPayload)) {
      return res.status(400).json({ error: 'teamQueue and teams are required arrays' })
    }

    const state = await getState()

    // IDs of teams actively playing — never touch those
    const playingIds = state.activeMatch
      ? new Set([state.activeMatch.teamAId, state.activeMatch.teamBId])
      : new Set()

    // Build updated player lists, deduplicating players across teams
    const seen = new Set()
    const payloadMap = {}
    for (const entry of teamsPayload) {
      if (playingIds.has(entry.id)) continue
      const uniquePlayers = entry.players.filter(p => {
        if (seen.has(p)) return false
        seen.add(p)
        return true
      })
      payloadMap[entry.id] = uniquePlayers
    }

    // Collect all players that were in queue teams originally
    const queueSet = new Set(state.teamQueue.filter(id => !playingIds.has(id)))
    const originalPlayers = state.teams
      .filter(t => queueSet.has(t.id))
      .flatMap(t => t.players)

    // Floating = players that were in queue but are not in any updated team
    const floating = originalPlayers.filter(p => !seen.has(p))

    // Apply new player lists to state.teams
    state.teams = state.teams.map(t => {
      if (playingIds.has(t.id)) return t
      if (!(t.id in payloadMap)) return t
      const players = payloadMap[t.id]
      return { ...t, players, captain: players[0] ?? null, complete: players.length >= TEAM_SIZE }
    })

    // Append floating players to the last team in the new queue
    if (floating.length > 0 && newQueue.length > 0) {
      const lastId = newQueue.filter(id => !playingIds.has(id)).slice(-1)[0]
      if (lastId) {
        state.teams = state.teams.map(t => {
          if (t.id !== lastId) return t
          const players = [...t.players, ...floating]
          return { ...t, players, captain: players[0] ?? null, complete: players.length >= TEAM_SIZE }
        })
      }
    }

    // Remove teams with 0 players (only non-playing)
    const emptyIds = new Set(
      state.teams.filter(t => !playingIds.has(t.id) && t.players.length === 0).map(t => t.id)
    )
    state.teams = state.teams.filter(t => !emptyIds.has(t.id))

    // Apply new queue order, keeping playing teams in their original positions
    const filteredQueue = newQueue.filter(id => !playingIds.has(id) && !emptyIds.has(id))
    const playingQueue = state.teamQueue.filter(id => playingIds.has(id))
    state.teamQueue = [...playingQueue, ...filteredQueue]

    await saveState(state)
    res.json({ state })
  } catch (e) {
    console.error('POST /actions/adjust-teams error:', e)
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
