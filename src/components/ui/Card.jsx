export function Card({ children, onClick, className = '', active = false, completed = false }) {
  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-2xl p-4
        bg-midnight-800
        border-2 transition-all duration-200
        ${active ? 'border-accent shadow-lg shadow-accent/20' : 'border-midnight-700'}
        ${completed ? 'border-accent/50 bg-midnight-800/80' : ''}
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
