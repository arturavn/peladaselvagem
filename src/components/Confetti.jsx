import { useEffect, useState, useRef } from 'react'

const COLORS = ['#00FF87', '#00C96A', '#FFD700', '#FF9500', '#ffffff', '#00C9FF']
const COUNT = 90

function randomBetween(a, b) {
  return a + Math.random() * (b - a)
}

export default function Confetti({ active }) {
  const [particles, setParticles] = useState([])
  const firedRef = useRef(false)

  useEffect(() => {
    if (!active || firedRef.current) return
    firedRef.current = true

    const items = Array.from({ length: COUNT }, (_, i) => ({
      id: i,
      x: randomBetween(0, 100),
      delay: randomBetween(0, 1.2),
      duration: randomBetween(1.4, 2.8),
      size: randomBetween(5, 11),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: randomBetween(0, 360),
      rotationSpeed: randomBetween(180, 540),
      shape: Math.random() > 0.45 ? 'rect' : 'circle',
      scaleX: Math.random() > 0.5 ? randomBetween(0.3, 0.7) : 1,
    }))

    setParticles(items)

    // Clean up after animations finish
    const timeout = setTimeout(() => {
      setParticles([])
      firedRef.current = false
    }, 4000)

    return () => clearTimeout(timeout)
  }, [active])

  if (!active && particles.length === 0) return null

  return (
    <div className="confetti-container" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.x}%`,
            width: p.shape === 'rect' ? p.size * p.scaleX : p.size,
            height: p.size,
            borderRadius: p.shape === 'circle' ? '50%' : '1px',
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}
