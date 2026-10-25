import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { KeyboardControls, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Car } from './Car'
import { Track } from './Track'
import { useGame } from '../store'

export type Controls = 'forward' | 'back' | 'left' | 'right' | 'drift' | 'nitro' | 'reset'

const keyMap: { name: Controls; keys: string[] }[] = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'back', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'drift', keys: ['Space'] },
  { name: 'nitro', keys: ['ShiftLeft', 'ShiftRight'] },
  { name: 'reset', keys: ['KeyR'] },
]

export function Experience() {
  const night = useGame((s) => s.mode) === 'night'
  const paused = useGame((s) => s.paused)

  return (
    <KeyboardControls map={keyMap}>
      <Canvas
        shadows
        camera={{ fov: 62, near: 0.1, far: 800, position: [55, 5, 14] }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={[night ? '#05070f' : '#7ba7d4']} />
        <fog attach="fog" args={[night ? '#05070f' : '#a8c4e0', 70, 340]} />

        <ambientLight intensity={night ? 0.4 : 0.8} />
        <directionalLight
          position={[50, 70, 25]}
          intensity={night ? 1.1 : 2.0}
          color={night ? '#cfe8ff' : '#fff2df'}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-90}
          shadow-camera-right={90}
          shadow-camera-top={90}
          shadow-camera-bottom={-90}
        />
        {/* cool fill light */}
        <directionalLight
          position={[-40, 30, -30]}
          intensity={night ? 0.25 : 0.4}
          color="#7dd3fc"
        />

        {night && (
          <Stars radius={320} depth={60} count={4500} factor={4} fade speed={0.4} />
        )}

        <Physics gravity={[0, -24, 0]} paused={paused}>
          <Track />
          <Car />
        </Physics>

        <EffectComposer>
          <Bloom
            intensity={night ? 0.75 : 0.25}
            luminanceThreshold={night ? 0.5 : 0.75}
            luminanceSmoothing={0.25}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </KeyboardControls>
  )
}
