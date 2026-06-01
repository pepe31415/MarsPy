<template>
  <v-app :style="appStyle">
    <!-- Scanline overlay effect -->
    <div class="scanlines-overlay" />
    <!-- CRT vignette -->
    <div class="vignette-overlay" />
    <router-view v-slot="{ Component }">
      <transition name="screen-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()

const appStyle = computed(() => ({
  fontFamily: "'Rajdhani', sans-serif",
  background: '#080c10',
}))
</script>

<style>
:root {
  --font-display: 'Orbitron', monospace;
  --font-mono: 'Share Tech Mono', monospace;
  --font-body: 'Rajdhani', sans-serif;
  --color-primary: #00e5ff;
  --color-danger: #ff3d71;
  --color-gold: #ffd740;
  --color-success: #00e676;
  --color-dark: #080c10;
  --color-surface: #0d1117;
  --color-border: rgba(0, 229, 255, 0.2);
  --glow-primary: 0 0 20px rgba(0, 229, 255, 0.4);
  --glow-danger: 0 0 20px rgba(255, 61, 113, 0.4);
}

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  background: #080c10;
  overflow: hidden;
}

.scanlines-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 9999;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 229, 255, 0.015) 2px,
    rgba(0, 229, 255, 0.015) 4px
  );
}

.vignette-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 9998;
  background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.7) 100%);
}

/* Screen transition */
.screen-fade-enter-active,
.screen-fade-leave-active {
  transition: all 0.4s ease;
}
.screen-fade-enter-from {
  opacity: 0;
  filter: brightness(2) blur(4px);
  transform: scale(1.02);
}
.screen-fade-leave-to {
  opacity: 0;
  filter: brightness(0) blur(8px);
  transform: scale(0.98);
}

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #080c10; }
::-webkit-scrollbar-thumb { background: var(--color-primary); border-radius: 2px; }

/* Global text glitch animation */
@keyframes glitch {
  0%, 90%, 100% { transform: translate(0); clip-path: none; }
  92% { transform: translate(-2px, 1px); }
  94% { transform: translate(2px, -1px); }
  96% { transform: translate(-1px, 2px); }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes scan-line {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}

.text-glitch {
  animation: glitch 4s infinite;
}

.glow-text {
  text-shadow: 0 0 10px var(--color-primary), 0 0 20px rgba(0, 229, 255, 0.5);
}

.glow-danger {
  text-shadow: 0 0 10px var(--color-danger), 0 0 20px rgba(255, 61, 113, 0.5);
}

/* Vuetify overrides */
.v-application {
  font-family: var(--font-body) !important;
}

.v-btn {
  font-family: var(--font-display) !important;
  letter-spacing: 0.1em !important;
}

.hal-border {
  border: 1px solid var(--color-border);
  box-shadow: inset 0 0 30px rgba(0, 229, 255, 0.05), var(--glow-primary);
}

.danger-border {
  border: 1px solid rgba(255, 61, 113, 0.4);
  box-shadow: inset 0 0 30px rgba(255, 61, 113, 0.05), var(--glow-danger);
}
</style>
