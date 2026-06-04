<template>
  <div class="victory-screen">
    <canvas ref="particlesCanvas" class="particles-canvas" />

    <div class="victory-content">
      <!-- HAL eye -->
      <div class="hal-final">
        <div class="hal-ring-outer" />
        <div class="hal-ring-inner" />
        <div class="hal-core" />
      </div>

      <div class="victory-text">
        <div class="mission-complete">MISIÓN COMPLETADA</div>
        <h1 class="victory-title">HÉROE DE LA<br/>ESTACIÓN MarsPy</h1>
        <p class="victory-alias">Cadete {{ gameStore.player?.alias?.toUpperCase() }}</p>
      </div>

      <div class="final-score-section">
        <div class="final-score-label">PUNTUACIÓN TOTAL</div>
        <div class="final-score-value">{{ gameStore.player?.totalScore ?? 0 }}</div>
      </div>

      <!-- Badges earned -->
      <div v-if="gameStore.badges.length > 0" class="badges-section">
        <div class="badges-title">INSIGNIAS OBTENIDAS</div>
        <div class="badges-showcase">
          <div
            v-for="(badge, i) in gameStore.badges"
            :key="badge.id"
            class="badge-showcase-item"
            :style="{ animationDelay: `${i * 0.15}s` }"
          >
            <img
              :src="assetUrl(badge.badgeImage)"
              :alt="badge.badgeName"
              class="badge-showcase-img"
              @error="handleImgError"
            />
            <div class="badge-score">{{ badge.score }}/20</div>
            <div class="badge-showcase-name">{{ badge.badgeName }}</div>
          </div>
        </div>
      </div>

      <!-- HAL final message -->
      <div class="hal-message">
        <div class="hal-message-prefix">HAL:</div>
        <p class="hal-message-text">
          "Ha sido un honor servir junto a ti, cadete. La Estación MarsPy y la humanidad entera
          te deben la vida. Ahora puedes descansar... si es que los programadores descansan alguna vez."
        </p>
      </div>

      <button class="play-again-btn" @click="playAgain">
        <v-icon size="18">mdi-restart</v-icon>
        NUEVA MISIÓN
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { speakText } from '@/services/python'

const router = useRouter()
const gameStore = useGameStore()
const particlesCanvas = ref<HTMLCanvasElement | null>(null)
let animFrame: number

const apiUrl = import.meta.env.VITE_API_URL || '/api'
const backendBase = apiUrl.replace('/api', '')

