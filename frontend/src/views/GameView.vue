<template>
  <!-- Briefing de nivel — pantalla completa antes de cada nivel -->
  <LevelBriefing
    v-if="showBriefing"
    :key="currentLevel?.levelNumber"
    :levelNumber="currentLevel?.levelNumber ?? 0"
    :title="currentLevel?.title ?? ''"
    :scenarioDescription="currentLevel?.scenarioDescription ?? ''"
    :scenarioSpeech="currentLevel?.scenarioSpeech ?? null"
    :backgroundImage="currentLevel?.backgroundImage ?? ''"
    :playerAlias="gameStore.player?.alias?.toUpperCase() ?? ''"
    :totalScore="gameStore.player?.totalScore ?? 0"
    :backendBase="backendBase"
    @start="startLevel"
    @startFromZero="startFromZero"
  />

  <div v-else class="game-screen" :style="bgStyle">
    <!-- Background overlay -->
    <div class="bg-overlay" />

    <!-- Top HUD bar -->
    <div class="hud-top">
      <div class="hud-left">
        <div class="hal-indicator">
          <div class="hal-dot" :class="halDotClass" />
          <span class="hal-label">HAL</span>
        </div>
        <div class="player-info">
          <v-icon size="14" color="primary">mdi-account-circle</v-icon>
          <span>{{ gameStore.player?.alias?.toUpperCase() }}</span>
        </div>
      </div>

      <div class="hud-center">
        <div class="level-display">
          <span class="level-prefix">NIVEL</span>
          <span class="level-number">{{ currentLevel?.levelNumber }}</span>
        </div>
        <div class="level-title">{{ currentLevel?.title }}</div>
      </div>

      <div class="hud-right">
        <div class="score-display">
          <v-icon size="14" color="accent">mdi-star</v-icon>
          <span>{{ gameStore.player?.totalScore ?? 0 }}</span>
          <span class="score-label">PTS</span>
        </div>
        <button class="logout-btn" @click="handleLogout">
          <v-icon size="14">mdi-exit-to-app</v-icon>
        </button>
      </div>
    </div>

    <!-- Main content area -->
    <div class="game-content">
      <!-- LEFT PANEL: Scenario + HAL response -->
      <div class="left-panel">
        <!-- Scenario description -->
        <div class="panel-card scenario-card">
          <div class="card-header">
            <v-icon size="14" color="error">mdi-alert-circle</v-icon>
            <span>BRIEFING DE MISIÓN</span>
          </div>
          <div class="scenario-text" v-html="renderedScenario" />
        </div>

        <!-- HAL Response -->
        <div class="panel-card hal-card" :class="{ 'hal-success': lastPassed, 'hal-error': hadError }">
          <div class="card-header">
            <div class="hal-eye-mini" :class="{ thinking: gameStore.isAiThinking }" />
            <span>TRANSMISIÓN DE HAL</span>
            <div v-if="gameStore.isAiThinking" class="thinking-indicator">
              <span>PROCESANDO</span>
              <span class="dots"><span>.</span><span>.</span><span>.</span></span>
            </div>
          </div>
          <div class="hal-response-text">
            <template v-if="gameStore.isAiThinking">
              <span class="thinking-text">Analizando telemetría del cadete...</span>
            </template>
            <template v-else-if="displayResponse">
              <span class="response-content">{{ displayResponse }}</span>
            </template>
            <template v-else>
              <span class="idle-text">Sistema en espera. Ejecuta tu código para recibir análisis.</span>
            </template>
          </div>

          <!-- Score display -->
          <div v-if="lastScore !== null" class="score-badge">
            <span class="score-val">{{ lastScore }}</span>
            <span class="score-max">/20</span>
            <span class="score-label-badge">PUNTUACIÓN</span>
          </div>
        </div>

        <!-- Badges panel -->
        <div v-if="gameStore.badges.length > 0" class="panel-card badges-card">
          <div class="card-header">
            <v-icon size="14" color="accent">mdi-shield-star</v-icon>
            <span>INSIGNIAS OBTENIDAS</span>
          </div>
          <div class="badges-grid">
            <div
              v-for="badge in gameStore.badges"
              :key="badge.id"
              class="badge-item"
              :title="badge.badgeName"
            >
              <img
                :src="assetUrl(badge.badgeImage)"
                :alt="badge.badgeName"
                class="badge-img"
                @error="handleBadgeError"
              />
              <span class="badge-name">{{ badge.badgeName }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL: Code editor + console -->
      <div class="right-panel">
        <!-- Code editor -->
        <div class="panel-card editor-card">
          <div class="card-header">
            <v-icon size="14" color="primary">mdi-code-braces</v-icon>
            <span>EDITOR DE CÓDIGO PYTHON</span>
            <div class="attempt-counter">
              Intento #{{ (gameStore.attemptCount ?? 0) + 1 }}
            </div>
          </div>
          <textarea
            v-model="currentCode"
            class="code-editor"
            spellcheck="false"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            :disabled="isSpeaking"
            @keydown.tab.prevent="handleTab"
          />
        </div>

        <!-- Action buttons -->
        <div class="action-row">
          <button
            class="action-btn run-btn"
            :disabled="isExecuting || gameStore.isAiThinking || isSpeaking"
            @click="runCode"
          >
            <v-icon size="16">mdi-play</v-icon>
            <span>EJECUTAR</span>
          </button>

          <button
            class="action-btn reset-btn"
            :disabled="isExecuting || isSpeaking"
            @click="resetCode"
          >
            <v-icon size="16">mdi-refresh</v-icon>
            <span>RESETEAR</span>
          </button>

          <button
            v-if="lastPassed && nextLevelNumber !== null"
            class="action-btn next-btn"
            @click="goToNextLevel"
          >
            <v-icon size="16">mdi-arrow-right-bold</v-icon>
            <span>SIGUIENTE NIVEL</span>
          </button>
        </div>

        <!-- Console output -->
        <div class="panel-card console-card">
          <div class="card-header">
            <v-icon size="14" :color="consoleError ? 'error' : 'success'">
              {{ consoleError ? 'mdi-alert' : 'mdi-console' }}
            </v-icon>
            <span>CONSOLA DEL SISTEMA</span>
          </div>
          <div class="console-output" :class="{ 'has-error': consoleError }">
            <template v-if="isExecuting">
              <span class="executing-text">Ejecutando código<span class="dots"><span>.</span><span>.</span><span>.</span></span></span>
            </template>
            <template v-else-if="consoleOutput">
              <pre>{{ consoleOutput }}</pre>
            </template>
            <template v-else>
              <span class="idle-console">Sistema listo. Pulsa EJECUTAR para iniciar.</span>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Level pass overlay -->
    <transition name="overlay-fade">
      <div v-if="showPassOverlay" class="pass-overlay">
        <div class="pass-content">
          <div class="pass-icon">
            <v-icon size="80" color="success">mdi-check-circle</v-icon>
          </div>
          <h2 class="pass-title">ACCESO CONCEDIDO</h2>
          <p class="pass-subtitle">{{ currentLevel?.title }} — COMPLETADO</p>
          <div v-if="lastScoreWithBonus !== null" class="pass-score">
            <span class="pass-score-val">{{ lastScoreWithBonus }}</span>
            <span class="pass-score-max">{{ lastScoreWithBonus > 20 ? "/40" : "/20" }}</span>
          </div>
          <div v-if="newBadge" class="new-badge-award">
            <img
              :src="assetUrl(newBadge.badgeImage)"
              :alt="newBadge.badgeName"
              class="new-badge-img"
              @error="handleBadgeError"
            />
            <p class="new-badge-name">🏆 {{ newBadge.badgeName }}</p>
          </div>
          <button class="continue-btn" @click="proceedToNext">
            <v-icon size="18">mdi-arrow-right-bold</v-icon>
            CONTINUAR MISIÓN
          </button>
        </div>
      </div>
    </transition>

    <!-- Error snackbar -->
    <v-snackbar
      v-model="showError"
      color="error"
      location="bottom right"
      :timeout="5000"
    >
      <v-icon class="mr-2">mdi-alert</v-icon>
      {{ gameStore.error }}
      <template #actions>
        <v-btn variant="text" @click="showError = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </div><!-- end .game-screen -->

</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { executePython, speakText, parseAiResponse } from '@/services/python'
import type { PlayerBadge } from '@/services/api'
import LevelBriefing from '@/components/LevelBriefing.vue'

const router = useRouter()
const gameStore = useGameStore()

const isSpeaking = ref(false) // estado de que el speech está hablando.

const currentCode = ref('')
const consoleOutput = ref('')
const consoleError = ref(false)
const isExecuting = ref(false)
const lastPassed = ref(false)
const lastScore = ref<number | null>(null)
const lastScoreWithBonus = ref<number | null>(null)   
const displayResponse = ref('')
const nextLevelNumber = ref<number | null>(null)
const showPassOverlay = ref(false)
const newBadge = ref<PlayerBadge | null>(null)
const hadError = ref(false)
const showError = ref(false)
const showBriefing = ref(true)  // mostrar briefing antes de cada nivel

const currentLevel = computed(() => gameStore.currentLevel)

// Extrae base URL del backend correctamente
// VITE_API_URL = 'http://localhost:3001/api'  =>  backendBase = 'http://localhost:3001'
const apiUrl = import.meta.env.VITE_API_URL as string || 'http://localhost:3001/api'
const backendBase = apiUrl.replace(/\/api$/, '')

function assetUrl(path: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${backendBase}${path}`
}

function handleBadgeError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

// IMPORTANTE: pasar background-image directamente en :style
// Las CSS custom properties (--var) NO funcionan con :style en componentes Vue scoped
const bgStyle = computed(() => {
  const img = currentLevel.value?.backgroundImage
  if (!img) return { backgroundColor: '#080c10' }
  const fullUrl = assetUrl(img)
  console.log('[MarsPy] Background URL:', fullUrl)
  return {
    backgroundImage: `url("${fullUrl}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
})

const halDotClass = computed(() => {
  if (gameStore.isAiThinking) return 'thinking'
  if (lastPassed.value) return 'success'
  if (hadError.value) return 'error'
  return 'idle'
})

// Convert markdown-ish scenario description to basic HTML
const renderedScenario = computed(() => {
  const text = currentLevel.value?.scenarioDescription || ''
  return text
    .replace(/^### (.+)$/gm, '<h5 class="scenario-h5">$1</h5>')
    .replace(/^## (.+)$/gm, '<h4 class="scenario-h4">$1</h4>')
    .replace(/^# (.+)$/gm, '<h3 class="scenario-h3">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code class="inline-code">$1</code>')
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre class="code-block">$1</pre>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
})

onMounted(async () => {
  if (!gameStore.player) {
    router.push('/')
    return
  }
  if (!gameStore.currentLevel) {
    await gameStore.loadCurrentLevel()
  }
  initCode()
})

watch(() => gameStore.currentLevel, () => {
  initCode()
  lastPassed.value = false
  lastScore.value = null
  displayResponse.value = ''
  consoleOutput.value = ''
  consoleError.value = false
  hadError.value = false
  nextLevelNumber.value = null
  showPassOverlay.value = false
  showBriefing.value = true  // mostrar briefing al cambiar de nivel
})

// Llamado desde LevelBriefing cuando el jugador pulsa "INICIAR NIVEL"
function startLevel() {
  if (gameStore.currentLevel?.levelNumber === 200) {
    router.push('/victory')
    return
  }
  showBriefing.value = false
}
async function startFromZero() {
 await gameStore.goToLevel(1)
 // showBriefing se resetea automáticamente en el watch
}

function initCode() {
  const savedCode = gameStore.player?.lastCode
  const levelCode = gameStore.currentLevel?.initialCode || ''
  currentCode.value = (savedCode && savedCode.trim() && gameStore.attemptCount > 0)
    ? savedCode
    : levelCode
}

function resetCode() {
  currentCode.value = gameStore.currentLevel?.initialCode || ''
  consoleOutput.value = ''
  consoleError.value = false
}

function handleTab(e: KeyboardEvent) {
  const textarea = e.target as HTMLTextAreaElement
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  currentCode.value =
    currentCode.value.substring(0, start) + '    ' + currentCode.value.substring(end)
  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = start + 4
  }, 0)
}

async function runCode() {
  if (isExecuting.value || gameStore.isAiThinking) return
  isExecuting.value = true
  consoleError.value = false
  consoleOutput.value = ''
  hadError.value = false

  try {
    // Execute Python via Skulpt
    const result = await executePython(currentCode.value)

    if (result.error) {
      consoleOutput.value = `❌ ERROR:\n${result.error}`
      consoleError.value = true
      hadError.value = true
    } else {
      consoleOutput.value = result.output || '(sin salida)'
    }

    isExecuting.value = false

    // Submit to AI
    const submission = await gameStore.submitCode(
      currentCode.value,
      consoleOutput.value
    )

    if (submission) {
      const { cleanText, score, passed } = parseAiResponse(submission.aiResponse)
      displayResponse.value = cleanText
      lastScore.value = score
      lastScoreWithBonus.value = submission.scoreWithBonus ?? score 
      lastPassed.value = passed
      nextLevelNumber.value = submission.nextLevelNumber
      hadError.value = !passed

      // Speak HAL response y esperar a que termine
      isSpeaking.value = true
      await speakText(cleanText)
      isSpeaking.value = false

      // Ahora sí mostrar el overlay de puntuación
      if (passed) {
        const prevBadgeCount = gameStore.badges.length
        await gameStore.loadBadges()
        if (gameStore.badges.length > prevBadgeCount) {
          newBadge.value = gameStore.badges[gameStore.badges.length - 1]
        }
        showPassOverlay.value = true
      }
    }
  } catch (e: any) {
    isExecuting.value = false
    showError.value = true
  }
}

async function goToNextLevel() {
  showPassOverlay.value = false
  await proceedToNext()
}


async function proceedToNext() {
  showPassOverlay.value = false
  if (!gameStore.player) return

  const next = nextLevelNumber.value ?? gameStore.player.currentLevelNumber

  if (next === 200) {
    // Carga el nivel 200 para tener su backgroundImage y scenarioSpeech
    await gameStore.goToLevel(200)
    // El watch de currentLevel pondrá showBriefing = true automáticamente
    // y mostrará el briefing del nivel 200 antes de ir a victory
    return
  }

  await gameStore.advanceToNextLevel()
}


function handleLogout() {
  gameStore.logout()
  router.push('/')
}
</script>

<style scoped>

.game-screen {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  /* background-image se aplica via :style binding en el template */
  background-color: #080c10;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  /* Overlay muy ligero: solo un tinte oscuro, la imagen debe verse claramente */
  background: rgba(8, 12, 16, 0.25);
  z-index: 1;
}

/* HUD Top */
.hud-top {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: rgba(8, 12, 16, 0.80);
  border-bottom: 1px solid rgba(0, 229, 255, 0.15);
  height: 52px;
}

.hud-left, .hud-right {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 200px;
}

.hud-right { justify-content: flex-end; }

.hal-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: rgba(255,255,255,0.5);
}

.hal-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s;
}

