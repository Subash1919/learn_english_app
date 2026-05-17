const colors = {
  1: 'bg-blue-50 border-blue-300 text-blue-800',
  2: 'bg-orange-50 border-orange-300 text-orange-800',
  3: 'bg-red-50 border-red-300 text-red-800',
}

export default function ReminderBanner({ message, onDismiss }) {
  const colorClass = colors[message.level] || colors[1]
  return (
    <div className={`flex items-center gap-2 px-4 py-3 border-b ${colorClass} animate-slide-up`}>
      <span className="font-tamil text-sm flex-1 leading-snug">{message.text}</span>
      <button
        onClick={onDismiss}
        className="text-lg font-bold opacity-60 hover:opacity-100 ml-2 flex-shrink-0"
      >
        ✕
      </button>
    </div>
  )
}
