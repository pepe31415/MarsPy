<template>
  <div class="login-screen">
    <!-- Animated star field background -->
    <canvas ref="starsCanvas" class="stars-canvas" />

    <!-- Central panel -->
    <div class="login-panel">
      <div class="hal-eye">
        <div class="hal-eye-ring" />
        <div class="hal-eye-core" :class="{ scanning: isScanning }" />
        <div class="hal-eye-lens" />
      </div>

      <h1 class="station-title">
        <span class="title-prefix">ESTACIÓN EN MARTE</span>
        <span class="title-main text-glitch">MarsPy</span>
      </h1>

      <p class="station-subtitle">SISTEMA DE ENTRENAMIENTO DE CADETES v4.2.1</p>

      <div class="login-form">
        <div class="form-label">IDENTIFICACIÓN DE CADETE</div>

        <div class="input-wrapper">
          <span class="input-prefix">&gt;_</span>
          <input
            v-model="alias"
            type="text"
            class="cadete-input"
            placeholder="Introduce tu alias..."
            maxlength="30"
            @keyup.enter="handleLogin"
            @focus="isInputFocused = true"
            @blur="isInputFocused = false"
            :disabled="isLoading"
          />
          <div class="input-cursor" :class="{ active: isInputFocused }" />
        </div>

        <div v-if="error" class="error-message">
          <v-icon size="16" color="error">mdi-alert-circle</v-icon>
          {{ error }}
        </div>

        <button
          class="launch-btn"
          :class="{ loading: isLoading }"
          :disabled="isLoading || !alias.trim()"
          @click="handleLogin"
        >
          <span v-if="!isLoading">
            <v-icon size="18">mdi-rocket-launch</v-icon>
            INICIAR MISIÓN
          </span>
          <span v-else class="loading-text">
            AUTENTICANDO
            <span class="dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          </span>
        </button>
      </div>

      <div class="status-bar">
        <span class="status-item">
          <span class="status-dot ok" />
          SISTEMAS NOMINALES
        </span>
        <span class="status-item">
          <span class="status-dot warn" />
          MÓDULO A: ALERTA
        </span>
        <span class="status-item">
          <span class="status-dot ok" />
          HAL ONLINE
        </span>
      </div>
      <!-- Versión -->
      <div class="version-tag">v{{ appVersion }} · {{ buildDate }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const gameStore = useGameStore()

const alias = ref('')
const isInputFocused = ref(false)
const isLoading = ref(false)
const isScanning = ref(false)
const error = ref('')
const starsCanvas = ref<HTMLCanvasElement | null>(null)
let animFrame: number

// Star field animation
function initStars() {
  const canvas = starsCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const width = canvas.width
  const height = canvas.height

  const stars = Array.from({ length: 200 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 1.5,
    speed: Math.random() * 0.3 + 0.05,
    brightness: Math.random(),
  }))

  function draw() {
    ctx.fillStyle = 'rgba(8, 12, 16, 0.2)'
    ctx.fillRect(0, 0, width, height)

    stars.forEach((star) => {
      star.brightness += (Math.random() - 0.5) * 0.05
      star.brightness = Math.max(0.1, Math.min(1, star.brightness))
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(180, 220, 255, ${star.brightness * 0.8})`
      ctx.fill()
      star.y += star.speed
      if (star.y > height) {
        star.y = 0
        star.x = Math.random() * width
      }
    })
    animFrame = requestAnimationFrame(draw)
  }
  draw()
}

onMounted(() => {
  initStars()
  // Scanning effect on HAL eye
  setInterval(() => {
    isScanning.value = true
    setTimeout(() => (isScanning.value = false), 800)
  }, 4000)
})

onUnmounted(() => {
  cancelAnimationFrame(animFrame)
})

async function handleLogin() {
  if (!alias.value.trim() || isLoading.value) return
  error.value = ''
  isLoading.value = true

  try {
    const result = await gameStore.loginOrRegister(alias.value.trim())
    const levelNum = result.player.currentLevelNumber

    if (levelNum === 200) {
      router.push('/victory')
    } else {
      router.push('/game')
    }
  } catch (e: any) {
    error.value = gameStore.error || 'Error de conexión'
  } finally {
    isLoading.value = false
  }
}

const appVersion = __APP_VERSION__
const buildDate = new Date().toLocaleDateString('es-ES', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
})
</script>

<style scoped>
.login-screen {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #080c10;
  overflow: hidden;
  position: relative;
}

.stars-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.login-panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 48px 56px;
  background: rgba(13, 17, 23, 0.92);
  border: 1px solid rgba(0, 229, 255, 0.25);
  box-shadow:
    0 0 60px rgba(0, 229, 255, 0.08),
    0 0 120px rgba(0, 229, 255, 0.04),
    inset 0 0 60px rgba(0, 229, 255, 0.03);
  min-width: 420px;
  max-width: 500px;
}

/* HAL Eye */
.hal-eye {
  position: relative;
  width: 80px;
  height: 80px;
}

.hal-eye-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(0, 229, 255, 0.4);
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.3);
  animation: rotate-ring 8s linear infinite;
}

@keyframes rotate-ring {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.hal-eye-core {
  position: absolute;
  inset: 12px;
  border-radius: 50%;
  background: radial-gradient(circle, #ff2020 0%, #cc0000 40%, #400000 100%);
  box-shadow: 0 0 30px rgba(255, 32, 32, 0.6);
  transition: all 0.3s;
}

.hal-eye-core.scanning {
  box-shadow: 0 0 50px rgba(255, 32, 32, 0.9), 0 0 100px rgba(255, 0, 0, 0.4);
  transform: scale(1.1);
}

.hal-eye-lens {
  position: absolute;
  inset: 30px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,180,180,0.6) 0%, transparent 70%);
}

/* Title */
.station-title {
  text-align: center;
  margin: 0;
  line-height: 1;
}

.title-prefix {
  display: block;
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.4em;
  color: rgba(0, 229, 255, 0.6);
  margin-bottom: 6px;
}

.title-main {
  display: block;
  font-family: var(--font-display);
  font-size: 42px;
  font-weight: 900;
  color: #00e5ff;
  text-shadow: 0 0 20px rgba(0, 229, 255, 0.6), 0 0 60px rgba(0, 229, 255, 0.2);
  letter-spacing: 0.15em;
}

.station-subtitle {
  font-family: var(--font-mono);
  font-size: 11px;
  color: rgba(0, 229, 255, 0.4);
  letter-spacing: 0.2em;
  margin: 0;
}

/* Form */
.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: rgba(0, 229, 255, 0.5);
  letter-spacing: 0.2em;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid rgba(0, 229, 255, 0.3);
  background: rgba(0, 229, 255, 0.03);
  padding: 0 12px;
  position: relative;
}

.input-prefix {
  font-family: var(--font-mono);
  color: rgba(0, 229, 255, 0.6);
  font-size: 14px;
  margin-right: 8px;
  flex-shrink: 0;
}

.cadete-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #00e5ff;
  font-family: var(--font-mono);
  font-size: 16px;
  padding: 14px 0;
  caret-color: #00e5ff;
}

.cadete-input::placeholder {
  color: rgba(0, 229, 255, 0.25);
}

.error-message {
  font-family: var(--font-mono);
  font-size: 12px;
  color: #ff3d71;
  display: flex;
  align-items: center;
  gap: 6px;
}

.launch-btn {
  background: transparent;
  border: 1px solid rgba(0, 229, 255, 0.5);
  color: #00e5ff;
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 0.15em;
  padding: 14px 24px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.launch-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 229, 255, 0);
  transition: background 0.2s;
}

.launch-btn:hover:not(:disabled)::before {
  background: rgba(0, 229, 255, 0.08);
}

.launch-btn:hover:not(:disabled) {
  border-color: #00e5ff;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.3);
}

.launch-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dots span {
  animation: blink 1.2s infinite;
}
.dots span:nth-child(2) { animation-delay: 0.2s; }
.dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
}

/* Status bar */
.status-bar {
  display: flex;
  gap: 20px;
  width: 100%;
  justify-content: center;
  border-top: 1px solid rgba(0, 229, 255, 0.1);
  padding-top: 20px;
}

.status-item {
  font-family: var(--font-mono);
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  gap: 5px;
  letter-spacing: 0.05em;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-dot.ok {
  background: #00e676;
  box-shadow: 0 0 6px #00e676;
  animation: pulse-glow 2s infinite;
}

.status-dot.warn {
  background: #ff3d71;
  box-shadow: 0 0 6px #ff3d71;
  animation: pulse-glow 0.8s infinite;
}

.version-tag {
  font-family: var(--font-mono);
  font-size: 10px;
  color: rgba(0, 229, 255, 0.25);
  letter-spacing: 0.15em;
  margin-top: 4px;
}
</style>
