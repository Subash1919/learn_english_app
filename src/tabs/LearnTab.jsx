import { useState } from 'react'
import { lessons, getLessonsByLevel, isLevelUnlocked } from '../data/lessons'
import { CONVERSATION_CATEGORIES, CONVERSATIONS } from '../data/conversations'
import { markLessonComplete, addLearnedWord, addXP, logActivity, getUser } from '../storage'
import ConfettiEffect from '../components/ConfettiEffect'
import { TextToSpeech } from '@capacitor-community/text-to-speech'

const LEVELS = [
  { id: 'beginner', label: 'Beginner', labelTamil: 'தொடக்கநிலை', emoji: '🟢', color: 'from-green-400 to-emerald-500' },
  { id: 'intermediate', label: 'Intermediate', labelTamil: 'இடைநிலை', emoji: '🟡', color: 'from-yellow-400 to-amber-500' },
  { id: 'advanced', label: 'Advanced', labelTamil: 'மேம்பட்ட நிலை', emoji: '🔴', color: 'from-red-400 to-rose-500' },
]

async function speak(text, rate = 1.0) {
  try {
    await TextToSpeech.stop()
    await TextToSpeech.speak({ text, lang: 'en-US', rate, pitch: 1.0, volume: 1.0, category: 'ambient' })
  } catch {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = rate * 0.85
    window.speechSynthesis.speak(u)
  }
}

// Speaker A = higher pitch (female-like), Speaker B = lower pitch (male-like)
async function speakAs(text, speaker, rate = 1.0) {
  const pitch = speaker === 'A' ? 1.3 : 0.8
  try {
    await TextToSpeech.stop()
    await TextToSpeech.speak({ text, lang: 'en-US', rate, pitch, volume: 1.0, category: 'ambient' })
  } catch {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = rate * 0.85
    u.pitch = pitch
    window.speechSynthesis.speak(u)
  }
}

const SPEED_OPTIONS = [
  { label: '🐢', labelTamil: 'மெதுவு', rate: 0.7 },
  { label: '🚶', labelTamil: 'சாதாரண', rate: 1.0 },
  { label: '🚀', labelTamil: 'வேகம்', rate: 1.3 },
]

// ─── Lesson Components ────────────────────────────────────────────────────────

function WordCard({ word, index }) {
  const [flipped, setFlipped] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  function handleSpeak(e) {
    e.stopPropagation()
    speak(word.english)
    setSpeaking(true)
    setTimeout(() => setSpeaking(false), 1200)
  }

  return (
    <div
      className="bg-white rounded-3xl p-5 shadow-sm border-2 border-purple-50 animate-slide-up cursor-pointer transition-all active:scale-95"
      style={{ animationDelay: `${index * 0.06}s` }}
      onClick={() => setFlipped(f => !f)}
    >
      <div className="flex flex-col items-center text-center gap-2">
        <span className="text-6xl">{word.emoji}</span>
        <h3 className="text-2xl font-extrabold text-gray-800">{word.english}</h3>
        <p className="text-purple-600 text-xl font-bold font-tamil">{word.tamil}</p>
        {word.pronunciation && (
          <p className="text-gray-400 text-sm font-tamil">[{word.pronunciation}]</p>
        )}
        {flipped && (
          <div className="mt-2 bg-purple-50 rounded-xl p-3 w-full animate-bounce-in">
            <p className="text-gray-700 text-sm italic">{word.example}</p>
            <p className="text-purple-500 text-xs font-tamil mt-1">{word.exampleTamil}</p>
          </div>
        )}
        <p className="text-gray-300 text-xs font-tamil">{flipped ? 'மடக்கவும்' : 'எடுத்துக்காட்டைக் காண தட்டவும்'}</p>
        <button
          onClick={handleSpeak}
          className={`flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold px-4 py-2 rounded-xl text-sm transition-all ${speaking ? 'scale-95' : ''}`}
        >
          <span>{speaking ? '🔉' : '🔊'}</span> கேளுங்கள்
        </button>
      </div>
    </div>
  )
}

