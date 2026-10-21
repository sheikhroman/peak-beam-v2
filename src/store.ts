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
  set: (p: Partial<GameState>) => void
  toggleMode: () => void
  setCar: (i: number) => void
  resetDamage: () => void
}

export const useGame = create<GameState>((set) => ({
  speed: 0,
  nitro: 100,
  damage: 0,
  lastImpact: 0,
  mode: 'night',
  carIndex: 0,
  set: (p) => set(p),
  toggleMode: () => set((s) => ({ mode: s.mode === 'day' ? 'night' : 'day' })),
  setCar: (i) => set({ carIndex: Math.max(0, Math.min(CARS.length - 1, i)) }),
  resetDamage: () => set({ damage: 0 }),
}))
