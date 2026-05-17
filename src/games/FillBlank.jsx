import { useState } from 'react'
import { FILL_BLANK } from '../data/lessons'
import { addXP, addWeakWord } from '../storage'
import ConfettiEffect from '../components/ConfettiEffect'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

export default function FillBlank({ onBack }) {
  const [questions] = useState(() => shuffle(FILL_BLANK).slice(0, 8))
  const [idx, setIdx] = useState(0)
  const [chosen, setChosen] = useState(null)
  const [score, setScore] = useState(0)
  const [confetti, setConfetti] = useState(false)
  const [done, setDone] = useState(false)

  const q = questions[idx]
  const [parts] = useState(() => null)

  function handleChoice(opt) {
    if (chosen) return
    setChosen(opt)
    if (opt === q.answer) {
      setScore(s => s + 1)
      addXP(10)
      setConfetti(true)
      setTimeout(() => setConfetti(false), 1500)
    } else {
      addWeakWord({ id: q.answer, english: q.answer, tamil: q.tamil })
    }
    setTimeout(() => {
      if (idx + 1 >= questions.length) setDone(true)
      else { setIdx(i => i + 1); setChosen(null) }
    }, 1600)
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <ConfettiEffect active={pct >= 70} />
        <div className="text-7xl mb-4">{pct >= 70 ? '🎊' : '📝'}</div>
        <h2 className="text-2xl font-extrabold text-purple-700 font-tamil mb-2">முடிந்தது!</h2>
        <div className="bg-purple-50 rounded-2xl p-6 w-full mb-6">
          <p className="text-5xl font-extrabold text-purple-700 mb-1">{score}/{questions.length}</p>
          <p className="text-gray-500 font-tamil">சரியான விடைகள் — {pct}%</p>
          <p className="text-yellow-600 font-bold mt-2 font-tamil">+{score * 10} XP!</p>
        </div>
        <button onClick={onBack} className="bg-purple-600 text-white font-bold px-8 py-4 rounded-2xl card-shadow btn-press w-full">
          திரும்பு
        </button>
      </div>
    )
  }

  const sentenceParts = q.sentence.split('___')

  return (
    <div className="flex flex-col px-4 pt-4 min-h-[80vh]">
      <ConfettiEffect active={confetti} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-2xl p-1">←</button>
        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="progress-bar h-full" style={{ width: `${(idx / questions.length) * 100}%` }} />
        </div>
        <span className="text-sm text-gray-500 font-semibold">{idx + 1}/{questions.length}</span>
      </div>

      <h3 className="text-purple-700 font-bold font-tamil text-center mb-2 text-sm">சரியான வார்த்தையை தேர்ந்தெடு</h3>
      <p className="text-gray-400 text-xs text-center font-tamil mb-6">Choose the correct word</p>

      {/* Sentence display */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-6 text-center mb-4">
        <p className="text-white text-xl font-bold leading-relaxed">
          {sentenceParts[0]}
          <span className={`inline-block px-3 py-1 rounded-lg mx-1 font-extrabold text-xl ${
            chosen
              ? chosen === q.answer
                ? 'bg-green-400 text-white'
                : 'bg-red-400 text-white'
              : 'bg-yellow-300 text-purple-900'
          }`}>
            {chosen || '______'}
          </span>
          {sentenceParts[1]}
        </p>
      </div>

      {/* Tamil hint */}
      <div className="bg-purple-50 rounded-xl px-4 py-2 text-center mb-8">
        <p className="text-purple-600 text-sm font-tamil">{q.tamil.replace('___', chosen || '___')}</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {q.options.map(opt => {
          let style = 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-400 hover:bg-purple-50'
          if (chosen) {
            if (opt === q.answer) style = 'bg-green-100 border-2 border-green-400 text-green-700'
            else if (opt === chosen) style = 'bg-red-100 border-2 border-red-400 text-red-700'
            else style = 'bg-gray-50 border-2 border-gray-100 text-gray-300'
          }
          return (
            <button
              key={opt}
              onClick={() => handleChoice(opt)}
              disabled={!!chosen}
              className={`${style} font-bold text-lg py-4 rounded-2xl transition-all btn-press`}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {chosen && (
        <div className={`mt-6 text-center font-bold font-tamil text-lg ${chosen === q.answer ? 'text-green-600' : 'text-red-500'}`}>
          {chosen === q.answer ? 'சரியான விடை! 🎉' : `சரியான விடை: "${q.answer}" 💡`}
        </div>
      )}
    </div>
  )
}
