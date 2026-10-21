import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { KeyboardControls, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Car } from './Car'
import { Track } from './Track'

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
  return (
    <KeyboardControls map={keyMap}>
      <Canvas
        shadows
        camera={{ fov: 62, near: 0.1, far: 800, position: [55, 5, 14] }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#05070f']} />
        <fog attach="fog" args={['#05070f', 70, 320]} />

        <ambientLight intensity={0.4} />
        <directionalLight
          position={[50, 70, 25]}
          intensity={1.1}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-90}
          shadow-camera-right={90}
          shadow-camera-top={90}
          shadow-camera-bottom={-90}
        />
        {/* moon-ish fill from the other side */}
        <directionalLight position={[-40, 30, -30]} intensity={0.25} color="#7dd3fc" />

        <Stars radius={320} depth={60} count={4500} factor={4} fade speed={0.4} />

        <Physics gravity={[0, -24, 0]}>
          <Track />
          <Car />
        </Physics>

        <EffectComposer>
          <Bloom
            intensity={0.75}
            luminanceThreshold={0.5}
            luminanceSmoothing={0.25}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </KeyboardControls>
  )
}
