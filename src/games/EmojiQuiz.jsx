import { useState } from 'react'
import { lessons } from '../data/lessons'
import { addXP, addWeakWord, addLearnedWord } from '../storage'
import ConfettiEffect from '../components/ConfettiEffect'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function buildQuestions() {
  const all = lessons.flatMap(l => l.words).filter(w => !w.english.includes(' '))
  const picked = shuffle(all).slice(0, 8)
  return picked.map(word => {
    const others = shuffle(all.filter(w => w.id !== word.id)).slice(0, 3)
    const options = shuffle([word, ...others])
    return { word, options }
  })
}

export default function EmojiQuiz({ onBack }) {
  const [questions] = useState(buildQuestions)
  const [idx, setIdx] = useState(0)
  const [chosen, setChosen] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [score, setScore] = useState(0)
  const [confetti, setConfetti] = useState(false)
  const [done, setDone] = useState(false)

  const q = questions[idx]

  function handleChoice(opt) {
    if (chosen) return
    setChosen(opt)
    if (opt.id === q.word.id) {
      setScore(s => s + 1)
      addXP(10)
      addLearnedWord(q.word)
      setConfetti(true)
      setTimeout(() => setConfetti(false), 1500)
    } else {
      addWeakWord(q.word)
    }
    setTimeout(() => {
      if (idx + 1 >= questions.length) setDone(true)
      else { setIdx(i => i + 1); setChosen(null); setShowHint(false) }
    }, 1600)
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <ConfettiEffect active={pct >= 70} />
        <div className="text-7xl mb-4">{pct >= 70 ? '🥳' : '📝'}</div>
        <h2 className="text-2xl font-extrabold text-purple-700 font-tamil mb-4">முடிந்தது!</h2>
        <div className="bg-purple-50 rounded-2xl p-6 w-full mb-6">
          <p className="text-5xl font-extrabold text-purple-700 mb-1">{score}/{questions.length}</p>
          <p className="text-gray-500 font-tamil">{pct}% சரியான விடைகள்</p>
          <p className="text-yellow-600 font-bold mt-2 font-tamil">+{score * 10} XP!</p>
        </div>
        <button onClick={onBack} className="bg-purple-600 text-white font-bold px-8 py-4 rounded-2xl card-shadow btn-press w-full">
          திரும்பு
        </button>
      </div>
    )
  }

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

      {/* Emoji display */}
      <div className="flex flex-col items-center bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl p-8 mb-4">
        <span className="text-8xl mb-3 animate-bounce-in">{q.word.emoji}</span>
        <p className="text-gray-500 font-tamil text-sm">இந்த emoji என்ன ஆங்கில வார்த்தை?</p>
      </div>

      {/* Hint button */}
      <div className="text-center mb-4">
        {!showHint ? (
          <button
            onClick={() => setShowHint(true)}
            className="text-purple-500 hover:text-purple-700 text-sm font-tamil font-semibold bg-purple-50 px-4 py-2 rounded-xl"
          >
            💡 தமிழ் குறிப்பு
          </button>
        ) : (
          <div className="bg-purple-50 rounded-xl px-4 py-2 text-purple-700 font-tamil font-bold text-sm">
            💡 {q.word.tamil}
          </div>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {q.options.map(opt => {
          let style = 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-400 hover:bg-purple-50'
          if (chosen) {
            if (opt.id === q.word.id) style = 'bg-green-100 border-2 border-green-500 text-green-700'
            else if (opt.id === chosen.id) style = 'bg-red-100 border-2 border-red-400 text-red-700'
            else style = 'bg-gray-50 border-2 border-gray-100 text-gray-300'
          }
          return (
            <button
              key={opt.id}
              onClick={() => handleChoice(opt)}
              disabled={!!chosen}
              className={`${style} font-bold text-lg py-5 rounded-2xl transition-all btn-press`}
            >
              {opt.english}
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {chosen && (
        <div className={`mt-5 text-center font-bold font-tamil text-lg ${chosen.id === q.word.id ? 'text-green-600' : 'text-red-500'}`}>
          {chosen.id === q.word.id
            ? `சரியான விடை! "${q.word.english}" = ${q.word.tamil} 🎉`
            : `சரியான விடை: "${q.word.english}" (${q.word.tamil}) 💡`}
        </div>
      )}
    </div>
  )
}
