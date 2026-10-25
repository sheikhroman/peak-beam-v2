import { create } from 'zustand'

export type DayMode = 'day' | 'night'

export interface CarSpec {
  name: string
  color: string
  /** multiplier on acceleration */
  accel: number
  /** multiplier on top speed */
  topSpeed: number
  /** multiplier on steering grip */
  grip: number
}

export const CARS: CarSpec[] = [
  { name: 'Crimson GT', color: '#e11d48', accel: 1.0, topSpeed: 1.0, grip: 1.0 },
  { name: 'Azure R', color: '#2563eb', accel: 0.94, topSpeed: 1.08, grip: 0.96 },
  { name: 'Venom', color: '#16a34a', accel: 1.1, topSpeed: 0.93, grip: 1.04 },
  { name: 'Solaris', color: '#f59e0b', accel: 1.02, topSpeed: 1.0, grip: 1.1 },
  { name: 'Ghost', color: '#cbd5e1', accel: 0.9, topSpeed: 1.12, grip: 0.9 },
  { name: 'Onyx', color: '#7c3aed', accel: 1.06, topSpeed: 0.97, grip: 1.02 },
]

interface GameState {
  /** km/h, synced from the car at ~10Hz */
  speed: number
  /** 0..100 */
  nitro: number
  /** 0..100 */
  damage: number
  /** timestamp (ms) of last guardrail impact, for the red flash */
  lastImpact: number
  mode: DayMode
  carIndex: number
  /** current lap, starting at 1 */
  lap: number
  /** ms elapsed in the current lap, synced at ~10Hz */
  lapTime: number
  /** last completed lap in ms, or null */
  lastLap: number | null
  /** best completed lap in ms, or null */
  bestLap: number | null
  paused: boolean
  muted: boolean
  /** car position on the ring, synced at ~10Hz, for the minimap */
  posX: number
  posZ: number
  /** increments when the HUD asks for a full race restart */
  resetToken: number
  set: (p: Partial<GameState>) => void
  toggleMode: () => void
  setCar: (i: number) => void
  resetDamage: () => void
  togglePause: () => void
  toggleMute: () => void
  requestReset: () => void
}

export const useGame = create<GameState>((set) => ({
  speed: 0,
  nitro: 100,
  damage: 0,
  lastImpact: 0,
  mode: 'day',
  carIndex: 0,
  lap: 1,
  lapTime: 0,
  lastLap: null,
  bestLap: null,
  paused: false,
  muted: false,
  posX: 55,
  posZ: 0,
  resetToken: 0,
  set: (p) => set(p),
  toggleMode: () => set((s) => ({ mode: s.mode === 'day' ? 'night' : 'day' })),
  setCar: (i) => set({ carIndex: Math.max(0, Math.min(CARS.length - 1, i)) }),
  resetDamage: () => set({ damage: 0 }),
  togglePause: () => set((s) => ({ paused: !s.paused })),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  requestReset: () => set((s) => ({ resetToken: s.resetToken + 1 })),
}))
