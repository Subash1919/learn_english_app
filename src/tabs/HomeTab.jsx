import { useState, useEffect } from 'react'
import Mascot from '../components/Mascot'
import { getWordOfDay } from '../data/wordOfDay'
import { getUser } from '../storage'

function speak(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = 0.85
  window.speechSynthesis.speak(u)
}

function XPBar({ xp }) {
  const level = Math.floor(xp / 100) + 1
  const progress = xp % 100
  return (
    <div className="bg-purple-50 rounded-2xl p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-purple-700 font-bold text-sm">Level {level}</span>
        <span className="text-purple-500 text-sm font-semibold">{xp} XP</span>
      </div>
      <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
        <div className="progress-bar h-full" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-purple-400 text-xs mt-1 font-tamil">{100 - progress} XP மேலும் தேவை</p>
    </div>
  )
}

function StatCard({ emoji, value, label }) {
  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col items-center shadow-sm border border-purple-50">
      <span className="text-3xl mb-1">{emoji}</span>
      <span className="text-2xl font-extrabold text-purple-700">{value}</span>
      <span className="text-xs text-gray-500 font-tamil text-center mt-0.5">{label}</span>
    </div>
  )
}

function WordOfDayCard({ word }) {
  const [spoken, setSpoken] = useState(false)

  function handleSpeak() {
    speak(word.english)
    setSpoken(true)
    setTimeout(() => setSpoken(false), 1500)
  }

  return (
    <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-3xl p-5 shadow-md">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">இன்றைய வார்த்தை</p>
          <p className="text-white/70 text-xs">Word of the Day</p>
        </div>
        <span className="text-4xl">{word.emoji}</span>
      </div>
      <div className="bg-white/20 rounded-2xl p-4 mb-3">
        <h2 className="text-white text-3xl font-extrabold mb-1">{word.english}</h2>
        <p className="text-white font-tamil text-lg font-semibold">{word.tamil}</p>
      </div>
      <p className="text-white/90 text-sm italic mb-1">{word.example}</p>
      <p className="text-white/70 text-xs font-tamil mb-4">{word.exampleTamil}</p>
      <button
        onClick={handleSpeak}
        className={`flex items-center gap-2 bg-white/30 hover:bg-white/40 active:bg-white/50 text-white font-bold px-4 py-2 rounded-xl transition-all ${spoken ? 'scale-95' : ''}`}
      >
        <span className="text-xl">{spoken ? '🔉' : '🔊'}</span>
        <span className="text-sm">கேளுங்கள்</span>
      </button>
    </div>
  )
}

export default function HomeTab({ user, onRefresh, onNavigate }) {
  const [word] = useState(getWordOfDay)
  const [u, setU] = useState(user)

  useEffect(() => { setU(getUser()) }, [user])

  if (!u) return null

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'காலை வணக்கம்' : hour < 17 ? 'மதிய வணக்கம்' : 'மாலை வணக்கம்'

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-tamil">{greeting} 👋</p>
          <h1 className="text-gray-800 text-2xl font-extrabold">{u.name}</h1>
        </div>
        <div className="text-4xl">{u.avatar}</div>
      </div>

      {/* Mascot */}
      <Mascot message="வணக்கம்! இன்று கற்போம்! 🎉" size="sm" />

      {/* XP Bar */}
      <XPBar xp={u.xp} />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard emoji="🔥" value={u.streak} label="நாட்கள் தொடர்" />
        <StatCard emoji="📖" value={u.wordsLearned.length} label="வார்த்தைகள்" />
        <StatCard emoji="✅" value={u.lessonsCompleted.length} label="பாடங்கள்" />
      </div>

      {/* Word of the Day */}
      <WordOfDayCard word={word} />

      {/* Quick actions */}
      <div className="flex flex-col gap-3">
        <h3 className="text-gray-700 font-bold text-base font-tamil">விரைவான தொடக்கம்</h3>
        <button
          onClick={() => onNavigate('learn')}
          className="flex items-center gap-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl p-4 card-shadow btn-press"
        >
          <span className="text-3xl">📚</span>
          <div className="text-left">
            <p className="font-bold">பாடங்களை தொடங்குங்கள்</p>
            <p className="text-purple-200 text-sm font-tamil">Resume Lessons</p>
          </div>
          <span className="ml-auto text-2xl">→</span>
        </button>
        <button
          onClick={() => onNavigate('games')}
          className="flex items-center gap-4 bg-yellow-400 hover:bg-yellow-500 text-purple-900 rounded-2xl p-4 card-shadow btn-press"
        >
          <span className="text-3xl">🎮</span>
          <div className="text-left">
            <p className="font-bold">விளையாடுங்கள்</p>
            <p className="text-purple-700 text-sm font-tamil">Practice with Games</p>
          </div>
          <span className="ml-auto text-2xl">→</span>
        </button>
        {u.weakWords.length > 0 && (
          <button
            onClick={() => onNavigate('games')}
            className="flex items-center gap-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-700 rounded-2xl p-4 btn-press"
          >
            <span className="text-3xl">💪</span>
            <div className="text-left">
              <p className="font-bold">பலவீனமான வார்த்தைகள்</p>
              <p className="text-red-500 text-sm font-tamil">{u.weakWords.length} வார்த்தைகள் மீண்டும் பயிற்சி</p>
            </div>
            <span className="ml-auto text-2xl">→</span>
          </button>
        )}
      </div>
    </div>
  )
}