function LessonView({ lesson, onBack, onComplete }) {
  const [phase, setPhase] = useState('words')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [confetti, setConfetti] = useState(false)

  const word = lesson.words[currentIdx]
  const total = lesson.words.length
  const progress = ((currentIdx + 1) / total) * 100

  function handleNext() {
    addLearnedWord(word)
    if (currentIdx + 1 >= total) {
      markLessonComplete(lesson.id)
      addXP(50)
      logActivity(lesson.title, 100, 100)
      setPhase('done')
      setConfetti(true)
      setTimeout(() => setConfetti(false), 3500)
    } else {
      setCurrentIdx(i => i + 1)
    }
  }

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <ConfettiEffect active={confetti} />
        <div className="text-8xl mb-4 animate-bounce-in">🎉</div>
        <h2 className="text-3xl font-extrabold text-purple-700 mb-2 font-tamil">அருமை!</h2>
        <p className="text-gray-600 font-tamil mb-1">பாடம் முடிந்தது!</p>
        <p className="text-purple-500 font-bold mb-6">{lesson.title} ✅</p>
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 mb-8 w-full">
          <p className="text-yellow-700 font-bold font-tamil">+50 XP சம்பாதித்தீர்கள்! 🌟</p>
          <p className="text-yellow-600 text-sm font-tamil">{total} வார்த்தைகள் கற்றீர்கள்</p>
        </div>
        <button
          onClick={onComplete}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg px-8 py-4 rounded-2xl card-shadow btn-press w-full"
        >
          பாடங்களுக்கு திரும்பு
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen px-4 pt-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-2xl p-2 hover:bg-gray-100 rounded-xl">←</button>
        <div className="flex-1">
          <p className="text-xs text-gray-400 font-tamil">{lesson.titleTamil}</p>
          <h2 className="text-lg font-extrabold text-gray-800">{lesson.title}</h2>
        </div>
        <span className="text-2xl">{lesson.emoji}</span>
      </div>

      <div className="mb-5">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span className="font-tamil">{currentIdx + 1} / {total}</span>
          <span className="font-tamil">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="progress-bar h-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <WordCard key={word.id} word={word} index={0} />

      <div className="mt-auto pt-6 pb-4">
        <button
          onClick={handleNext}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg py-4 rounded-2xl card-shadow btn-press"
        >
          {currentIdx + 1 >= total ? 'பாடம் முடிந்தது! 🎉' : 'அடுத்த வார்த்தை →'}
        </button>
      </div>
    </div>
  )
}

function LessonCard({ lesson, completed, locked, onStart }) {
  return (
    <button
      onClick={() => !locked && onStart(lesson)}
      disabled={locked}
      className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left w-full transition-all btn-press ${
        locked
          ? 'bg-gray-50 border-gray-100 opacity-60'
          : completed
            ? 'bg-green-50 border-green-200 hover:bg-green-100'
            : 'bg-white border-purple-100 hover:bg-purple-50 shadow-sm'
      }`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${
        locked ? 'bg-gray-100' : completed ? 'bg-green-100' : 'bg-purple-100'
      }`}>
        {locked ? '🔒' : lesson.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-gray-800 truncate">{lesson.title}</p>
        <p className="text-sm text-gray-500 font-tamil">{lesson.titleTamil}</p>
        <p className="text-xs text-gray-400 font-tamil mt-0.5">{lesson.words.length} வார்த்தைகள்</p>
      </div>
      {completed && <span className="text-2xl flex-shrink-0">✅</span>}
      {!completed && !locked && <span className="text-xl text-purple-400 flex-shrink-0">→</span>}
    </button>
  )
}

// ─── Conversation Components ──────────────────────────────────────────────────

