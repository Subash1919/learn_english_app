import { useState } from 'react'
import { getUser, resetProgress } from '../storage'
import { lessons } from '../data/lessons'

const LEVEL_CONFIG = {
  beginner: { label: 'Beginner', labelTamil: 'தொடக்கநிலை', color: 'bg-green-500', emoji: '🟢' },
  intermediate: { label: 'Intermediate', labelTamil: 'இடைநிலை', color: 'bg-yellow-500', emoji: '🟡' },
  advanced: { label: 'Advanced', labelTamil: 'மேம்பட்ட நிலை', color: 'bg-red-500', emoji: '🔴' },
}

function ActivityChart({ log }) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toDateString()
    const entries = log.filter(e => e.date === dateStr)
    const score = entries.reduce((sum, e) => sum + (e.score || 0), 0)
    days.push({ label: d.toLocaleDateString('ta-IN', { weekday: 'short' }), score, dateStr })
  }
  const max = Math.max(...days.map(d => d.score), 1)

  return (
    <div className="bg-white rounded-2xl p-4 border border-purple-50">
      <p className="text-gray-600 font-bold text-sm mb-4 font-tamil">கடந்த 7 நாட்கள் செயல்பாடு</p>
      <div className="flex items-end gap-2 h-20">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col items-center flex-1 gap-1">
            <div className="w-full rounded-t-lg bg-purple-100 relative" style={{ height: '64px' }}>
              <div
                className="absolute bottom-0 w-full rounded-t-lg bg-purple-500 transition-all"
                style={{ height: `${(day.score / max) * 64}px` }}
              />
            </div>
            <span className="text-xs text-gray-400 font-tamil">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function WeakWordCard({ word, onRemove }) {
  function speak() {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(word.english)
    u.lang = 'en-US'
    window.speechSynthesis.speak(u)
  }

  return (
    <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-3">
      <span className="text-2xl">{word.emoji || '📝'}</span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-800 truncate">{word.english}</p>
        <p className="text-red-500 text-sm font-tamil truncate">{word.tamil}</p>
      </div>
      <button onClick={speak} className="text-lg p-1 hover:scale-110 transition-transform">🔊</button>
    </div>
  )
}

function LevelProgress({ level, completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const cfg = LEVEL_CONFIG[level]
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <span>{cfg.emoji}</span>
          <span className="text-sm font-bold text-gray-700">{cfg.label}</span>
          <span className="text-xs text-gray-400 font-tamil">({cfg.labelTamil})</span>
        </div>
        <span className="text-sm text-gray-500 font-semibold">{completed}/{total}</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`${cfg.color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function ProfileTab({ user, onRefresh }) {
  const [u, setU] = useState(user || getUser())
  const [confirmReset, setConfirmReset] = useState(false)

  function handleReset() {
    resetProgress()
    window.location.reload()
  }

  const xpLevel = Math.floor(u.xp / 100) + 1
  const xpProgress = u.xp % 100

  const beginnerLessons = lessons.filter(l => l.level === 'beginner')
  const intermediateLessons = lessons.filter(l => l.level === 'intermediate')
  const advancedLessons = lessons.filter(l => l.level === 'advanced')

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Profile header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-6 text-center mb-5">
        <div className="text-6xl mb-2">{u.avatar}</div>
        <h2 className="text-white text-2xl font-extrabold mb-1">{u.name}</h2>
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="bg-white/20 text-white text-sm font-tamil font-bold px-3 py-1 rounded-full">
            {LEVEL_CONFIG[u.level]?.emoji} {LEVEL_CONFIG[u.level]?.labelTamil}
          </span>
          <span className="bg-yellow-400 text-purple-900 text-sm font-bold px-3 py-1 rounded-full">
            Level {xpLevel} ⭐
          </span>
        </div>
        {/* XP bar */}
        <div className="bg-white/20 rounded-full h-3 overflow-hidden mb-1">
          <div className="bg-yellow-400 h-full rounded-full transition-all" style={{ width: `${xpProgress}%` }} />
        </div>
        <p className="text-white/70 text-xs font-tamil">{u.xp} XP — {100 - xpProgress} மேலும் தேவை</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-orange-50 rounded-2xl p-3 text-center border border-orange-100">
          <p className="text-3xl">🔥</p>
          <p className="text-2xl font-extrabold text-orange-600">{u.streak}</p>
          <p className="text-xs text-gray-500 font-tamil">நாட்கள் தொடர்</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-3 text-center border border-blue-100">
          <p className="text-3xl">📖</p>
          <p className="text-2xl font-extrabold text-blue-600">{u.wordsLearned.length}</p>
          <p className="text-xs text-gray-500 font-tamil">வார்த்தைகள்</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-3 text-center border border-green-100">
          <p className="text-3xl">✅</p>
          <p className="text-2xl font-extrabold text-green-600">{u.lessonsCompleted.length}</p>
          <p className="text-xs text-gray-500 font-tamil">பாடங்கள்</p>
        </div>
      </div>

      {/* Lesson progress */}
      <div className="bg-white rounded-2xl p-4 border border-purple-50 mb-5">
        <p className="text-gray-700 font-bold mb-4 font-tamil">பாட முன்னேற்றம்</p>
        <LevelProgress
          level="beginner"
          completed={beginnerLessons.filter(l => u.lessonsCompleted.includes(l.id)).length}
          total={beginnerLessons.length}
        />
        <LevelProgress
          level="intermediate"
          completed={intermediateLessons.filter(l => u.lessonsCompleted.includes(l.id)).length}
          total={intermediateLessons.length}
        />
        <LevelProgress
          level="advanced"
          completed={advancedLessons.filter(l => u.lessonsCompleted.includes(l.id)).length}
          total={advancedLessons.length}
        />
      </div>

      {/* Activity chart */}
      <div className="mb-5">
        <ActivityChart log={u.activityLog} />
      </div>

      {/* Weak words */}
      {u.weakWords.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-700 font-bold font-tamil">வலிமையற்ற வார்த்தைகள் 💪</p>
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
              {u.weakWords.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {u.weakWords.slice(0, 5).map(word => (
              <WeakWordCard key={word.id} word={word} />
            ))}
            {u.weakWords.length > 5 && (
              <p className="text-center text-gray-400 text-sm font-tamil">
                மேலும் {u.weakWords.length - 5} வார்த்தைகள் உள்ளன
              </p>
            )}
          </div>
        </div>
      )}

      {/* Reset progress */}
      <div className="border-t border-gray-100 pt-5">
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full bg-red-50 hover:bg-red-100 text-red-500 font-bold py-3 rounded-2xl border border-red-100 font-tamil"
          >
            முன்னேற்றத்தை மீட்டமை 🗑️
          </button>
        ) : (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
            <p className="text-red-700 font-bold font-tamil text-center mb-4">
              நிச்சயமாக மீட்டமைக்கிறீர்களா? எல்லா தரவும் நீக்கப்படும்!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl font-tamil"
              >
                இல்லை
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl font-tamil"
              >
                ஆம், மீட்டமை
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
