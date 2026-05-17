import { useState, useEffect } from 'react'
import { lessons } from '../data/lessons'
import { addXP, addWeakWord, addLearnedWord } from '../storage'
import ConfettiEffect from '../components/ConfettiEffect'

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function getWords() {
  const all = lessons.flatMap(l => l.words).filter(w => w.english.length <= 8 && !w.english.includes(' '))
  return shuffle(all).slice(0, 8)
}

export default function WordPuzzle({ onBack }) {
  const [words] = useState(getWords)
  const [idx, setIdx] = useState(0)
  const [tiles, setTiles] = useState([])
  const [answer, setAnswer] = useState([])
  const [status, setStatus] = useState(null) // null | 'correct' | 'wrong'
  const [score, setScore] = useState(0)
  const [confetti, setConfetti] = useState(false)
  const [done, setDone] = useState(false)
  const [wrongCount, setWrongCount] = useState(0)

  const word = words[idx]

  useEffect(() => {
    if (!word) return
    const letters = word.english.toUpperCase().split('').map((l, i) => ({ id: i, letter: l }))
    setTiles(shuffle(letters))
    setAnswer([])
    setStatus(null)
  }, [idx, word])

  function addToAnswer(tile) {
    if (status) return
    setTiles(t => t.filter(x => x.id !== tile.id))
    setAnswer(a => [...a, tile])
  }

  function removeFromAnswer(tile) {
    if (status) return
    setAnswer(a => a.filter(x => x.id !== tile.id))
    setTiles(t => [...t, tile])
  }

  function checkAnswer() {
    const formed = answer.map(t => t.letter).join('')
    if (formed === word.english.toUpperCase()) {
      setStatus('correct')
      setScore(s => s + 1)
      addLearnedWord(word)
      addXP(10)
      setConfetti(true)
      setTimeout(() => setConfetti(false), 2000)
      setTimeout(next, 1800)
    } else {
      setStatus('wrong')
      setWrongCount(c => c + 1)
      addWeakWord(word)
      setTimeout(() => {
        setStatus(null)
        const letters = word.english.toUpperCase().split('').map((l, i) => ({ id: i, letter: l }))
        setTiles(shuffle(letters))
        setAnswer([])
      }, 1500)
    }
  }

  function next() {
    if (idx + 1 >= words.length) {
      setDone(true)
    } else {
      setIdx(i => i + 1)
    }
  }

  if (done) {
    const total = words.length
    const pct = Math.round((score / total) * 100)
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <ConfettiEffect active={pct >= 70} />
        <div className="text-7xl mb-4">{pct >= 70 ? '🏆' : '📝'}</div>
        <h2 className="text-2xl font-extrabold text-purple-700 font-tamil mb-2">விளையாட்டு முடிந்தது!</h2>
        <div className="bg-purple-50 rounded-2xl p-6 w-full mb-6">
          <p className="text-5xl font-extrabold text-purple-700 mb-1">{score}/{total}</p>
          <p className="text-gray-500 font-tamil">சரியான விடைகள்</p>
          <p className="text-yellow-600 font-bold mt-2 font-tamil">+{score * 10} XP சம்பாதித்தீர்கள்!</p>
        </div>
        <button onClick={onBack} className="bg-purple-600 text-white font-bold px-8 py-4 rounded-2xl card-shadow btn-press w-full">
          திரும்பு
        </button>
      </div>
    )
  }

  if (!word) return null

  return (
    <div className="flex flex-col px-4 pt-4 min-h-[80vh]">
      <ConfettiEffect active={confetti} />

      {/* Progress */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-2xl p-1">←</button>
        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="progress-bar h-full" style={{ width: `${((idx) / words.length) * 100}%` }} />
        </div>
        <span className="text-sm text-gray-500 font-semibold">{idx + 1}/{words.length}</span>
      </div>

      {/* Clue */}
      <div className="bg-purple-50 rounded-2xl p-5 text-center mb-6">
        <span className="text-5xl block mb-3">{word.emoji}</span>
        <p className="text-gray-500 text-sm font-tamil mb-1">இந்த வார்த்தை என்ன?</p>
        <p className="text-purple-700 text-xl font-bold font-tamil">{word.tamil}</p>
      </div>

      {/* Answer slots */}
      <div className="flex flex-wrap gap-2 justify-center mb-6 min-h-14">
        {answer.length === 0 ? (
          <div className="w-full text-center text-gray-300 font-tamil text-sm py-3">
            கீழே உள்ள எழுத்துக்களை தட்டவும்
          </div>
        ) : (
          answer.map(tile => (
            <button
              key={tile.id}
              onClick={() => removeFromAnswer(tile)}
              className={`w-11 h-11 rounded-xl font-extrabold text-lg border-2 transition-all btn-press ${
                status === 'correct' ? 'bg-green-400 border-green-500 text-white' :
                status === 'wrong' ? 'bg-red-400 border-red-500 text-white' :
                'bg-white border-purple-300 text-purple-700 hover:bg-purple-50'
              }`}
            >
              {tile.letter}
            </button>
          ))
        )}
      </div>

      {/* Letter tiles */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {tiles.map(tile => (
          <button
            key={tile.id}
            onClick={() => addToAnswer(tile)}
            className="w-11 h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-extrabold text-lg shadow btn-press"
          >
            {tile.letter}
          </button>
        ))}
      </div>

      {/* Status feedback */}
      {status === 'correct' && (
        <div className="text-center text-green-600 font-bold font-tamil text-lg mb-4">சரியான விடை! 🎉</div>
      )}
      {status === 'wrong' && (
        <div className="text-center text-red-500 font-bold font-tamil text-lg mb-4">தவறான விடை! மீண்டும் முயற்சிக்கவும் 💪</div>
      )}

      {/* Check button */}
      <div className="mt-auto">
        <button
          onClick={checkAnswer}
          disabled={answer.length === 0 || !!status}
          className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 text-purple-900 font-bold text-lg py-4 rounded-2xl card-shadow btn-press"
        >
          சரிபார்க்கவும் ✓
        </button>
      </div>
    </div>
  )
}
