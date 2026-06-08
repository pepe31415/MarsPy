import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { playerApi, levelApi, gameApi, geminiApi } from '@/services/api'
import type { Player, Level, PlayerBadge } from '@/services/api'

export const useGameStore = defineStore('game', () => {
  // --- State ---
  const player = ref<Player | null>(null)
  const currentLevel = ref<Level | null>(null)
  const badges = ref<PlayerBadge[]>([])
  
  const historyText = ref('')
  const attemptCount = ref(0)

  const isLoading = ref(false)
  const isAiThinking = ref(false)
  const error = ref<string | null>(null)

  const lastAiResponse = ref('')
  const lastScore = ref<number | null>(null)
  const lastPassed = ref(false)
  const levelStartTime = ref<number>(Date.now())

  // --- Computed ---
  const isGameCompleted = computed(() => player.value?.completedAt != null)
  const currentLevelNumber = computed(() => player.value?.currentLevelNumber ?? 0)

  // --- Actions ---
  async function loginOrRegister(alias: string) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await playerApi.createOrGet(alias)
      player.value = data.player
      await loadCurrentLevel()
      await loadBadges()
      return data
    } catch (e: any) {
      error.value = e.response?.data?.error || 'Error al conectar'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function loadCurrentLevel() {
    if (!player.value) return
    isLoading.value = true
    try {
      const { data } = await levelApi.getByNumber(player.value.currentLevelNumber)
      currentLevel.value = data
      levelStartTime.value = Date.now()
      lastAiResponse.value = ''
      lastScore.value = null
      lastPassed.value = false
      // Resetear lastCode al cargar un nuevo nivel
      // para que initCode() use siempre el initialCode del nivel
      if (player.value) {
        player.value.lastCode = ''
      }

      // Load history for this level
      await refreshHistory()
    } catch (e: any) {
      error.value = e.response?.data?.error || 'Error al cargar nivel'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  async function goToLevel(levelNumber: number) {
    if (!player.value) return
    player.value.currentLevelNumber = levelNumber
    await loadCurrentLevel()
  }
  async function refreshHistory() {
    if (!player.value || !currentLevel.value) return
    try {
      const { data } = await gameApi.getHistory(
        player.value.id,
        currentLevel.value.levelNumber
      )
      historyText.value = data.history
      attemptCount.value = data.attemptCount
    } catch {
      historyText.value = ''
      attemptCount.value = 0
    }
  }

  async function loadBadges() {
    if (!player.value) return
    try {
      const { data } = await playerApi.getBadges(player.value.id)
      badges.value = data
    } catch {
      badges.value = []
    }
  }

  async function submitCode(code: string, consoleOutput: string) {
    if (!player.value || !currentLevel.value) return null
    isAiThinking.value = true
    error.value = null

    const timeElapsed = Math.floor((Date.now() - levelStartTime.value) / 1000)

    try {
      // Build the prompt with history substitution
      const nextAttemptNumber = attemptCount.value + 1
      const currentHistory =
        historyText.value +
        `\n--- INTENTO ${nextAttemptNumber} ---\nCódigo escrito:\n${code}\nSalida consola:\n${consoleOutput}\n`
      const level = currentLevel.value
      const prompt = level.aiPromptTemplate
        .replace('{{HISTORY}}', currentHistory)
        .replace('{{ATTEMPT_NUMBER}}', String(nextAttemptNumber))
        .replace('{{CODE}}', code)
        .replace('{{OUTPUT}}', consoleOutput)
        .replace('{{ObjetivoDidactico}}', level.objetivoDidactico || '')
        .replace('{{levelNumber}}', String(level.levelNumber))
        .replace('{{threshold}}', String(level.threshold)) 
        .replace('{{title}}', level.title)
        .replace('{{scenarioDescription}}', level.scenarioDescription)
        .replace('{{initialCode}}', level.initialCode)

      // Call Gemini
      //console.log('========== PROMPT A GEMINI ==========')
      //console.log(prompt)
      //console.log('=====================================')
      const aiResponse = await geminiApi.ask(prompt)
      lastAiResponse.value = aiResponse
      //console.log('========== RESPUESTA DE GEMINI ==========')
      //console.log(aiResponse)
      //console.log('=========================================')

      // Parse score and passed
      const scoreMatch = aiResponse.match(/\[PUNTUACION:\s*(\d+)\]/i)
      const score = scoreMatch ? parseInt(scoreMatch[1]) : null
      const passed = /ACCESO CONCEDIDO/i.test(aiResponse)

      lastScore.value = score
      lastPassed.value = passed

      // Save to backend
      const { data } = await gameApi.submitCode({
        playerId: player.value.id,
        levelNumber: currentLevel.value.levelNumber,
        code,
        consoleOutput,
        timeElapsedSeconds: timeElapsed,
        aiResponse,
        score,
        passed,
      })
      // Usa scoreWithBonus si existe, si no usa el score de la IA
      const finalScore = data.scoreWithBonus ?? score
      lastScore.value = finalScore  // ← actualiza el score mostrado
      // Refresh state
      await refreshHistory()
      await loadBadges()

      // Update player state from response
      if (player.value) {
        player.value.totalScore = data.totalScore
        if (passed && data.nextLevelNumber !== null) {
          player.value.currentLevelNumber = data.nextLevelNumber
          // No guardamos lastCode al pasar de nivel, loadCurrentLevel lo resetea
        }
      }

      levelStartTime.value = Date.now()

      return {
        aiResponse,
        score: finalScore, // devuelve el score con el bonus
        scoreWithBonus:  data.scoreWithBonus, // puntuacion con el bonus
        passed,
        nextLevelNumber: data.nextLevelNumber,
      }
    } catch (e: any) {
      if (e.message?.includes('VITE_GEMINI_API_KEY')) {
        error.value = 'API Key de Gemini no configurada. Añade VITE_GEMINI_API_KEY a tu .env'
      } else {
        error.value = e.message || 'Error al consultar con HAL'
      }
      throw e
    } finally {
      isAiThinking.value = false
    }
  }

  async function advanceToNextLevel() {
    if (!player.value) return
    await loadCurrentLevel()
  }

  function logout() {
    player.value = null
    currentLevel.value = null
    badges.value = []
    historyText.value = ''
    lastAiResponse.value = ''
    lastScore.value = null
    lastPassed.value = false
  }

  return {
    // State
    player,
    currentLevel,
    badges,
    historyText,
    attemptCount,
    isLoading,
    isAiThinking,
    error,
    lastAiResponse,
    lastScore,
    lastPassed,
    levelStartTime,
    // Computed
    isGameCompleted,
    currentLevelNumber,
    // Actions
    loginOrRegister,
    loadCurrentLevel,
    loadBadges,
    submitCode,
    advanceToNextLevel,
    goToLevel,
    logout,
  }
})