function ConversationLine({ line, index, rate = 0.85 }) {
  const [speaking, setSpeaking] = useState(false)
  const isA = line.speaker === 'A'

  function handleSpeak() {
    speakAs(line.english, line.speaker, rate)
    setSpeaking(true)
    setTimeout(() => setSpeaking(false), 1500)
  }

  return (
    <div
      className={`flex gap-2 animate-slide-up ${isA ? 'flex-row' : 'flex-row-reverse'}`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1 ${
        isA ? 'bg-purple-600 text-white' : 'bg-yellow-400 text-purple-900'
      }`}>
        {line.speaker}
      </div>
      <div className={`max-w-[78%] ${isA ? '' : 'items-end'} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isA
            ? 'bg-purple-600 text-white rounded-tl-sm'
            : 'bg-white border-2 border-gray-100 text-gray-800 rounded-tr-sm'
        }`}>
          <p className="font-semibold text-sm leading-snug">{line.english}</p>
        </div>
        <p className={`text-xs font-tamil text-gray-500 px-1 ${isA ? '' : 'text-right'}`}>{line.tamil}</p>
        <button
          onClick={handleSpeak}
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-all ${
            isA ? '' : 'self-end'
          } ${speaking ? 'bg-purple-100 text-purple-700' : 'text-gray-400 hover:text-purple-500'}`}
        >
          {speaking ? '🔉' : '🔊'} <span>கேள்</span>
        </button>
      </div>
    </div>
  )
}

function ConversationCard({ conv, expanded, onToggle, rate }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-purple-50 overflow-hidden shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-sm">{conv.situation}</p>
          <p className="text-xs text-purple-500 font-tamil mt-0.5">{conv.situationTamil}</p>
        </div>
        <span className="text-gray-400 text-lg flex-shrink-0 transition-transform" style={{ transform: expanded ? 'rotate(90deg)' : '' }}>›</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3 bg-gray-50">
          <div className="h-px bg-gray-200 mb-1" />
          {conv.lines.map((line, i) => (
            <ConversationLine key={i} line={line} index={i} rate={rate} />
          ))}
        </div>
      )}
    </div>
  )
}

