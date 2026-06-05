<template>
  <div class="briefing-screen">

    <!-- Full screen background image -->
    <div class="briefing-bg" :style="bgStyle" />

    <!-- Dark gradient overlay — stronger at top and bottom, lighter in center -->
    <div class="briefing-overlay" />

    <!-- Top bar — same HUD as GameView for visual continuity -->
    <div class="briefing-hud">
      <div class="hud-left">
        <div class="hal-indicator">
          <div class="hal-dot" />
          <span>HAL</span>
        </div>
        <div class="player-info">
          <v-icon size="14" color="primary">mdi-account-circle</v-icon>
          <span>{{ playerAlias }}</span>
        </div>
      </div>
      <div class="hud-center">
        <span class="hud-tag">BRIEFING DE MISIÓN</span>
      </div>
      <div class="hud-right">
        <div class="score-display">
          <v-icon size="14" color="accent">mdi-star</v-icon>
          <span>{{ totalScore }}</span>
          <span class="score-label">PTS</span>
        </div>
      </div>
    </div>

    <!-- Central briefing content -->
    <div class="briefing-body">

      <!-- Level badge + number — oculto en nivel 0 (intro) -->
      <div v-if="levelNumber !== 0 && levelNumber !== 200" class="level-badge">
        <span class="level-badge-prefix">NIVEL</span>
        <span class="level-badge-number">{{ levelNumber }}</span>
      </div>
      <!-- Title with glitch animation -->
      <h1 class="briefing-title" :class="{ visible: titleVisible }">
        {{ title }}
      </h1>

      <!-- Typewriter text -->
      <div class="briefing-text-wrap">
        <div class="briefing-text" v-html="displayedText" />
        <span class="cursor-blink" v-if="isTyping">█</span>
      </div>

    </div>

    <!-- Bottom — start button, only visible when typing is done -->
    <transition name="btn-rise">
      <div v-if="showButton" class="briefing-footer">
        <button class="start-btn" @click="handleStart">
          <span class="start-btn-icon">▶</span>
          {{ levelNumber === 200 ? 'CONDECORACIONES OBTENIDAS' : 'INICIAR NIVEL' }}
          <span class="start-btn-glow" />
        </button>
        <p class="start-hint">
          {{ levelNumber === 200 ? 'Pulsa para ver las condecoraciones obtenidas' : 'Pulsa para comenzar la misión' }}
        </p>
      </div>
    </transition>

    <!-- Skip hint — top right, visible while typing -->
    <button v-if="isTyping" class="skip-btn" @click="skipTyping">
      SALTAR <v-icon size="12">mdi-chevron-double-right</v-icon>
    </button>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { speakText, cancelSpeech } from '@/services/python'

const props = defineProps<{
  levelNumber: number
  title: string
  scenarioDescription: string
  scenarioSpeech: string | null  
  backgroundImage: string
  playerAlias: string
  totalScore: number
  backendBase: string
}>()

const emit = defineEmits<{
  start: []
  startFromZero: []
}>()

// --- State ---
const displayedText = ref('')
const isTyping = ref(false)
const showButton = ref(true)
const titleVisible = ref(false)
let typewriterTimer: ReturnType<typeof setTimeout> | null = null

