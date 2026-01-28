import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Confetti } from '../components/ui/Confetti'
import { ExerciseCard } from '../components/workout/ExerciseCard'
import { LogModal } from '../components/workout/LogModal'
import { useWorkout } from '../hooks/useWorkout.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { categories, defaultExercises } from '../data/defaultExercises'
import { saveWorkout, getAllExerciseStats, getCustomExercises, getHiddenExercises } from '../firebase/firestore'
import { getRandomQuote } from '../data/quotes'

export function Workout() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    isActive,
    exercises: loggedExercises,
    startSession,
    logSet,
    getExerciseStats,
    finishSession,
    getDuration
  } = useWorkout()

  const [selectedExercise, setSelectedExercise] = useState(null)
  const [showSummary, setShowSummary] = useState(false)
  const [summary, setSummary] = useState(null)
  const [rating, setRating] = useState(0)
  const [notes, setNotes] = useState('')
  const [timer, setTimer] = useState(0)
  const [showHype, setShowHype] = useState(false)
  const [exerciseStats, setExerciseStats] = useState({})
  const [saving, setSaving] = useState(false)
  const [workoutQuote, setWorkoutQuote] = useState('')

  // Selection state
  const [selectedExercises, setSelectedExercises] = useState(new Set())
  const [smartCount, setSmartCount] = useState(6)
  const [showSmartPicker, setShowSmartPicker] = useState(false)

  // Custom and hidden exercises
  const [customExercises, setCustomExercises] = useState([])
  const [hiddenExercises, setHiddenExercises] = useState([])

  const category = categories.find(c => c.id === categoryId)

  // Combine default and custom exercises, filter out hidden
  const allExercises = [
    ...(defaultExercises[categoryId] || []),
    ...customExercises.filter(e => e.category === categoryId)
  ]
  const exercises = allExercises.filter(e => !hiddenExercises.includes(e.id))

  // Fetch exercise stats, custom exercises, and hidden exercises on mount
  useEffect(() => {
    if (user) {
      Promise.all([
        getAllExerciseStats(user.uid),
        getCustomExercises(user.uid),
        getHiddenExercises(user.uid)
      ]).then(([stats, custom, hidden]) => {
        setExerciseStats(stats)
        setCustomExercises(custom)
        setHiddenExercises(hidden)
      }).catch(console.error)
    }
  }, [user])

  // Timer update
  useEffect(() => {
    let interval
    if (isActive) {
      interval = setInterval(() => {
        setTimer(getDuration())
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isActive, getDuration])

  const getDaysSinceLastDone = (exerciseId) => {
    const stats = exerciseStats[exerciseId]
    if (!stats?.lastUsed) return null

    const now = new Date()
    const diffTime = now - stats.lastUsed
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getLastWeight = (exerciseId) => {
    // First check if we've logged sets for this exercise in the current session
    const sessionSets = loggedExercises[exerciseId]?.sets
    if (sessionSets && sessionSets.length > 0) {
      return sessionSets[sessionSets.length - 1].weight
    }
    // Otherwise use the weight from previous sessions
    return exerciseStats[exerciseId]?.lastWeight || null
  }

  const toggleExerciseSelection = (exerciseId) => {
    setSelectedExercises(prev => {
      const newSet = new Set(prev)
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId)
      } else {
        newSet.add(exerciseId)
      }
      return newSet
    })
  }

  const selectAll = () => {
    setSelectedExercises(new Set(exercises.map(e => e.id)))
  }

  const clearSelection = () => {
    setSelectedExercises(new Set())
  }

  // Smart recommendation algorithm
  const getSmartRecommendation = (count) => {
    const recommendations = []
    const musclesCovered = new Set()

    // Score each exercise
    const scoredExercises = exercises.map(exercise => {
      const daysSince = getDaysSinceLastDone(exercise.id)
      let score = 0

      // Higher score for exercises not done recently
      if (daysSince === null) {
        score += 50 // Never done - high priority
      } else if (daysSince > 14) {
        score += 40
      } else if (daysSince > 7) {
        score += 30
      } else if (daysSince > 3) {
        score += 20
      } else {
        score += 5
      }

      // Bonus for covering new muscles
      const newMuscles = exercise.muscles?.filter(m => !musclesCovered.has(m)) || []
      score += newMuscles.length * 15

      return { exercise, score, newMuscles }
    })

    // Sort by score and pick top exercises
    scoredExercises.sort((a, b) => b.score - a.score)

    for (const item of scoredExercises) {
      if (recommendations.length >= count) break

      recommendations.push(item.exercise.id)
      // Track muscles we're now covering
      item.exercise.muscles?.forEach(m => musclesCovered.add(m))

      // Re-score remaining exercises to prioritize new muscles
      for (const other of scoredExercises) {
        if (!recommendations.includes(other.exercise.id)) {
          const newMuscles = other.exercise.muscles?.filter(m => !musclesCovered.has(m)) || []
          other.score = other.score - (other.newMuscles.length * 15) + (newMuscles.length * 15)
          other.newMuscles = newMuscles
        }
      }
      scoredExercises.sort((a, b) => b.score - a.score)
    }

    return recommendations
  }

  const applySmartRecommendation = () => {
    const recommended = getSmartRecommendation(smartCount)
    setSelectedExercises(new Set(recommended))
    setShowSmartPicker(false)
  }

  const handleStartSession = () => {
    if (selectedExercises.size === 0) {
      alert('Please select at least one exercise')
      return
    }
    setShowHype(true)
    setWorkoutQuote(getRandomQuote())
    setTimeout(() => {
      setShowHype(false)
      startSession()
    }, 1500)
  }

  const handleLogSet = (weight, reps, toFailure) => {
    if (selectedExercise) {
      logSet(selectedExercise.id, selectedExercise.name, weight, reps, toFailure)
    }
  }

  const handleFinish = () => {
    const workoutSummary = finishSession()
    setSummary(workoutSummary)
    setShowSummary(true)
  }

  const handleSave = async () => {
    if (!user || saving) return
    setSaving(true)

    try {
      await saveWorkout(user.uid, {
        category: categoryId,
        duration: summary.duration,
        rating,
        notes,
        cardio: summary.cardio,
        exercises: summary.exercises
      })
      navigate('/')
    } catch (error) {
      console.error('Failed to save workout:', error)
      alert('Failed to save workout. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    if (confirm('Are you sure you want to delete this workout?')) {
      navigate('/')
    }
  }

  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hrs > 0) {
      return `${hrs}h ${mins}m`
    }
    return `${mins}m`
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-midnight-950 flex items-center justify-center">
        <p className="text-gray-400">Category not found</p>
      </div>
    )
  }

  // Hype animation overlay
  if (showHype) {
    return (
      <div className="min-h-screen bg-midnight-950 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <span className="text-8xl block mb-4">{category.icon}</span>
          <h1 className="text-4xl font-bold text-accent">LET'S GO!</h1>
        </div>
      </div>
    )
  }

  // Summary screen with celebration
  if (showSummary && summary) {
    return (
      <div className="min-h-screen bg-midnight-950 px-4 py-6">
        <Confetti />

        {/* Celebration header */}
        <div className="text-center mb-8">
          <span className="text-6xl block mb-2">🎉</span>
          <h1 className="text-3xl font-bold text-white">Workout Complete!</h1>
          <p className="text-accent text-xl mt-2">{formatTime(summary.duration)}</p>
        </div>

        {/* Exercises summary */}
        <div className="bg-midnight-800 rounded-2xl p-4 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Exercises</h2>
          {summary.exercises.length > 0 ? (
            <div className="space-y-2">
              {summary.exercises.map((ex) => (
                <div key={ex.id} className="flex justify-between text-gray-300">
                  <span>{ex.name}</span>
                  <span className="text-accent">
                    {ex.sets.length} sets
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No exercises logged</p>
          )}
        </div>

        {/* Star rating */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">How was it?</h2>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="text-4xl transition-transform active:scale-90"
              >
                {rating >= star ? '⭐' : '☆'}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did it feel? Any PRs?"
            className="w-full h-24 p-4 rounded-xl bg-midnight-800 border-2 border-midnight-700 text-white placeholder-gray-500 focus:border-accent focus:outline-none resize-none"
          />
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button onClick={handleSave} size="xl" className="w-full" disabled={saving}>
            {saving ? 'Saving...' : 'Save Workout'}
          </Button>
          <Button onClick={handleDiscard} variant="ghost" size="lg" className="w-full text-red-400">
            Delete Workout
          </Button>
        </div>
      </div>
    )
  }

  // Get exercises to display based on mode
  const displayExercises = isActive
    ? exercises.filter(e => selectedExercises.has(e.id))
    : exercises

  return (
    <div className="min-h-screen bg-midnight-950 px-4 py-6 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/')} className="text-gray-400 p-2 -ml-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">{category.name}</h1>
          {isActive && (
            <p className="text-accent text-sm">{formatTime(timer)}</p>
          )}
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Selection controls - only show before session starts */}
      {!isActive && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-400">
              {selectedExercises.size} of {exercises.length} selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={clearSelection}
                className="text-xs text-gray-500 px-2 py-1"
              >
                Clear
              </button>
              <button
                onClick={selectAll}
                className="text-xs text-accent px-2 py-1"
              >
                Select All
              </button>
            </div>
          </div>

          {/* Smart Recommendation */}
          <button
            onClick={() => setShowSmartPicker(!showSmartPicker)}
            className="w-full p-3 rounded-xl bg-midnight-800 border border-midnight-700 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🧠</span>
              <span className="text-white text-sm">Smart Pick</span>
            </div>
            <span className="text-gray-500 text-sm">Auto-select exercises</span>
          </button>

          {showSmartPicker && (
            <div className="mt-3 p-4 rounded-xl bg-midnight-800 border border-accent/30">
              <p className="text-sm text-gray-400 mb-3">
                How many exercises do you want to do?
              </p>
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setSmartCount(Math.max(3, smartCount - 1))}
                  className="w-10 h-10 rounded-full bg-midnight-700 text-white text-xl"
                >
                  -
                </button>
                <span className="text-3xl font-bold text-accent w-12 text-center">
                  {smartCount}
                </span>
                <button
                  onClick={() => setSmartCount(Math.min(12, smartCount + 1))}
                  className="w-10 h-10 rounded-full bg-midnight-700 text-white text-xl"
                >
                  +
                </button>
              </div>
              <Button onClick={applySmartRecommendation} className="w-full">
                Pick for me
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Motivational Quote - shown during active workout */}
      {isActive && workoutQuote && (
        <div className="mb-4 p-3 rounded-xl bg-midnight-800 border border-midnight-700">
          <p className="text-sm text-gray-400 italic">"{workoutQuote}"</p>
        </div>
      )}

      {/* Exercise Grid */}
      <div className="grid grid-cols-2 gap-4">
        {displayExercises.map((exercise) => {
          const stats = getExerciseStats(exercise.id)
          const lastWeight = getLastWeight(exercise.id)
          const daysSince = getDaysSinceLastDone(exercise.id)

          return (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              stats={stats}
              lastWeight={lastWeight}
              isActive={isActive}
              isSelectionMode={!isActive}
              isSelected={selectedExercises.has(exercise.id)}
              daysSinceLastDone={daysSince}
              onClick={
                isActive
                  ? () => setSelectedExercise(exercise)
                  : () => toggleExerciseSelection(exercise.id)
              }
            />
          )
        })}
      </div>

      {/* Bottom action area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-midnight-950 via-midnight-950 to-transparent pt-12">
        {!isActive ? (
          <Button
            onClick={handleStartSession}
            size="xl"
            className="w-full"
            disabled={selectedExercises.size === 0}
          >
            Start Session ({selectedExercises.size}) 💪
          </Button>
        ) : (
          <Button onClick={handleFinish} size="xl" className="w-full">
            Finish Workout ✓
          </Button>
        )}
      </div>

      {/* Log Modal */}
      <LogModal
        isOpen={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        exercise={selectedExercise}
        lastWeight={selectedExercise ? getLastWeight(selectedExercise.id) : null}
        onLog={handleLogSet}
        loggedSets={selectedExercise ? (loggedExercises[selectedExercise.id]?.sets || []) : []}
      />
    </div>
  )
}
