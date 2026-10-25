import { Gauge, Zap, Wrench, Sun, Moon, Pause, Play, Volume2, VolumeX, RotateCcw, Flag, Timer } from 'lucide-react'
import { CARS, useGame } from '../store'

function fmt(ms: number | null) {
  if (ms === null) return '--:--.---'
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const t = ms % 1000
  return `${m}:${String(s).padStart(2, '0')}.${String(t).padStart(3, '0')}`
}

export function HUD() {
  const speed = useGame((s) => s.speed)
  const nitro = useGame((s) => s.nitro)
  const damage = useGame((s) => s.damage)
  const lastImpact = useGame((s) => s.lastImpact)
  const mode = useGame((s) => s.mode)
  const toggleMode = useGame((s) => s.toggleMode)
  const carIndex = useGame((s) => s.carIndex)
  const setCar = useGame((s) => s.setCar)
  const lap = useGame((s) => s.lap)
  const lapTime = useGame((s) => s.lapTime)
  const lastLap = useGame((s) => s.lastLap)
  const bestLap = useGame((s) => s.bestLap)
  const paused = useGame((s) => s.paused)
  const togglePause = useGame((s) => s.togglePause)
  const muted = useGame((s) => s.muted)
  const toggleMute = useGame((s) => s.toggleMute)
  const requestReset = useGame((s) => s.requestReset)
  const posX = useGame((s) => s.posX)
  const posZ = useGame((s) => s.posZ)
  const showFlash = Date.now() - lastImpact < 700
  // minimap: ring radius 62 -> 46px, start line at +x (right)
  const dotX = 60 + (posX / 62) * 46
  const dotY = 60 + (posZ / 62) * 46

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
        <div><Key>P</Key> pause</div>
        <div><Key>M</Key> sound</div>
      </div>

      {/* lap + minimap */}
      <div className="absolute right-5 top-44 rounded-lg bg-black/45 p-3 backdrop-blur-sm">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-white/80">
          <Flag size={12} className="text-cyan-300" /> LAP {lap}
        </div>
        <div className="mt-1 flex items-center gap-1.5 font-mono text-sm tabular-nums text-white">
          <Timer size={13} className="text-white/50" /> {fmt(lapTime)}
        </div>
        <div className="mt-1 text-[10px] tabular-nums text-white/50">
          LAST {fmt(lastLap)} · BEST {fmt(bestLap)}
        </div>
        <svg width="120" height="120" viewBox="0 0 120 120" className="mt-2">
          <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="10" />
          <line x1="106" y1="60" x2="106" y2="60" stroke="#f8fafc" strokeWidth="3" />
          <circle cx={dotX} cy={dotY} r="5" fill={CARS[carIndex].color} stroke="#fff" strokeWidth="1.5" />
        </svg>
        <div className="pointer-events-auto mt-1 flex gap-2">
          <button onClick={togglePause} title="Pause (P)" className="flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-[11px] font-bold text-white hover:bg-white/20">
            {paused ? <Play size={12} /> : <Pause size={12} />} {paused ? 'RESUME' : 'PAUSE'}
          </button>
          <button onClick={toggleMute} title="Sound (M)" className="flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-[11px] font-bold text-white hover:bg-white/20">
            {muted ? <VolumeX size={12} /> : <Volume2 size={12} />} {muted ? 'MUTED' : 'SOUND'}
          </button>
        </div>
      </div>

      {/* pause overlay */}
      {paused && (
        <div className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center bg-black/65 backdrop-blur-sm">
          <div className="text-5xl font-black tracking-[0.3em] text-white">PAUSED</div>
          <p className="mt-2 text-sm text-white/60">Lap {lap} · {fmt(lapTime)} · Damage {damage}%</p>
          <div className="mt-6 flex gap-3">
            <button onClick={togglePause} className="flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-bold text-black hover:bg-cyan-300">
              <Play size={16} /> Resume
            </button>
            <button onClick={() => { requestReset(); togglePause() }} className="flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">
              <RotateCcw size={16} /> Restart race
            </button>
          </div>
          <p className="mt-4 text-xs text-white/40">Press P to resume</p>
        </div>
      )}

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