function assetUrl(path: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${backendBase}${path}`
}

function handleImgError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

function initParticles() {
  const canvas = particlesCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const width = canvas.width
  const height = canvas.height

  const particles: Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
  }> = []

  function spawnParticle() {
    const colors = ['#00e5ff', '#ffd740', '#00e676', '#ff3d71', '#ffffff']
    particles.push({
      x: Math.random() * width,
      y: height + 10,
      vx: (Math.random() - 0.5) * 2,
      vy: -(Math.random() * 3 + 1),
      size: Math.random() * 4 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: Math.random() * 150 + 100,
    })
  }

  let frame = 0
  function draw() {
    ctx.fillStyle = 'rgba(8, 12, 16, 0.15)'
    ctx.fillRect(0, 0, width, height)

    if (frame % 3 === 0) spawnParticle()
    frame++

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.02
      p.life++

      const alpha = 1 - p.life / p.maxLife
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0')
      ctx.fill()

      if (p.life >= p.maxLife || p.y < -10) {
        particles.splice(i, 1)
      }
    }
    animFrame = requestAnimationFrame(draw)
  }
  draw()
}

onMounted(async () => {
  if (!gameStore.player) {
    router.push('/')
    return
  }
  await gameStore.loadBadges()
  initParticles()

  setTimeout(() => {
    speakText(
      'Ha sido un honor servir junto a ti, cadete. La Estación MarsPy y la humanidad entera te deben la vida.'
    )
  }, 1000)
})

onUnmounted(() => {
  cancelAnimationFrame(animFrame)
})

function playAgain() {
  gameStore.logout()
  router.push('/')
}
</script>

<style scoped>
.victory-screen {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #080c10;
  position: relative;
}

.particles-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.victory-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 48px 60px;
  background: rgba(13, 17, 23, 0.94);
  border: 1px solid rgba(255, 215, 64, 0.3);
  box-shadow: 0 0 80px rgba(255, 215, 64, 0.1), inset 0 0 60px rgba(255, 215, 64, 0.03);
  max-width: 700px;
  width: 90%;
  max-height: 92vh;
  overflow-y: auto;
}

/* HAL final */
.hal-final {
  position: relative;
  width: 70px;
  height: 70px;
}

.hal-ring-outer {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(255, 215, 64, 0.5);
  animation: rotate-ring 6s linear infinite;
}

.hal-ring-inner {
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  border: 1px solid rgba(255, 215, 64, 0.3);
  animation: rotate-ring 3s linear infinite reverse;
}

.hal-core {
  position: absolute;
  inset: 18px;
  border-radius: 50%;
  background: radial-gradient(circle, #ffd740 0%, #cc8800 50%, #440000 100%);
  box-shadow: 0 0 20px rgba(255, 215, 64, 0.6);
}

@keyframes rotate-ring {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Title */
.victory-text { text-align: center; }

.mission-complete {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.4em;
  color: rgba(255, 215, 64, 0.5);
  margin-bottom: 8px;
}

.victory-title {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 900;
  color: #ffd740;
  text-shadow: 0 0 30px rgba(255, 215, 64, 0.5);
  line-height: 1.1;
  margin: 0 0 8px;
  letter-spacing: 0.05em;
}

.victory-alias {
  font-family: var(--font-mono);
  font-size: 14px;
  color: rgba(0, 229, 255, 0.7);
  margin: 0;
}

/* Score */
.final-score-section {
  text-align: center;
}

.final-score-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.3em;
  color: rgba(255, 215, 64, 0.4);
}

.final-score-value {
  font-family: var(--font-display);
  font-size: 64px;
  font-weight: 900;
  color: #ffd740;
  text-shadow: 0 0 40px rgba(255, 215, 64, 0.4);
  line-height: 1;
}

/* Badges */
.badges-section {
  width: 100%;
  text-align: center;
}

.badges-title {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.3em;
  color: rgba(255, 215, 64, 0.4);
  margin-bottom: 16px;
}

.badges-showcase {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
}

.badge-showcase-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  animation: badge-float 0.6s ease-out both;
}

@keyframes badge-float {
  from { opacity: 0; transform: translateY(20px) scale(0.8); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.badge-showcase-img {
  width: 52px;
  height: 52px;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(255, 215, 64, 0.5));
}

.badge-score {
  font-family: var(--font-display);
  font-size: 11px;
  color: #ffd740;
}

.badge-showcase-name {
  font-family: var(--font-mono);
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  max-width: 70px;
}

/* HAL message */
.hal-message {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 64, 64, 0.2);
  padding: 16px;
  width: 100%;
}

.hal-message-prefix {
  font-family: var(--font-mono);
  font-size: 10px;
  color: rgba(255, 64, 64, 0.6);
  margin-bottom: 6px;
  letter-spacing: 0.2em;
}

.hal-message-text {
  font-family: var(--font-mono);
  font-size: 13px;
  color: #90a4ae;
  line-height: 1.6;
  margin: 0;
  font-style: italic;
}

/* Play again */
.play-again-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid rgba(0, 229, 255, 0.4);
  color: #00e5ff;
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 0.15em;
  padding: 12px 32px;
  cursor: pointer;
  transition: all 0.2s;
}

.play-again-btn:hover {
  background: rgba(0, 229, 255, 0.08);
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.2);
}
</style>