.hal-dot.idle {
  background: rgba(0, 229, 255, 0.5);
  box-shadow: 0 0 6px rgba(0, 229, 255, 0.4);
}

.hal-dot.thinking {
  background: #ffd740;
  box-shadow: 0 0 10px #ffd740;
  animation: pulse-glow 0.5s infinite;
}

.hal-dot.success {
  background: #00e676;
  box-shadow: 0 0 10px #00e676;
}

.hal-dot.error {
  background: #ff3d71;
  box-shadow: 0 0 10px #ff3d71;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: rgba(0, 229, 255, 0.7);
}

.hud-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.level-display {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.level-prefix {
  font-family: var(--font-display);
  font-size: 9px;
  letter-spacing: 0.3em;
  color: rgba(0, 229, 255, 0.4);
}

.level-number {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 900;
  color: #00e5ff;
  text-shadow: 0 0 15px rgba(0, 229, 255, 0.5);
  line-height: 1;
}

.level-title {
  font-family: var(--font-mono);
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.1em;
  text-align: center;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-display);
  font-size: 14px;
  color: #ffd740;
}

.score-label {
  font-size: 9px;
  opacity: 0.6;
}

.logout-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  border-color: rgba(255, 61, 113, 0.5);
  color: #ff3d71;
}

/* Main content */
.game-content {
  position: relative;
  z-index: 5;
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 12px;
  padding: 12px;
  overflow: hidden;
  min-height: 0;
}

