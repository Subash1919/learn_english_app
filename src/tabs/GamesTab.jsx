import { useState } from 'react'
import WordPuzzle from '../games/WordPuzzle'
import FillBlank from '../games/FillBlank'
import MatchPair from '../games/MatchPair'
import EmojiQuiz from '../games/EmojiQuiz'

const GAMES = [
  {
    id: 'puzzle',
    emoji: '🧩',
    title: 'Word Puzzle',
    titleTamil: 'வார்த்தை புதிர்',
    desc: 'எழுத்துக்களை சரியான வரிசையில் அமைக்கவும்',
    color: 'from-purple-500 to-indigo-600',
    xp: '+10 XP / வார்த்தை',
  },
  {
    id: 'fillblank',
    emoji: '✏️',
    title: 'Fill in the Blank',
    titleTamil: 'காலியிடம் நிரப்புக',
    desc: 'சரியான வார்த்தையை தேர்ந்தெடுங்கள்',
    color: 'from-blue-500 to-cyan-600',
    xp: '+10 XP / கேள்வி',
  },
  {
    id: 'match',
    emoji: '🔗',
    title: 'Match the Pair',
    titleTamil: 'ஜோடி பொருத்தவும்',
    desc: 'ஆங்கிலம் & தமிழை பொருத்துங்கள்',
    color: 'from-green-500 to-teal-600',
    xp: '+10 XP / ஜோடி',
  },
  {
    id: 'emoji',
    emoji: '🖼️',
    title: 'Emoji Quiz',
    titleTamil: 'Emoji கேள்வி',
    desc: 'Emoji பார்த்து வார்த்தையை சொல்லுங்கள்',
    color: 'from-yellow-500 to-orange-500',
    xp: '+10 XP / சரியான விடை',
  },
]

function GameCard({ game, onPlay }) {
  return (
    <button
      onClick={() => onPlay(game.id)}
      className="flex flex-col w-full text-left rounded-3xl overflow-hidden shadow-md card-shadow btn-press"
    >
      <div className={`bg-gradient-to-br ${game.color} p-5 flex items-center gap-4`}>
        <span className="text-5xl">{game.emoji}</span>
        <div>
          <h3 className="text-white font-extrabold text-lg leading-tight">{game.title}</h3>
          <p className="text-white/80 text-sm font-tamil">{game.titleTamil}</p>
        </div>
      </div>
      <div className="bg-white px-5 py-3 flex items-center justify-between">
        <p className="text-gray-500 text-sm font-tamil">{game.desc}</p>
        <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ml-2">
          {game.xp}
        </span>
      </div>
    </button>
  )
}

export default function GamesTab({ user, onRefresh }) {
  const [activeGame, setActiveGame] = useState(null)

  function handleBack() {
    setActiveGame(null)
    onRefresh()
  }

  if (activeGame === 'puzzle') return <WordPuzzle onBack={handleBack} />
  if (activeGame === 'fillblank') return <FillBlank onBack={handleBack} />
  if (activeGame === 'match') return <MatchPair onBack={handleBack} />
  if (activeGame === 'emoji') return <EmojiQuiz onBack={handleBack} />

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="text-5xl">🎮</div>
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">விளையாட்டுகள்</h2>
          <p className="text-gray-500 text-sm">Games</p>
        </div>
      </div>

      <p className="text-gray-500 text-sm font-tamil mb-6">
        விளையாடி கற்கவும் — XP சம்பாதியுங்கள்! 🌟
      </p>

      {/* XP badge */}
      {user && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 flex items-center justify-between mb-6">
          <div>
            <p className="text-white/70 text-xs font-tamil">மொத்த XP</p>
            <p className="text-white text-2xl font-extrabold">{user.xp} ⭐</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs font-tamil">வலிமையற்ற வார்த்தைகள்</p>
            <p className="text-white text-2xl font-extrabold">{user.weakWords?.length || 0} 💪</p>
          </div>
        </div>
      )}

      {/* Game cards */}
      <div className="flex flex-col gap-4">
        {GAMES.map(game => (
          <GameCard key={game.id} game={game} onPlay={setActiveGame} />
        ))}
      </div>

      <p className="text-center text-gray-400 text-xs font-tamil mt-6">
        எல்லா விளையாட்டுகளும் உங்கள் முன்னேற்றத்தை சேமிக்கின்றன 🔒
      </p>
    </div>
  )
}