// --- Background ---
const bgStyle = computed(() => {
  if (!props.backgroundImage) return {}
  const url = props.backgroundImage.startsWith('http')
    ? props.backgroundImage
    : `${props.backendBase}${props.backgroundImage}`
  return {
    backgroundImage: `url("${url}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
})

// --- Convert markdown to plain text for typewriter + speech ---
function markdownToPlain(text: string): string {
  return text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`{3}[\w]*\n[\s\S]*?`{3}/g, '')
    .replace(/`/g, '')
    .replace(/\n\n+/g, '\n')
    .trim()
}

// --- Convert markdown to HTML for display ---
function markdownToHtml(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<span class="md-h3">$1</span>')
    .replace(/^## (.+)$/gm, '<span class="md-h2">$1</span>')
    .replace(/^# (.+)$/gm, '<span class="md-h1">$1</span>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre>$1</pre>')
    .replace(/\n/g, '<br/>')
}

// --- Typewriter effect ---
function startTypewriter() {
  const fullHtml = markdownToHtml(props.scenarioDescription)
  const plainText = markdownToPlain(props.scenarioDescription)

  // Strip HTML tags to get the raw characters for typing
  const plainChars = plainText.split('')
  let charIndex = 0
  isTyping.value = true
  displayedText.value = ''

  // Speak the plain text while typing
  const speechText = props.scenarioSpeech
  ? props.scenarioSpeech
  : plainText
  speakText(speechText, 'es-ES')

  // Type character by character using the HTML version
  // We build the HTML progressively by tracking visible char count
  function typeNext() {
    if (charIndex >= plainChars.length) {
      // Typing done — show full HTML version
      displayedText.value = fullHtml
      isTyping.value = false
      showButton.value = true
      return
    }

    // Show progressively more of the plain text, then swap to HTML at the end
    charIndex += 1 // type 1 chars per tick for slow speed
    displayedText.value = plainChars.slice(0, charIndex).join('').replace(/\n/g, '<br/>')
    typewriterTimer = setTimeout(typeNext, 65)
  }

  typewriterTimer = setTimeout(typeNext, 400)
}

function skipTyping() {
  if (typewriterTimer) {
    clearTimeout(typewriterTimer)
    typewriterTimer = null
  }
  displayedText.value = markdownToHtml(props.scenarioDescription)
  isTyping.value = false
  showButton.value = true
}

onMounted(() => {
  // Small delay so the background image has time to load
  setTimeout(() => {
    titleVisible.value = true
  }, 300)
  setTimeout(() => {
    startTypewriter()
  }, 900)
})

onUnmounted(() => {
  if (typewriterTimer) clearTimeout(typewriterTimer)
  // Stop speech when leaving
  if (window.speechSynthesis) window.speechSynthesis.cancel()
})

function handleStart() {
  // Para el speech inmediatamente, incluyendo los setTimeout pendientes
  cancelSpeech()
  
  // Cancela el typewriter también por si sigue escribiendo
  if (typewriterTimer) {
    clearTimeout(typewriterTimer)
    typewriterTimer = null
  }
  isTyping.value = false

  if (props.levelNumber === 0) {
    emit('startFromZero')
  } else {
    emit('start')
  }
}
</script>

<style scoped>
.briefing-screen {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Full screen background */
.briefing-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  transition: opacity 1s ease;
}

/* Gradient overlay: dark top/bottom, lighter centre */
.briefing-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(to bottom,
      rgba(8, 12, 16, 0.85) 0%,
      rgba(8, 12, 16, 0.30) 20%,
      rgba(8, 12, 16, 0.15) 50%,
      rgba(8, 12, 16, 0.30) 80%,
      rgba(8, 12, 16, 0.90) 100%
    );
}

/* HUD bar */
.briefing-hud {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  height: 52px;
  background: rgba(8, 12, 16, 0.75);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(0, 229, 255, 0.15);
}

.hud-left, .hud-right {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 180px;
}

.hud-right { justify-content: flex-end; }

.hal-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: rgba(255,255,255,0.4);
}

.hal-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: rgba(0, 229, 255, 0.5);
  box-shadow: 0 0 6px rgba(0, 229, 255, 0.4);
  animation: pulse-glow 2s infinite;
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
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.35em;
  color: rgba(0, 229, 255, 0.4);
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

/* Main briefing body */
.briefing-body {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 10%;
  gap: 20px;
  overflow: hidden;
}

/* Level badge */
.level-badge {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.level-badge-prefix {
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.4em;
  color: rgba(0, 229, 255, 0.5);
}

.level-badge-number {
  font-family: var(--font-display);
  font-size: 52px;
  font-weight: 900;
  color: #00e5ff;
  text-shadow:
    0 0 20px rgba(0, 229, 255, 0.7),
    0 0 60px rgba(0, 229, 255, 0.3);
  line-height: 1;
}

/* Title */
.briefing-title {
  font-family: var(--font-display);
  font-size: clamp(22px, 3vw, 36px);
  font-weight: 900;
  color: #ffffff;
  text-align: center;
  text-shadow:
    0 0 30px rgba(0, 229, 255, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.8);
  letter-spacing: 0.08em;
  margin: 0;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.briefing-title.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Typewriter text */
.briefing-text-wrap {
  max-width: 700px;
  width: 100%;
  max-height: 45vh;
  overflow-y: auto;
  text-align: center;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,229,255,0.2) transparent;
}

.briefing-text {
  font-family: var(--font-body);
  font-size: clamp(14px, 1.6vw, 17px);
  line-height: 1.8;
  color: rgba(220, 235, 245, 0.92);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9);
  display: inline;
}

.briefing-text :deep(strong) {
  color: #00e5ff;
  font-weight: 700;
}

.briefing-text :deep(code) {
  font-family: var(--font-mono);
  color: #ffd740;
  background: rgba(255, 215, 64, 0.08);
  padding: 1px 5px;
  border-radius: 2px;
  font-size: 0.9em;
}

.briefing-text :deep(pre) {
  text-align: left;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 229, 255, 0.15);
  padding: 10px 14px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: #00e5ff;
  margin: 8px 0;
  backdrop-filter: blur(4px);
  white-space: pre-wrap;
}

