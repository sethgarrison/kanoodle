import React, { useEffect, useState } from 'react'

function Confetti() {
  const [confetti, setConfetti] = useState([])

  useEffect(() => {
    // Create confetti pieces
    const pieces = []
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd']
    
    for (let i = 0; i < 200; i++) {
      pieces.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 10,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 25 - 15, // Much higher initial velocity
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 6,
        shape: Math.random() > 0.5 ? 'circle' : 'square'
      })
    }
    
    setConfetti(pieces)

    // Animate confetti
    const interval = setInterval(() => {
      setConfetti(prev => 
        prev.map(piece => ({
          ...piece,
          x: piece.x + piece.vx,
          y: piece.y + piece.vy,
          vy: piece.vy + 0.2, // Slightly slower gravity for longer animation
          rotation: piece.rotation + piece.rotationSpeed
        })).filter(piece => piece.y < window.innerHeight + 200) // Keep pieces longer
      )
    }, 16) // ~60fps

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="confetti-container">
      {confetti.map(piece => (
        <div
          key={piece.id}
          className={`confetti-piece ${piece.shape}`}
          style={{
            left: `${piece.x}px`,
            top: `${piece.y}px`,
            backgroundColor: piece.color,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            transform: `rotate(${piece.rotation}deg)`,
            position: 'fixed',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        />
      ))}
    </div>
  )
}

export default Confetti 