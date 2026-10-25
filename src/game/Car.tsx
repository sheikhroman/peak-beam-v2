import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import { CARS, useGame } from '../store'
import type { Controls } from './Experience'
import { updateEngine } from './sound'

const tmpDir = new THREE.Vector3()
const tmpQuat = new THREE.Quaternion()
const tmpCam = new THREE.Vector3()

const ACCEL = 30
const NITRO_ACCEL = 62
const BRAKE = 34
const BASE_TOP_SPEED = 46 // m/s before multiplier (~165 km/h)

function resetCar(b: RapierRigidBody) {
  b.setTranslation({ x: 55, y: 1.4, z: 0 }, true)
  b.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
  b.setLinvel({ x: 0, y: 0, z: 0 }, true)
  b.setAngvel({ x: 0, y: 0, z: 0 }, true)
}

export function Car() {
  const body = useRef<RapierRigidBody>(null)
  const getKeys = useKeyboardControls<Controls>()[1]
  const carIndex = useGame((s) => s.carIndex)
  const spec = CARS[carIndex]
  const nitro = useRef(100)
  const lastHit = useRef(0)
  const frame = useRef(0)
  const prevCar = useRef(carIndex)
  const prevReset = useRef(useGame.getState().resetToken)
  const prevAngle = useRef(0)
  const totalAngle = useRef(0)
  const lapStart = useRef(performance.now())
  const spawnTime = useRef(performance.now())

  function resetRace(b: RapierRigidBody) {
    resetCar(b)
    spawnTime.current = performance.now()
    prevAngle.current = 0
    totalAngle.current = 0
    lapStart.current = performance.now()
    const s = useGame.getState()
    s.resetDamage()
    s.set({ lap: 1, lapTime: 0, posX: 55, posZ: 0 })
  }

  // keys 1..6 switch car variant, P pause, M mute
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const n = parseInt(e.key, 10)
      if (n >= 1 && n <= CARS.length) useGame.getState().setCar(n - 1)
      else if (e.key === 'p' || e.key === 'P') useGame.getState().togglePause()
      else if (e.key === 'm' || e.key === 'M') useGame.getState().toggleMute()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  useFrame((state, dtRaw) => {
    const b = body.current
    if (!b) return
    const dt = Math.min(dtRaw, 1 / 30)
    const k = getKeys()
    const gs = useGame.getState()

    // HUD-requested restart
    if (prevReset.current !== gs.resetToken) {
      prevReset.current = gs.resetToken
      resetRace(b)
    }

    // respawn at start line when the car variant changes
    if (prevCar.current !== carIndex) {
      prevCar.current = carIndex
      resetRace(b)
    }

    // --- chase camera (kept live even while paused) ---
    const pr = b.rotation()
    tmpQuat.set(pr.x, pr.y, pr.z, pr.w)
    const pp = b.translation()
    tmpCam.set(0, 4.4, 10.5).applyQuaternion(tmpQuat)
    state.camera.position.lerp(
      new THREE.Vector3(pp.x + tmpCam.x, pp.y + tmpCam.y, pp.z + tmpCam.z),
      1 - Math.pow(0.0005, dt),
    )
    state.camera.lookAt(pp.x, pp.y + 1.4, pp.z)

    if (gs.paused) {
      updateEngine(0, false, gs.muted, true)
      return
    }

    // forward vector from the body's orientation
    const r = b.rotation()
    tmpQuat.set(r.x, r.y, r.z, r.w)
    tmpDir.set(0, 0, -1).applyQuaternion(tmpQuat)

    const v = b.linvel()
    const speed = Math.hypot(v.x, v.z)
    const p0 = b.translation()

    // --- lap tracking: cumulative angle around the ring ---
    const ang = Math.atan2(p0.z, p0.x)
    let dAng = ang - prevAngle.current
    if (dAng > Math.PI) dAng -= Math.PI * 2
    if (dAng < -Math.PI) dAng += Math.PI * 2
    prevAngle.current = ang
    totalAngle.current += dAng
    if (Math.abs(totalAngle.current) >= Math.PI * 2) {
      const now = performance.now()
      const lapMs = Math.round(now - lapStart.current)
      lapStart.current = now
      totalAngle.current = 0
      const s = gs
      s.set({
        lap: s.lap + 1,
        lastLap: lapMs,
        bestLap: s.bestLap === null ? lapMs : Math.min(s.bestLap, lapMs),
      })
    }

    // --- damage actually hurts: top speed + accel fall as damage rises ---
    const handling = 1 - (gs.damage / 100) * 0.35
    const maxV = BASE_TOP_SPEED * spec.topSpeed * handling
    if (speed > maxV) {
      const s = maxV / speed
      b.setLinvel({ x: v.x * s, y: v.y, z: v.z * s }, true)
    }

    // --- throttle / nitro / brake ---
    const boosting = k.nitro && k.forward && nitro.current > 0.5
    if (k.forward) {
      const a = (boosting ? NITRO_ACCEL : ACCEL) * spec.accel * handling
      b.applyImpulse({ x: tmpDir.x * a * dt, y: 0, z: tmpDir.z * a * dt }, true)
    }
    if (k.back) {
      const a = speed > 2 ? BRAKE : 12
      b.applyImpulse({ x: -tmpDir.x * a * dt, y: 0, z: -tmpDir.z * a * dt }, true)
    }

    // --- arcade steering: yaw torque scaled by speed, looser while drifting ---
    const steer = (k.left ? 1 : 0) - (k.right ? 1 : 0)
    const authority = Math.min(speed / 9, 1)
    if (steer !== 0 && authority > 0.04) {
      const grip = (k.drift ? 0.45 : 1) * spec.grip
      b.applyTorqueImpulse({ x: 0, y: steer * 16 * authority * grip * dt, z: 0 }, true)
    }

    // --- nitro tank ---
    nitro.current = boosting
      ? Math.max(0, nitro.current - 30 * dt)
      : Math.min(100, nitro.current + 7 * dt)

    // --- manual reset ---
    if (k.reset) {
      resetRace(b)
    }

    // --- engine sound + HUD sync, throttled to ~10Hz ---
    const speedKmh = Math.round(Math.min(speed, maxV) * 3.6)
    updateEngine(speedKmh, boosting, gs.muted, false)
    frame.current += 1
    if (frame.current % 6 === 0) {
      const p = b.translation()
      useGame.getState().set({
        speed: speedKmh,
        nitro: Math.round(nitro.current),
        lapTime: Math.round(performance.now() - lapStart.current),
        posX: p.x,
        posZ: p.z,
      })
    }
  })

  return (
    <RigidBody
      ref={body}
      colliders="cuboid"
      position={[55, 1.4, 0]}
      linearDamping={0.55}
      angularDamping={2.2}
      enabledRotations={[false, true, false]}
      onCollisionEnter={() => {
        const now = performance.now()
        // Landing on the ground at spawn/reset is not a crash — ignore
        // collisions for the first 2 seconds after (re)spawning.
        if (now - spawnTime.current < 2000) return
        if (now - lastHit.current < 500) return
        lastHit.current = now
        const s = useGame.getState()
        s.set({ damage: Math.min(100, s.damage + 5), lastImpact: now })
      }}
    >
      {/* chassis — color follows the selected variant */}
      <mesh castShadow>
        <boxGeometry args={[2, 0.55, 4.2]} />
        <meshStandardMaterial color={spec.color} metalness={0.65} roughness={0.3} />
      </mesh>
      {/* cabin */}
      <mesh castShadow position={[0, 0.5, 0.35]}>
        <boxGeometry args={[1.5, 0.45, 1.9]} />
        <meshStandardMaterial color="#0b1220" metalness={0.5} roughness={0.15} />
      </mesh>
      {/* wheels */}
      {(
        [
          [-1, -1.35],
          [1, -1.35],
          [-1, 1.35],
          [1, 1.35],
        ] as const
      ).map(([x, z], i) => (
        <mesh key={i} position={[x, -0.32, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.32, 14]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
        </mesh>
      ))}
      {/* headlights — bright for the bloom pass */}
      {([-0.62, 0.62] as const).map((x, i) => (
        <mesh key={i} position={[x, 0.02, -2.12]}>
          <sphereGeometry args={[0.13, 10, 10]} />
          <meshBasicMaterial color="#fef9c3" toneMapped={false} />
        </mesh>
      ))}
      {/* tail lights */}
      {([-0.62, 0.62] as const).map((x, i) => (
        <mesh key={`t${i}`} position={[x, 0.02, 2.12]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshBasicMaterial color="#ef4444" toneMapped={false} />
        </mesh>
      ))}
    </RigidBody>
  )
}
