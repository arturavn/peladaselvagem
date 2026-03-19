// src/api.js
// API client for all server communication

const BASE = '/api'

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err)
  }
  return res.json()
}

export const api = {
  getState:        ()                           => request('GET',  '/state'),
  addPlayer:       (name)                       => request('POST', '/actions/add-player',     { name }),
  removePlayer:    (name)                       => request('POST', '/actions/remove-player',  { name }),
  sortTeams:       ()                           => request('POST', '/actions/sort'),
  startMatch:      (teamAId, teamBId, duration) => request('POST', '/actions/start-match',    { teamAId, teamBId, duration }),
  endMatch:        ()                           => request('POST', '/actions/end-match'),
  selectWinner:    (winnerTeamId)               => request('POST', '/actions/select-winner',  { winnerTeamId }),
  resolveEmpate:   (coinTossWinnerId)           => request('POST', '/actions/resolve-empate', { coinTossWinnerId }),
  pauseMatch:      (pause, remaining)           => request('POST', '/actions/pause-match',    { pause, remaining }),
  addLatePlayer:   (name)                       => request('POST', '/actions/add-late-player',{ name }),
  nextMatch:       ()                           => request('POST', '/actions/next-match'),
  navigate:        (screen, navDir)             => request('POST', '/actions/navigate',       { screen, navDir }),
  reset:           ()                           => request('POST', '/actions/reset'),
  getExport:       ()                           => request('GET',  '/export'),
}