.left-panel, .right-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  overflow: hidden;
}

/* Panel cards - glassmorphism: fondo semitransparente + blur */
.panel-card {
  background: rgba(6, 10, 14, 0.55);
  border: 1px solid rgba(0, 229, 255, 0.22);
  overflow: hidden;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}
.panel-card.hal-success {
  border-color: rgba(0, 230, 118, 0.3);
  box-shadow: inset 0 0 30px rgba(0, 230, 118, 0.05);
}

.panel-card.hal-error {
  border-color: rgba(255, 61, 113, 0.3);
  box-shadow: inset 0 0 30px rgba(255, 61, 113, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 229, 255, 0.04);
  border-bottom: 1px solid rgba(0, 229, 255, 0.08);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.15em;
  color: rgba(0, 229, 255, 0.5);
}

.thinking-indicator {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 2px;
  color: #ffd740;
  font-size: 10px;
}

/* Scenario */
.scenario-card {
  flex: 0 0 auto;
  max-height: 42%;
}

.scenario-text {
  padding: 12px;
  font-family: var(--font-body);
  font-size: 13px;
  line-height: 1.6;
  color: #b0bec5;
  overflow-y: auto;
  max-height: calc(100% - 36px);
}

/* HAL card */
.hal-card {
  flex: 1;
  min-height: 120px;
  position: relative;
}

