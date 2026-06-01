import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// --- Types ---
export interface Player {
  id: number
  alias: string
  currentLevelNumber: number
  lastCode: string
  totalScore: number
  completedAt: string | null
  createdAt: string
}

export interface Level {
  id: number
  levelNumber: number
  title: string
  scenarioDescription: string
  initialCode: string
  backgroundImage: string
  aiPromptTemplate: string
  isLast: boolean
  threshold: number
  nextLevelIfPass: number | null
  nextLevelIfFail: number | null
  badgeImage: string
  badgeName: string
}

export interface PlayerBadge {
  id: number
  playerId: number
  levelNumber: number
  badgeImage: string
  badgeName: string
  score: number
  earnedAt: string
}

export interface GameAttempt {
  id: number
  playerId: number
  levelNumber: number
  attemptNumber: number
  codeSubmitted: string
  aiResponse: string
  score: number | null
  passed: boolean
  timeElapsedSeconds: number
  createdAt: string
}

export interface SubmitCodePayload {
  playerId: number
  levelNumber: number
  code: string
  consoleOutput: string
  timeElapsedSeconds: number
  aiResponse: string
  score: number | null
  passed: boolean
}

// --- Player API ---
export const playerApi = {
  createOrGet: (alias: string) =>
    api.post<{ player: Player; isNewPlayer: boolean }>('/players', { alias }),

  getByAlias: (alias: string) =>
    api.get<Player>(`/players/${alias}`),

  getProgress: (playerId: number) =>
    api.get<{ player: Player; attempts: GameAttempt[]; badges: PlayerBadge[] }>(
      `/players/${playerId}/progress`
    ),

  getBadges: (playerId: number) =>
    api.get<PlayerBadge[]>(`/players/${playerId}/badges`),
}

// --- Level API ---
export const levelApi = {
  getByNumber: (levelNumber: number) =>
    api.get<Level>(`/levels/${levelNumber}`),

  getAll: () =>
    api.get<Level[]>('/levels'),
}

// --- Game API ---
export const gameApi = {
  submitCode: (payload: SubmitCodePayload) =>
    api.post<{
      attempt: GameAttempt
      nextLevelNumber: number | null
      passed: boolean
      totalScore: number
    }>('/game/submit', payload),

  getHistory: (playerId: number, levelNumber: number) =>
    api.get<{ history: string; attemptCount: number }>(
      `/game/history/${playerId}/${levelNumber}`
    ),

  getAttempts: (playerId: number, levelNumber: number) =>
    api.get<GameAttempt[]>(`/game/attempts/${playerId}/${levelNumber}`),
}

// --- Gemini AI ---
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

export const geminiApi = {
  ask: async (prompt: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey) throw new Error('VITE_GEMINI_API_KEY not configured')

    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Gemini API error ${response.status}: ${err}`)
    }

    const data = await response.json()
    return data.candidates[0].content.parts[0].text as string
  },
}
