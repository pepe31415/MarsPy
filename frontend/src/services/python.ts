// Skulpt Python execution in the browser

declare global {
  interface Window {
    Sk: any
  }
}

export interface ExecutionResult {
  output: string
  error: string | null
  success: boolean
}

export async function executePython(code: string): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    let output = ''
    let errorMsg = ''

    if (!window.Sk) {
      resolve({
        output: '',
        error: 'Skulpt no está disponible. Recarga la página.',
        success: false,
      })
      return
    }

    window.Sk.configure({
      output: (text: string) => {
        output += text
      },
      read: (x: string) => {
        if (
          window.Sk.builtinFiles === undefined ||
          window.Sk.builtinFiles['files'][x] === undefined
        ) {
          throw new Error(`File not found: ${x}`)
        }
        return window.Sk.builtinFiles['files'][x]
      },
      execLimit: 10000,
    })

    const promise = window.Sk.misceval.asyncToPromise(() =>
      window.Sk.importMainWithBody('<stdin>', false, code, true)
    )

    promise.then(
      () => {
        resolve({ output: output.trim(), error: null, success: true })
      },
      (err: any) => {
        errorMsg = err.toString()
        resolve({ output: output.trim(), error: errorMsg, success: false })
      }
    )
  })
}

// ── Prepara texto para el sintetizador de voz ────────────────────────────────
// Se aplica a cada fragmento DESPUÉS del split, para no destruir las etiquetas
// [PAUSA] y [PAUSA_LARGA] antes de que sean procesadas.
function prepararTextoParaVoz(text: string): string {
  return text
    // ── Pronunciación de términos técnicos ──────────────────
    .replace(/\bPython\b/gi, 'Paiton')
    .replace(/\bwhile\b/g, 'güail')
    .replace(/\bTrue\b/g, 'Tru')
    .replace(/\bFalse\b/g, 'Fols')
    .replace(/\bNone\b/g, 'Non')
    .replace(/\brange\b/g, 'reinch')
    .replace(/\breturn\b/g, 'ritörn')
    .replace(/\bHAL\b/g, 'Hal')
    .replace(/\bMarsPy\b/g, 'Mars Pai')

    // ── Símbolos que el sintetizador lee mal ─────────────────
    .replace(/:/g, ',')
    .replace(/\(/g, ' ')
    .replace(/\)/g, ' ')
    .replace(/\[/g, ' ')
    .replace(/\]/g, ' ')
    .replace(/\{/g, ' ')
    .replace(/\}/g, ' ')
    .replace(/==/g, 'es igual a')
    .replace(/!=/g, 'es distinto de')
    .replace(/>=/g, 'mayor o igual que')
    .replace(/<=/g, 'menor o igual que')
    .replace(/>/g, 'mayor que')
    .replace(/<(?!br)/g, 'menor que')
    .replace(/=(?!=)/g, 'igual')
    .replace(/\+/g, 'más')
    .replace(/\-/g, 'menos')
    .replace(/\*/g, 'por')
    .replace(/\//g, 'entre')
    .replace(/%/g, 'módulo')
    .replace(/_/g, ' ')
    .replace(/"/g, '')
    .replace(/'/g, '')
    .replace(/,\s*,/g, ',')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
// Variables para permitir cancelar el speech actual cuando se pulsa el botón de pasar.
let speakCancelled = false
let activeSpeakTimer: ReturnType<typeof setTimeout> | null = null

export function cancelSpeech() {
  speakCancelled = true
  if (activeSpeakTimer !== null) {
    clearTimeout(activeSpeakTimer)
    activeSpeakTimer = null
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}
export function speakText(text: string, lang = 'es-ES'): Promise<void> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve()
      return
    }
    // Resetea el flag de cancelar speech al iniciar un nuevo speech
    speakCancelled = false
    window.speechSynthesis.cancel()

    // 1. Limpia markdown y etiquetas de puntuación de IA
    //    NO aplicamos prepararTextoParaVoz aquí todavía,
    //    porque necesitamos que [PAUSA] y [PAUSA_LARGA] sobrevivan al split
    const cleanText = text
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`{3}[\s\S]*?`{3}/g, '')
      .replace(/`/g, '')
      .replace(/\[PUNTUACION:\s*\d+\]/gi, '')
      .replace(/ACCESO CONCEDIDO/gi, 'Acceso concedido')
      .substring(0, 1500)

    // 2. Split en fragmentos usando las etiquetas de pausa como delimitadores
    //    [PAUSA] y [PAUSA_LARGA] siguen intactas en cleanText aquí
    const fragments = cleanText
      .split(/(\[PAUSA\]|\[PAUSA_LARGA\]|\n|(?<=[.!?])\s+)/)
      .map(f => f.trim())
      .filter(f => f.length > 0 && f !== '[PAUSA]' && f !== '[PAUSA_LARGA]')

    // 3. Calcula la pausa antes de cada fragmento buscando el delimitador previo
    const pauses: number[] = []
    let remaining = cleanText
    for (const fragment of fragments) {
      const idx = remaining.indexOf(fragment)
      const before = remaining.substring(0, idx)
      if (before.includes('[PAUSA_LARGA]')) {
        pauses.push(1000)
      } else if (before.includes('[PAUSA]')) {
        pauses.push(500)
      } else if (before.includes('\n')) {
        pauses.push(350)
      } else if (/[.!?]\s*$/.test(before)) {
        pauses.push(200)
      } else {
        pauses.push(0)
      }
      remaining = remaining.substring(idx + fragment.length)
    }

    if (fragments.length === 0) {
      resolve()
      return
    }

    let currentIndex = 0

    function speakNext() {
      // comprobamos el flag de cancelación del speech y salimos.
      if (speakCancelled) {
        resolve()
        return
      }
      if (currentIndex >= fragments.length) {
        resolve()
        return
      }

      const fragment = fragments[currentIndex]
      const pause = pauses[currentIndex] || 0
      currentIndex++

         // Guarda el timer para poder cancelarlo desde fuera
      activeSpeakTimer = setTimeout(() => {
        activeSpeakTimer = null

        // Comprueba de nuevo después del delay por si se canceló durante la pausa
        if (speakCancelled) {
          resolve()
          return
        }

        const textoLimpio = prepararTextoParaVoz(fragment)
        if (!textoLimpio.trim()) {
          speakNext()
          return
        }

        const utterance = new SpeechSynthesisUtterance(textoLimpio)
        utterance.lang = lang
        utterance.pitch = 0.4
        utterance.rate = 0.82
        utterance.onend = speakNext
        utterance.onerror = speakNext
        window.speechSynthesis.speak(utterance)
      }, pause)
    }

    speakNext()
  })
}

export function parseAiResponse(response: string): {
  cleanText: string
  score: number | null
  passed: boolean
} {
  const scoreMatch = response.match(/\[PUNTUACION:\s*(\d+)\]/i)
  const score = scoreMatch ? parseInt(scoreMatch[1]) : null
  const passed = /ACCESO CONCEDIDO/i.test(response)
  const cleanText = response.replace(/\[PUNTUACION:\s*\d+\]/gi, '').trim()

  return { cleanText, score, passed }
}
