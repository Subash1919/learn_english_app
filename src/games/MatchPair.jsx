import { useState, useEffect } from 'react'
import { lessons } from '../data/lessons'
import { addXP, addLearnedWord } from '../storage'
import ConfettiEffect from '../components/ConfettiEffect'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function getPairs() {
  const all = lessons.flatMap(l => l.words)
  return shuffle(all).slice(0, 6)
}

export default function MatchPair({ onBack }) {
  const [pairs] = useState(getPairs)
  const [leftSel, setLeftSel] = useState(null)
  const [rightSel, setRightSel] = useState(null)
  const [matched, setMatched] = useState([])
  const [wrong, setWrong] = useState([])
  const [confetti, setConfetti] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [rightItems] = useState(() => shuffle(pairs.map(p => ({ id: p.id, tamil: p.tamil }))))

  useEffect(() => {
    if (!leftSel || !rightSel) return
    if (leftSel === rightSel) {
      const word = pairs.find(p => p.id === leftSel)
      setMatched(m => [...m, leftSel])
      setScore(s => s + 1)
      addXP(10)
      addLearnedWord(word)
      if (matched.length + 1 >= pairs.length) {
        setConfetti(true)
        setTimeout(() => setDone(true), 1500)
      }
    } else {
      setWrong([leftSel, rightSel])
      setTimeout(() => setWrong([]), 800)
    }
    setTimeout(() => { setLeftSel(null); setRightSel(null) }, 600)
  }, [leftSel, rightSel])

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <ConfettiEffect active={confetti} />
        <div className="text-7xl mb-4">🎊</div>
        <h2 className="text-2xl font-extrabold text-purple-700 font-tamil mb-2">அருமை! எல்லாம் சரி!</h2>
        <div className="bg-purple-50 rounded-2xl p-6 w-full mb-6">
          <p className="text-5xl font-extrabold text-purple-700 mb-1">{pairs.length}/{pairs.length}</p>
          <p className="text-yellow-600 font-bold mt-2 font-tamil">+{pairs.length * 10} XP சம்பாதித்தீர்கள்!</p>
        </div>
        <button onClick={onBack} className="bg-purple-600 text-white font-bold px-8 py-4 rounded-2xl card-shadow btn-press w-full">
          திரும்பு
        </button>
      </div>
    )
  }

  function getLeftStyle(id) {
    if (matched.includes(id)) return 'bg-green-100 border-green-300 text-green-700 opacity-50'
    if (wrong.includes(id)) return 'bg-red-100 border-red-300 text-red-700'
    if (leftSel === id) return 'bg-purple-600 border-purple-600 text-white scale-105'
    return 'bg-white border-gray-200 text-gray-700 hover:border-purple-400 hover:bg-purple-50'
  }

  function getRightStyle(id) {
    if (matched.includes(id)) return 'bg-green-100 border-green-300 text-green-700 opacity-50'
    if (wrong.includes(id)) return 'bg-red-100 border-red-300 text-red-700'
    if (rightSel === id) return 'bg-yellow-400 border-yellow-400 text-purple-900 scale-105'
    return 'bg-white border-gray-200 text-gray-700 hover:border-yellow-400 hover:bg-yellow-50'
  }

  return (
    <div className="flex flex-col px-4 pt-4 min-h-[80vh]">
      <ConfettiEffect active={confetti} />

      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-2xl p-1">←</button>
        <h3 className="text-lg font-extrabold text-gray-800 flex-1">ஜோடி பொருத்தவும்</h3>
        <span className="bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-full text-sm">
          {matched.length}/{pairs.length}
        </span>
      </div>

      <p className="text-center text-gray-400 text-sm font-tamil mb-6">
        இடது பக்கம் ஆங்கிலம் → வலது பக்கம் தமிழ் பொருத்தவும்
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Left: English */}
        <div className="flex flex-col gap-3">
          {pairs.map(p => (
            <button
              key={p.id}
              onClick={() => { if (!matched.includes(p.id)) setLeftSel(p.id) }}
              disabled={matched.includes(p.id)}
              className={`border-2 rounded-2xl p-3 font-bold text-sm text-center transition-all btn-press ${getLeftStyle(p.id)}`}
            >
              <span className="text-xl block mb-1">{p.emoji}</span>
              {p.english}
            </button>
          ))}
        </div>

        {/* Right: Tamil */}
        <div className="flex flex-col gap-3">
          {rightItems.map(r => (
            <button
              key={r.id}
              onClick={() => { if (!matched.includes(r.id)) setRightSel(r.id) }}
              disabled={matched.includes(r.id)}
              className={`border-2 rounded-2xl p-3 font-tamil font-bold text-sm text-center transition-all btn-press ${getRightStyle(r.id)}`}
            >
              {r.tamil}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
