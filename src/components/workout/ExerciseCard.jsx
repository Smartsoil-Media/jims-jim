import { Card } from '../ui/Card'

export function ExerciseCard({
  exercise,
  stats,
  lastWeight,
  onClick,
  isActive,
  isSelectionMode,
  isSelected,
  daysSinceLastDone
}) {
  const hasProgress = stats?.sets > 0
  const isTimeBased = exercise?.unit === 'seconds' || exercise?.unit === 'minutes'
  const isMinutes = exercise?.unit === 'minutes'
  const unitLabel = isTimeBased ? (isMinutes ? 'min' : 's') : 'reps'
  const weightUnit = isTimeBased ? 'km/h' : 'kg'

  // Selection mode - before session starts
  if (isSelectionMode) {
    return (
      <Card
        onClick={onClick}
        className={`min-h-[120px] flex flex-col justify-between transition-all ${
          isSelected
            ? 'border-green-500 bg-green-500/10'
            : 'border-midnight-700'
        }`}
      >
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-white text-sm leading-tight pr-2">
            {exercise.name}
          </h3>
          {isSelected && (
            <span className="text-green-500 text-lg">✓</span>
          )}
        </div>

        <div className="mt-2">
          {exercise.muscles && (
            <p className="text-xs text-gray-500 truncate">
              {exercise.muscles.slice(0, 2).join(', ')}
            </p>
          )}
        </div>

        <div className="mt-1">
          {daysSinceLastDone !== null ? (
            <p className={`text-sm ${daysSinceLastDone > 7 ? 'text-orange-400' : 'text-gray-400'}`}>
              {daysSinceLastDone === 0
                ? 'Done today'
                : daysSinceLastDone === 1
                  ? '1 day ago'
                  : `${daysSinceLastDone} days ago`}
            </p>
          ) : (
            <p className="text-sm text-gray-500">Never done</p>
          )}
        </div>
      </Card>
    )
  }

  // Active workout mode
  return (
    <Card
      onClick={onClick}
      active={hasProgress}
      className="min-h-[120px] flex flex-col justify-between"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-white text-sm leading-tight pr-2">
          {exercise.name}
        </h3>
        {stats?.hasFailure && (
          <span className="text-orange-500 text-xs">🔥</span>
        )}
      </div>

      <div className="mt-2">
        <p className="text-2xl font-bold text-accent">
          {stats?.lastWeight || lastWeight || '—'}
          {(stats?.lastWeight || lastWeight) && <span className="text-lg">{weightUnit}</span>}
        </p>
      </div>

      <div className="mt-1">
        {hasProgress ? (
          <p className="text-sm text-gray-400">
            {stats.sets} {stats.sets === 1 ? 'set' : 'sets'} @ {stats.avgReps} {unitLabel}
          </p>
        ) : (
          <p className="text-sm text-gray-500">Tap to log</p>
        )}
      </div>
    </Card>
  )
}
