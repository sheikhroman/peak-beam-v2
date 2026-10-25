// Tiny WebAudio engine hum — no audio files needed. Created lazily on the
// first user gesture (browsers block audio before that), so importing this
// module never autoplays anything.
let ctx: AudioContext | null = null
let osc: OscillatorNode | null = null
let gain: GainNode | null = null
let started = false

function ensure() {
  if (started) return
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC()
    osc = ctx.createOscillator()
    gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 900
    osc.type = 'sawtooth'
    osc.frequency.value = 60
    gain.gain.value = 0
    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    started = true
  } catch {
    // Audio unavailable — the game stays silent, never crashes.
  }
}

if (typeof window !== 'undefined') {
  const wake = () => {
    ensure()
    if (ctx && ctx.state === 'suspended') void ctx.resume()
  }
  window.addEventListener('pointerdown', wake, { once: false })
  window.addEventListener('keydown', wake, { once: false })
}

/** Call every frame with the car's km/h speed. Safe to call before audio starts. */
export function updateEngine(speedKmh: number, boosting: boolean, muted: boolean, paused: boolean) {
  if (!started || !ctx || !osc || !gain) return
  if (ctx.state === 'suspended') return
  const target = muted || paused ? 0 : 0.035 + (boosting ? 0.02 : 0)
  gain.gain.setTargetAtTime(target, ctx.currentTime, 0.1)
  const freq = 55 + speedKmh * 0.9 + (boosting ? 45 : 0)
  osc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.08)
}
