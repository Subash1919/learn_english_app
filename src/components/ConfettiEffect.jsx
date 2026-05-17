import { useEffect, useState } from 'react'

const COLORS = ['#7c3aed', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899']
const EMOJIS = ['🎉', '⭐', '🌟', '✨', '🎊', '💫']

function Piece({ x, delay, isEmoji }) {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)]
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
  const duration = 2 + Math.random() * 1.5
  const size = 8 + Math.random() * 12

  if (isEmoji) {
    return (
      <div
        className="fixed top-0 pointer-events-none z-50 text-xl confetti-piece"
        style={{
          left: `${x}%`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        }}
      >
        {emoji}
      </div>
    )
  }

  return (
    <div
      className="fixed top-0 pointer-events-none z-50 rounded-sm confetti-piece"
      style={{
        left: `${x}%`,
        width: size,
        height: size / 2,
        backgroundColor: color,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    />
  )
}

export default function ConfettiEffect({ active }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (!active) { setPieces([]); return }
    const arr = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.8,
      isEmoji: i % 5 === 0,
    }))
    setPieces(arr)
    const t = setTimeout(() => setPieces([]), 4000)
    return () => clearTimeout(t)
  }, [active])

  if (!pieces.length) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map(p => <Piece key={p.id} {...p} />)}
    </div>
  )
}