.hal-eye-mini {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle, #ff4040 0%, #cc0000 100%);
  box-shadow: 0 0 8px rgba(255, 64, 64, 0.6);
  flex-shrink: 0;
}

.hal-eye-mini.thinking {
  animation: pulse-glow 0.4s infinite;
  box-shadow: 0 0 16px rgba(255, 64, 64, 0.9);
}

.hal-response-text {
  padding: 12px;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.7;
  overflow-y: auto;
  max-height: calc(100% - 80px);
}

.thinking-text, .idle-text, .idle-console {
  color: rgba(255, 255, 255, 0.25);
  font-style: italic;
}

.response-content {
  color: #b0d4e8;
  white-space: pre-wrap;
}

.score-badge {
  position: absolute;
  bottom: 10px;
  right: 12px;
  display: flex;
  align-items: baseline;
  gap: 2px;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 10px;
  border: 1px solid rgba(255, 215, 64, 0.3);
}

.score-val {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 900;
  color: #ffd740;
}

.score-max {
  font-family: var(--font-mono);
  font-size: 14px;
  color: rgba(255, 215, 64, 0.5);
}

.score-label-badge {
  font-family: var(--font-mono);
  font-size: 9px;
  color: rgba(255, 215, 64, 0.4);
  margin-left: 4px;
  letter-spacing: 0.1em;
}