function ConversationCategoryView({ category, onBack }) {
  const [expandedId, setExpandedId] = useState(null)
  const [speedIdx, setSpeedIdx] = useState(1) // default: Normal
  const convList = CONVERSATIONS[category.id] || []
  const currentSpeed = SPEED_OPTIONS[speedIdx]

  function toggle(id) {
    setExpandedId(prev => (prev === id ? null : id))
  }

  return (
    <div className="flex flex-col min-h-screen px-4 pt-4 pb-6">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-2xl p-2 hover:bg-gray-100 rounded-xl">←</button>
        <div className="flex-1">
          <p className="text-xs text-gray-400 font-tamil">{category.labelTamil}</p>
          <h2 className="text-lg font-extrabold text-gray-800">{category.label}</h2>
        </div>
        <span className="text-3xl">{category.emoji}</span>
      </div>

      {/* Speed control */}
      <div className="flex items-center gap-2 mb-4 bg-gray-50 rounded-2xl p-2">
        <span className="text-xs text-gray-500 font-tamil pl-1">வேகம்:</span>
        <div className="flex gap-1 flex-1">
          {SPEED_OPTIONS.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSpeedIdx(i)}
              className={`flex-1 flex flex-col items-center py-1.5 rounded-xl text-xs font-bold transition-all ${
                speedIdx === i
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              <span className="text-base">{opt.label}</span>
              <span className="font-tamil text-[10px]">{opt.labelTamil}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-gray-500 text-sm font-tamil mb-4">
        {convList.length} உரையாடல்கள் — தட்டி விரிவாக்கவும்
      </p>

      <div className="flex flex-col gap-3">
        {convList.map(conv => (
          <ConversationCard
            key={conv.id}
            conv={conv}
            expanded={expandedId === conv.id}
            onToggle={() => toggle(conv.id)}
            rate={currentSpeed.rate}
          />
        ))}
      </div>
    </div>
  )
}

function ConversationsView() {
  const [activeCategory, setActiveCategory] = useState(null)

  if (activeCategory) {
    return (
      <ConversationCategoryView
        category={activeCategory}
        onBack={() => setActiveCategory(null)}
      />
    )
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <h2 className="text-2xl font-extrabold text-gray-800 mb-1">உரையாடல்கள்</h2>
      <p className="text-gray-500 text-sm mb-6">Conversations — Real Life Situations</p>

      <div className="flex flex-col gap-4">
        {CONVERSATION_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat)}
            className="flex items-center gap-4 rounded-3xl overflow-hidden shadow-md btn-press text-left"
          >
            <div className={`bg-gradient-to-br ${cat.color} p-5 flex items-center gap-4 w-full`}>
              <span className="text-5xl">{cat.emoji}</span>
              <div className="flex-1">
                <h3 className="text-white font-extrabold text-base leading-tight">{cat.label}</h3>
                <p className="text-white/80 text-sm font-tamil">{cat.labelTamil}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-white font-extrabold text-xl">{(CONVERSATIONS[cat.id] || []).length}</p>
                <p className="text-white/70 text-xs font-tamil">உரையாடல்</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-gray-400 text-xs font-tamil mt-6">
        மேலும் பிரிவுகள் விரைவில் சேர்க்கப்படும் 🚀
      </p>
    </div>
  )
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export default function LearnTab({ user, onRefresh }) {
  const [mode, setMode] = useState('lessons') // 'lessons' | 'conversations'
  const [activeLesson, setActiveLesson] = useState(null)
  const [u, setU] = useState(user || getUser())

  function refresh() {
    setU(getUser())
    onRefresh()
  }

  if (activeLesson) {
    return (
      <LessonView
        lesson={activeLesson}
        onBack={() => setActiveLesson(null)}
        onComplete={() => { setActiveLesson(null); refresh() }}
      />
    )
  }

  return (
    <div className="flex flex-col">
      {/* Mode Toggle */}
      <div className="px-4 pt-5 pb-2">
        <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
          <button
            onClick={() => setMode('lessons')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
              mode === 'lessons'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            <span>📚</span>
            <span className="font-tamil">பாடங்கள்</span>
          </button>
          <button
            onClick={() => setMode('conversations')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
              mode === 'conversations'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            <span>💬</span>
            <span className="font-tamil">உரையாடல்</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {mode === 'lessons' ? (
        <div className="px-4 pt-4 pb-4">
          {LEVELS.map(level => {
            const levelLessons = getLessonsByLevel(level.id)
            const unlocked = isLevelUnlocked(level.id, u.lessonsCompleted)

            return (
              <div key={level.id} className="mb-8">
                <div className={`flex items-center gap-3 bg-gradient-to-r ${level.color} rounded-2xl p-4 mb-4`}>
                  <span className="text-2xl">{level.emoji}</span>
                  <div>
                    <p className="text-white font-extrabold">{level.label}</p>
                    <p className="text-white/80 text-sm font-tamil">{level.labelTamil}</p>
                  </div>
                  {!unlocked && <span className="ml-auto text-white text-2xl">🔒</span>}
                  {unlocked && (
                    <span className="ml-auto text-white text-sm font-semibold">
                      {levelLessons.filter(l => u.lessonsCompleted.includes(l.id)).length}/{levelLessons.length}
                    </span>
                  )}
                </div>

                {!unlocked && (
                  <div className="bg-gray-50 rounded-2xl p-4 text-center mb-4">
                    <p className="text-gray-500 font-tamil text-sm">
                      {level.id === 'intermediate'
                        ? 'தொடக்கநிலை பாடங்களில் பாதியை முடிக்கவும்'
                        : 'இடைநிலை பாடங்களில் பாதியை முடிக்கவும்'}
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {levelLessons.map(lesson => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      completed={u.lessonsCompleted.includes(lesson.id)}
                      locked={!unlocked}
                      onStart={setActiveLesson}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <ConversationsView />
      )}
    </div>
  )
}
