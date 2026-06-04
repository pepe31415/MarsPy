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
    let hasError = false
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
      execLimit: 10000, // 10 second execution limit
    })

    const promise = window.Sk.misceval.asyncToPromise(() =>
      window.Sk.importMainWithBody('<stdin>', false, code, true)
    )

    promise.then(
      () => {
        resolve({ output: output.trim(), error: null, success: true })
      },
      (err: any) => {
        hasError = true
        errorMsg = err.toString()
        resolve({ output: output.trim(), error: errorMsg, success: false })
      }
    )
  })
}

export function speakText(text: string, lang = 'es-ES') {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()

  // Strip markdown and clean up text for speech
  const cleanText = text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/\[PUNTUACION:\s*\d+\]/gi, '')
    .replace(/ACCESO CONCEDIDO/gi, 'Acceso concedido')
    .substring(0, 1000) // Limit speech length

  const utterance = new SpeechSynthesisUtterance(cleanText)
  utterance.lang = lang
  utterance.pitch = 0.4
  utterance.rate = 0.9

  window.speechSynthesis.speak(utterance)
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
