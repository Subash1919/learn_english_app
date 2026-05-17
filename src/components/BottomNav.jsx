const tabs = [
  { id: 'home', emoji: '🏠', label: 'Home', labelTamil: 'முகப்பு' },
  { id: 'learn', emoji: '📚', label: 'Learn', labelTamil: 'கற்றல்' },
  { id: 'games', emoji: '🎮', label: 'Games', labelTamil: 'விளையாட்டு' },
  { id: 'profile', emoji: '👤', label: 'Profile', labelTamil: 'சுயவிவரம்' },
]

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 shadow-lg z-50">
      <div className="flex">
        {tabs.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 pt-3 transition-all duration-200 ${
                active ? 'text-purple-600' : 'text-gray-400'
              }`}
            >
              <span className={`text-2xl transition-transform duration-200 ${active ? 'scale-110' : 'scale-100'}`}>
                {tab.emoji}
              </span>
              <span className={`text-xs mt-0.5 font-semibold font-tamil ${active ? 'text-purple-600' : 'text-gray-400'}`}>
                {tab.labelTamil}
              </span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-purple-600 mt-1" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
