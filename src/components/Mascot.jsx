export default function Mascot({ message, size = 'md' }) {
  const sizes = { sm: 'text-4xl', md: 'text-6xl', lg: 'text-8xl' }

  return (
    <div className="flex flex-col items-center">
      <div className={`${sizes[size]} animate-float select-none`}>🦉</div>
      {message && (
        <div className="mt-2 bg-white border-2 border-purple-200 rounded-2xl rounded-tl-none px-4 py-2 shadow-sm max-w-xs animate-bounce-in">
          <p className="text-sm font-tamil text-purple-800 font-semibold text-center leading-relaxed">
            {message}
          </p>
        </div>
      )}
    </div>
  )
}
