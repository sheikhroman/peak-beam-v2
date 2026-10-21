import { create } from 'zustand'

interface GameState {
  /** km/h, synced from the car at ~10Hz */
  speed: number
  /** 0..100 */
  nitro: number
  /** 0..100 */
  damage: number
  /** timestamp (ms) of last guardrail impact, for the red flash */
  lastImpact: number
  set: (p: Partial<GameState>) => void
  resetDamage: () => void
}

export const useGame = create<GameState>((set) => ({
  speed: 0,
  nitro: 100,
  damage: 0,
  lastImpact: 0,
  set: (p) => set(p),
  resetDamage: () => set({ damage: 0 }),
}))
