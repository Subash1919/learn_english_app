import { useState } from 'react'
import { completeOnboarding } from '../storage'
import appLogo from '../asset/tamil_english_app_icon.svg'

const AVATARS = ['🦁', '🐯', '🦊', '🐼', '🐸', '🦄', '🐧', '🦋']
const LEVELS = [
  { id: 'beginner', label: 'Beginner', labelTamil: 'தொடக்கநிலை', desc: 'எழுத்துக்கள் & அடிப்படை வார்த்தைகள்', emoji: '🟢' },
  { id: 'intermediate', label: 'Intermediate', labelTamil: 'இடைநிலை', desc: 'வாக்கியங்கள் & உரையாடல்', emoji: '🟡' },
  { id: 'advanced', label: 'Advanced', labelTamil: 'மேம்பட்ட நிலை', desc: 'நுட்பமான ஆங்கிலம்', emoji: '🔴' },
]

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🦁')
  const [level, setLevel] = useState('beginner')

  function finish() {
    if (!name.trim()) return
    completeOnboarding(name.trim(), avatar, level)
    onDone()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-600 to-purple-800 px-6 py-10">
      {step === 0 && (
        <div className="flex flex-col items-center animate-bounce-in text-center">
          <img src={appLogo} alt="Tamil English" className="w-36 h-36 animate-float mb-6 drop-shadow-2xl" />
          <h1 className="text-white text-3xl font-bold mb-2">வணக்கம்! 👋</h1>
          <p className="text-purple-200 font-tamil text-lg mb-2">ஆங்கிலம் கற்க வரவேற்கிறோம்!</p>
          <p className="text-purple-300 text-sm mb-8">Welcome to your English learning journey</p>
          <button
            onClick={() => setStep(1)}
            className="bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold text-lg px-10 py-4 rounded-2xl card-shadow btn-press w-full max-w-xs"
          >
            தொடங்குவோம்! 🚀
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="w-full max-w-sm animate-slide-up">
          <p className="text-purple-200 font-tamil text-center mb-6 text-lg">உங்கள் பெயர் என்ன?</p>
          <div className="text-center text-5xl mb-4">{avatar}</div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="உங்கள் பெயரை உள்ளிடவும்..."
            className="w-full bg-white/10 text-white placeholder-purple-300 border-2 border-purple-400 rounded-xl px-4 py-3 text-lg font-tamil focus:outline-none focus:border-yellow-400 mb-6"
          />
          <p className="text-purple-200 font-tamil text-center mb-3">உங்கள் அவதாரத்தை தேர்ந்தெடுங்கள்</p>
          <div className="grid grid-cols-4 gap-3 mb-8">
            {AVATARS.map(a => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={`text-4xl p-3 rounded-xl transition-all ${avatar === a ? 'bg-yellow-400 scale-110' : 'bg-white/10 hover:bg-white/20'}`}
              >
                {a}
              </button>
            ))}
          </div>
          <button
            onClick={() => name.trim() && setStep(2)}
            disabled={!name.trim()}
            className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-purple-900 font-bold text-lg px-10 py-4 rounded-2xl card-shadow btn-press w-full"
          >
            அடுத்து →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="w-full max-w-sm animate-slide-up">
          <div className="text-center mb-6">
            <span className="text-5xl">{avatar}</span>
            <p className="text-white font-bold text-xl mt-2">{name}</p>
          </div>
          <p className="text-purple-200 font-tamil text-center mb-4 text-lg">உங்கள் நிலையை தேர்ந்தெடுங்கள்</p>
          <div className="flex flex-col gap-3 mb-8">
            {LEVELS.map(l => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  level === l.id
                    ? 'bg-white/20 border-yellow-400'
                    : 'bg-white/5 border-white/20 hover:bg-white/10'
                }`}
              >
                <span className="text-3xl">{l.emoji}</span>
                <div>
                  <p className="text-white font-bold">{l.label} — {l.labelTamil}</p>
                  <p className="text-purple-300 text-sm font-tamil">{l.desc}</p>
                </div>
                {level === l.id && <span className="ml-auto text-yellow-400 text-xl">✓</span>}
              </button>
            ))}
          </div>
          <button
            onClick={finish}
            className="bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold text-lg px-10 py-4 rounded-2xl card-shadow btn-press w-full"
          >
            கற்கத் தொடங்குவோம்! 🎉
          </button>
        </div>
      )}

      {/* Step indicator */}
      <div className="flex gap-2 mt-8">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-6 bg-yellow-400' : 'w-2 bg-white/30'}`} />
        ))}
      </div>
    </div>
  )
}
