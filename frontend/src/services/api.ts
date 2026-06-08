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
  objetivoDidactico: string
  title: string
  scenarioDescription: string
  scenarioSpeech: string | null
  initialCode: string
  backgroundImage: string
  aiPromptTemplate: string
  isLast: boolean
  threshold: number
  nextLevelIfPass: number | null
  nextLevelIfFail: number | null
  badgeThresholdImage: string | null
  badgeThresholdName: string | null
  badgeCompletionImage: string | null
  badgeCompletionName: string | null
}

export interface PlayerBadge {
  id: number
  playerId: number
  levelNumber: number
  badgeImage: string
  badgeName: string
  badgeType: 'threshold' | 'completion'
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
      scoreWithBonus: number
    }>('/game/submit', payload),

  getHistory: (playerId: number, levelNumber: number) =>
    api.get<{ history: string; attemptCount: number }>(
      `/game/history/${playerId}/${levelNumber}`
    ),

  getAttempts: (playerId: number, levelNumber: number) =>
    api.get<GameAttempt[]>(`/game/attempts/${playerId}/${levelNumber}`),
}

// --- Gemini AI ---
export const geminiApi = {
  ask: async (prompt: string): Promise<string> => {
    const response = await api.post<{ response: string }>('/game/ask-hal', { prompt })
    return response.data.response
  },
}
