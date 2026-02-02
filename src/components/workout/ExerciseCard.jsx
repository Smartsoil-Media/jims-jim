import { Card } from '../ui/Card'

export function ExerciseCard({
  exercise,
  stats,
  lastWeight,
  onClick,
  isActive,
  isSelectionMode,
  isSelected,
  daysSinceLastDone,
  loggedSets = []
}) {
  const hasProgress = loggedSets.length > 0
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
  const hasFailure = loggedSets.some(s => s.toFailure)
  const displayWeight = loggedSets.length > 0
    ? loggedSets[loggedSets.length - 1].weight
    : lastWeight

  return (
    <div className="flex flex-col">
      <Card
        onClick={onClick}
        className={`min-h-[100px] flex flex-col justify-between ${hasProgress ? 'border-green-500' : ''}`}
      >
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-white text-sm leading-tight pr-2">
            {exercise.name}
          </h3>
          {hasProgress && (
            <span className="text-green-500 text-lg">✓</span>
          )}
        </div>

        <div className="mt-2">
          <p className="text-2xl font-bold text-accent">
            {displayWeight || '—'}
            {displayWeight && <span className="text-lg">{weightUnit}</span>}
          </p>
        </div>

        <div className="mt-1">
          {hasProgress ? (
            <p className="text-sm text-green-400">
              {loggedSets.length} {loggedSets.length === 1 ? 'set' : 'sets'} done
              {hasFailure && ' 🔥'}
            </p>
          ) : (
            <p className="text-sm text-gray-500">Tap to log</p>
          )}
        </div>
      </Card>

      {/* Sets displayed below the card */}
      {hasProgress && (
        <div className="mt-2 space-y-1 px-1">
          {loggedSets.map((set, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-xs bg-midnight-800/50 rounded-lg px-2 py-1.5"
            >
              <span className="text-gray-500">Set {index + 1}</span>
              <span className="text-white">
                {isTimeBased
                  ? `${set.reps}${isMinutes ? 'm' : 's'} @ ${set.weight}${weightUnit}`
                  : `${set.weight}${weightUnit} × ${set.reps}`
                }
                {set.toFailure && <span className="text-orange-500 ml-1">🔥</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