/* Badges */
.badges-card {
  flex-shrink: 0;
}

.badges-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: default;
}

.badge-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  filter: drop-shadow(0 0 6px rgba(255, 215, 64, 0.4));
}

.badge-name {
  font-family: var(--font-mono);
  font-size: 8px;
  color: rgba(255, 215, 64, 0.6);
  text-align: center;
  max-width: 60px;
  line-height: 1.2;
}

/* Editor */
.editor-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.code-editor {
  flex: 1;
  background: rgba(4, 8, 12, 0.70);
  color: #00e5ff;
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.6;
  border: none;
  outline: none;
  padding: 12px;
  resize: none;
  width: 100%;
  min-height: 180px;
  caret-color: #00e5ff;
  tab-size: 4;
}

.attempt-counter {
  margin-left: auto;
  font-size: 10px;
  color: rgba(255, 215, 64, 0.5);
}

/* Action buttons */
.action-row {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.1em;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.run-btn {
  background: rgba(0, 229, 255, 0.12);
  color: #00e5ff;
  border: 1px solid rgba(0, 229, 255, 0.4);
  flex: 1;
}

.run-btn:hover:not(:disabled) {
  background: rgba(0, 229, 255, 0.2);
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.2);
}

.run-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.reset-btn {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.reset-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
}

