import { useState, useCallback } from 'react'

export function useWorkout() {
  const [isActive, setIsActive] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [exercises, setExercises] = useState({})
  const [cardio, setCardio] = useState(null)

  const startSession = useCallback(() => {
    setIsActive(true)
    setStartTime(Date.now())
    setExercises({})
    setCardio(null)
  }, [])

  const logSet = useCallback((exerciseId, exerciseName, weight, reps, toFailure = false) => {
    setExercises(prev => {
      const exercise = prev[exerciseId] || { name: exerciseName, sets: [] }
      return {
        ...prev,
        [exerciseId]: {
          ...exercise,
          sets: [...exercise.sets, { weight, reps, toFailure, timestamp: Date.now() }]
        }
      }
    })
  }, [])

  const logCardio = useCallback((time, distance) => {
    setCardio({ time, distance })
  }, [])

  const getExerciseStats = useCallback((exerciseId) => {
    const exercise = exercises[exerciseId]
    if (!exercise || exercise.sets.length === 0) {
      return { sets: 0, avgReps: 0, lastWeight: null, hasFailure: false }
    }

    const totalReps = exercise.sets.reduce((sum, set) => sum + set.reps, 0)
    const avgReps = Math.round(totalReps / exercise.sets.length)
    const lastWeight = exercise.sets[exercise.sets.length - 1].weight
    const hasFailure = exercise.sets.some(set => set.toFailure)

    return {
      sets: exercise.sets.length,
      avgReps,
      lastWeight,
      hasFailure
    }
  }, [exercises])

  const finishSession = useCallback(() => {
    const duration = startTime ? Math.round((Date.now() - startTime) / 1000 / 60) : 0
    const summary = {
      duration,
      exercises: Object.entries(exercises).map(([id, data]) => ({
        id,
        name: data.name,
        sets: data.sets
      })),
      cardio
    }

    setIsActive(false)
    setStartTime(null)
    setExercises({})
    setCardio(null)

    return summary
  }, [startTime, exercises, cardio])

  const getDuration = useCallback(() => {
    if (!startTime) return 0
    return Math.round((Date.now() - startTime) / 1000 / 60)
  }, [startTime])

  return {
    isActive,
    startTime,
    exercises,
    cardio,
    startSession,
    logSet,
    logCardio,
    getExerciseStats,
    finishSession,
    getDuration
  }
}