.briefing-text :deep(.md-h1),
.briefing-text :deep(.md-h2),
.briefing-text :deep(.md-h3) {
  display: block;
  font-family: var(--font-display);
  color: #ff3d71;
  letter-spacing: 0.1em;
  margin-bottom: 6px;
}

.briefing-text :deep(.md-h1) { font-size: 1.3em; }
.briefing-text :deep(.md-h2) { font-size: 1.15em; }
.briefing-text :deep(.md-h3) { font-size: 1.05em; color: rgba(0,229,255,0.8); }

.cursor-blink {
  font-family: var(--font-mono);
  color: #00e5ff;
  animation: blink-cursor 0.8s step-end infinite;
  margin-left: 2px;
}

@keyframes blink-cursor {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Footer with start button */
.briefing-footer {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: linear-gradient(to top, rgba(8,12,16,0.9) 0%, transparent 100%);
}

.start-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 48px;
  background: transparent;
  border: 1px solid rgba(0, 229, 255, 0.6);
  color: #00e5ff;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.2em;
  cursor: pointer;
  transition: all 0.25s ease;
  overflow: hidden;
}

.start-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0,229,255,0.08), transparent);
  opacity: 0;
  transition: opacity 0.25s;
}

.start-btn:hover::before { opacity: 1; }

.start-btn:hover {
  border-color: #00e5ff;
  box-shadow:
    0 0 30px rgba(0, 229, 255, 0.35),
    inset 0 0 20px rgba(0, 229, 255, 0.05);
  transform: translateY(-2px);
}

.start-btn:active { transform: translateY(0); }

.start-btn-icon {
  font-size: 13px;
  animation: pulse-glow 1.5s infinite;
}

/* Glow sweep animation on button */
.start-btn-glow {
  position: absolute;
  top: 0; left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0,229,255,0.12), transparent);
  animation: sweep 3s infinite;
}

@keyframes sweep {
  0% { left: -100%; }
  60%, 100% { left: 150%; }
}

.start-hint {
  font-family: var(--font-mono);
  font-size: 10px;
  color: rgba(255, 255, 255, 0.25);
  letter-spacing: 0.15em;
  margin: 0;
}

/* Skip button */
.skip-btn {
  position: absolute;
  top: 60px;
  right: 20px;
  z-index: 20;
  background: rgba(8,12,16,0.6);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.3);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  padding: 5px 10px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.skip-btn:hover {
  color: rgba(255,255,255,0.6);
  border-color: rgba(255,255,255,0.3);
}

/* Transition for start button */
.btn-rise-enter-active {
  transition: all 0.5s ease;
}
.btn-rise-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
</style>
