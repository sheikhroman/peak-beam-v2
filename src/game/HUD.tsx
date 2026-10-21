import { Gauge, Zap, Wrench, Sun, Moon } from 'lucide-react'
import { CARS, useGame } from '../store'

export function HUD() {
  const speed = useGame((s) => s.speed)
  const nitro = useGame((s) => s.nitro)
  const damage = useGame((s) => s.damage)
  const lastImpact = useGame((s) => s.lastImpact)
  const mode = useGame((s) => s.mode)
  const toggleMode = useGame((s) => s.toggleMode)
  const carIndex = useGame((s) => s.carIndex)
  const setCar = useGame((s) => s.setCar)
  const showFlash = Date.now() - lastImpact < 700

  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      {showFlash && <div className="absolute inset-0 bg-red-500/25" />}

      {/* title */}
      <div className="absolute left-5 top-5">
        <h1 className="text-2xl font-black tracking-[0.3em] text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]">
          PEAK BEAM
        </h1>
        <p className="mt-1 text-[11px] uppercase tracking-widest text-white/40">
          Wangan Expressway — v2 prototype
        </p>
      </div>

      {/* day / night toggle */}
      <button
        onClick={toggleMode}
        className="pointer-events-auto absolute left-5 top-24 flex items-center gap-2 rounded-lg bg-black/45 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-black/65"
        title="Day / night"
      >
        {mode === 'night' ? (
          <>
            <Sun size={15} className="text-amber-300" /> DAY
          </>
        ) : (
          <>
            <Moon size={15} className="text-sky-300" /> NIGHT
          </>
        )}
      </button>

      {/* car variants */}
      <div className="absolute left-5 top-36 rounded-lg bg-black/45 p-3 backdrop-blur-sm">
        <div className="mb-2 text-[11px] font-bold tracking-wider text-white/80">
          {CARS[carIndex].name.toUpperCase()}
        </div>
        <div className="pointer-events-auto flex gap-2">
          {CARS.map((c, i) => (
            <button
              key={c.name}
              onClick={() => setCar(i)}
              title={`${c.name} (${i + 1})`}
              className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                i === carIndex
                  ? 'border-white shadow-[0_0_10px_rgba(255,255,255,0.7)]'
                  : 'border-white/20'
              }`}
              style={{ backgroundColor: c.color }}
            />
          ))}
        </div>
        <div className="mt-2 text-[10px] text-white/40">keys 1–6</div>
      </div>

      {/* controls help */}
      <div className="absolute right-5 top-5 rounded-lg bg-black/45 p-3 text-[11px] leading-5 text-white/70 backdrop-blur-sm">
        <div><Key>W A S D</Key> drive</div>
        <div><Key>SPACE</Key> drift</div>
        <div><Key>SHIFT</Key> nitro</div>
        <div><Key>R</Key> reset</div>
      </div>

      {/* speed */}
      <div className="absolute bottom-7 left-6 flex items-end gap-2 text-white">
        <Gauge className="mb-2 text-cyan-300" size={22} />
        <span className="text-6xl font-black tabular-nums leading-none drop-shadow-[0_0_16px_rgba(34,211,238,0.6)]">
          {speed}
        </span>
        <span className="mb-1 text-sm text-white/50">km/h</span>
      </div>

      {/* nitro + damage bars */}
      <div className="absolute bottom-7 right-6 w-60 space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-[11px] text-white/70">
            <span className="flex items-center gap-1">
              <Zap size={12} className="text-cyan-300" /> NITRO
            </span>
            <span className="tabular-nums">{nitro}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)] transition-[width] duration-150"
              style={{ width: `${nitro}%` }}
            />
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-[11px] text-white/70">
            <span className="flex items-center gap-1">
              <Wrench size={12} className="text-red-400" /> DAMAGE
            </span>
            <span className="tabular-nums">{damage}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)] transition-[width] duration-150"
              style={{ width: `${damage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <span className="mr-1 inline-block min-w-14 rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
      {children}
    </span>
  )
}
