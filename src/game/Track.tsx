import { CuboidCollider, RigidBody } from '@react-three/rapier'

const R_OUT = 62
const R_IN = 48
const R_MID = (R_OUT + R_IN) / 2
const RAIL_SEGS = 44

interface Rail {
  pos: [number, number, number]
  rotY: number
}

const rails: Rail[] = []
for (let i = 0; i < RAIL_SEGS; i++) {
  const a = (i / RAIL_SEGS) * Math.PI * 2
  for (const r of [R_OUT + 1.2, R_IN - 1.2]) {
    rails.push({
      pos: [Math.cos(a) * r, 0.7, Math.sin(a) * r],
      rotY: -a - Math.PI / 2,
    })
  }
}

export function Track() {
  return (
    <group>
      {/* ground */}
      <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#14201a" roughness={1} />
      </mesh>
      <CuboidCollider args={[250, 0.5, 250]} position={[0, -0.55, 0]} />

      {/* asphalt ring */}
      <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <ringGeometry args={[R_IN, R_OUT, 72]} />
        <meshStandardMaterial color="#2b3038" roughness={0.95} />
      </mesh>

      {/* start / finish strip */}
      <mesh rotation-x={-Math.PI / 2} position={[R_MID, 0.035, 0]}>
        <planeGeometry args={[2.2, R_OUT - R_IN]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>

      {/* guardrails */}
      {rails.map((rail, i) => (
        <RigidBody
          key={i}
          type="fixed"
          colliders="cuboid"
          position={rail.pos}
          rotation={[0, rail.rotY, 0]}
        >
          <mesh castShadow>
            <boxGeometry args={[8.6, 1.1, 0.45]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#dc2626' : '#f8fafc'}
              roughness={0.6}
            />
          </mesh>
        </RigidBody>
      ))}

      {/* center island decoration */}
      <mesh position={[0, 2.5, 0]}>
        <coneGeometry args={[10, 26, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={1} flatShading />
      </mesh>
    </group>
  )
}
