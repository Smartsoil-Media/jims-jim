export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = ''
}) {
  const variants = {
    primary: 'bg-accent text-midnight-950 hover:bg-accent-light active:bg-accent-dark',
    secondary: 'bg-midnight-700 text-white hover:bg-midnight-600 active:bg-midnight-800',
    ghost: 'bg-transparent text-accent hover:bg-accent/10 active:bg-accent/20',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl font-semibold',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-xl font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.98]
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