.next-btn {
  background: rgba(0, 230, 118, 0.12);
  color: #00e676;
  border: 1px solid rgba(0, 230, 118, 0.4);
  animation: pulse-glow 1.5s infinite;
}

.next-btn:hover {
  background: rgba(0, 230, 118, 0.2);
}

/* Console */
.console-card {
  flex-shrink: 0;
  min-height: 100px;
  max-height: 140px;
}

.console-output {
  padding: 10px 12px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: #00e676;
  overflow-y: auto;
  max-height: 100px;
  min-height: 60px;
}

.console-output.has-error {
  color: #ff3d71;
}

.console-output pre {
  margin: 0;
  white-space: pre-wrap;
}

.executing-text {
  color: #ffd740;
  display: flex;
  align-items: center;
}

/* Pass overlay */
.pass-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.pass-content {
  text-align: center;
  padding: 48px;
  background: rgba(13, 17, 23, 0.98);
  border: 1px solid rgba(0, 230, 118, 0.4);
  box-shadow: 0 0 60px rgba(0, 230, 118, 0.2);
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.pass-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 900;
  color: #00e676;
  text-shadow: 0 0 20px rgba(0, 230, 118, 0.5);
  margin: 0;
  letter-spacing: 0.1em;
}

.pass-subtitle {
  font-family: var(--font-mono);
  font-size: 13px;
  color: rgba(255,255,255,0.5);
  margin: 0;
}

.pass-score {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.pass-score-val {
  font-family: var(--font-display);
  font-size: 56px;
  font-weight: 900;
  color: #ffd740;
  line-height: 1;
}

.pass-score-max {
  font-family: var(--font-mono);
  font-size: 24px;
  color: rgba(255, 215, 64, 0.4);
}

.new-badge-award {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.new-badge-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  filter: drop-shadow(0 0 16px rgba(255, 215, 64, 0.6));
  animation: badge-appear 0.5s ease-out;
}

@keyframes badge-appear {
  from { transform: scale(0) rotate(-20deg); opacity: 0; }
  to { transform: scale(1) rotate(0); opacity: 1; }
}

.new-badge-name {
  font-family: var(--font-display);
  font-size: 13px;
  color: #ffd740;
  margin: 0;
}

.continue-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 230, 118, 0.12);
  border: 1px solid rgba(0, 230, 118, 0.5);
  color: #00e676;
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 0.1em;
  padding: 12px 32px;
  cursor: pointer;
  transition: all 0.2s;
}

.continue-btn:hover {
  background: rgba(0, 230, 118, 0.2);
  box-shadow: 0 0 20px rgba(0, 230, 118, 0.3);
}

/* Overlay transition */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: all 0.3s;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

/* Dots animation */
.dots span {
  animation: blink 1.2s infinite;
}
.dots span:nth-child(2) { animation-delay: 0.2s; }
.dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
}

/* Inline code style in scenario */
</style>
