import { Experience } from './game/Experience'
import { HUD } from './game/HUD'

export default function App() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <Experience />
      <HUD />
    </div>
  )
}
