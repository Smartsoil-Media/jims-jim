import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { LineChart } from '../components/ui/LineChart'
import { useAuth } from '../hooks/useAuth.jsx'
import { getAllWorkouts, getAllPRs, getWorkoutStreak, getCustomExercises } from '../firebase/firestore'
import { categories, defaultExercises } from '../data/defaultExercises'

export function Analytics() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [prs, setPRs] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [customExercises, setCustomExercises] = useState([])

  // Chart state
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedExercises, setSelectedExercises] = useState([])

  // Get all exercises (default + custom)
  const getAllExercisesList = () => {
    return [
      ...Object.values(defaultExercises).flat(),
      ...customExercises
    ]
  }

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        const [allWorkouts, allPRs, streak, custom] = await Promise.all([
          getAllWorkouts(user.uid),
          getAllPRs(user.uid),
          getWorkoutStreak(user.uid),
          getCustomExercises(user.uid)
        ])

        setWorkouts(allWorkouts)
        setPRs(allPRs)
        setCurrentStreak(streak)
        setCustomExercises(custom)

        // Calculate best streak from workout history
        const best = calculateBestStreak(allWorkouts)
        setBestStreak(best)

      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, location.key])

  // Calculate best streak ever
  const calculateBestStreak = (workoutList) => {
    if (workoutList.length === 0) return 0

    const dates = [...new Set(
      workoutList
        .filter(w => w.createdAt)
        .map(w => w.createdAt.toDateString())
    )].sort((a, b) => new Date(a) - new Date(b))

    if (dates.length === 0) return 0

    let maxStreak = 1
    let currentStreak = 1

    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1])
      const curr = new Date(dates[i])
      const diffDays = Math.floor((curr - prev) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 1
      }
    }

    return maxStreak
  }

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)

    const thisWeek = workouts.filter(w => w.createdAt >= weekAgo)
    const thisMonth = workouts.filter(w => w.createdAt >= monthAgo)

    // Weekly category completions
    const weeklyCategories = new Set(thisWeek.map(w => w.category))

    // Category distribution
    const categoryCount = {}
    workouts.forEach(w => {
      categoryCount[w.category] = (categoryCount[w.category] || 0) + 1
    })

    // Average rating
    const rated = workouts.filter(w => w.rating > 0)
    const avgRating = rated.length > 0
      ? (rated.reduce((sum, w) => sum + w.rating, 0) / rated.length).toFixed(1)
      : '—'

    // Total time
    const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration || 0), 0)
    const totalHours = Math.floor(totalMinutes / 60)

    return {
      total: workouts.length,
      thisWeek: thisWeek.length,
      thisMonth: thisMonth.length,
      weeklyProgress: weeklyCategories.size,
      categoryCount,
      avgRating,
      totalHours
    }
  }, [workouts])

  // Muscle group breakdown (this week)
  const muscleBreakdown = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
    const thisWeek = workouts.filter(w => w.createdAt >= weekAgo)

    const muscles = {}
    const allExercises = getAllExercisesList()

    thisWeek.forEach(workout => {
      workout.exercises?.forEach(ex => {
        // Find the exercise definition to get muscles
        const exerciseDef = allExercises.find(e => e.id === ex.id)
        if (exerciseDef?.muscles) {
          exerciseDef.muscles.forEach(muscle => {
            muscles[muscle] = (muscles[muscle] || 0) + ex.sets.length
          })
        }
      })
    })

    return Object.entries(muscles)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  }, [workouts, customExercises])

  // Activity calendar (last 28 days)
  const activityCalendar = useMemo(() => {
    const days = []
    const now = new Date()

    for (let i = 27; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toDateString()

      const dayWorkouts = workouts.filter(w =>
        w.createdAt?.toDateString() === dateStr
      )

      days.push({
        date,
        count: dayWorkouts.length,
        isToday: i === 0
      })
    }

    return days
  }, [workouts])

  // Exercise data for charts
  const exerciseChartData = useMemo(() => {
    if (selectedExercises.length === 0) return []

    const allExercises = getAllExercisesList()

    return selectedExercises.map(exerciseId => {
      const exerciseDef = allExercises.find(e => e.id === exerciseId)

      const dataPoints = []

      workouts.forEach(workout => {
        const ex = workout.exercises?.find(e => e.id === exerciseId)
        if (ex && ex.sets.length > 0) {
          // Get max weight from this session
          const maxWeight = Math.max(...ex.sets.map(s => s.weight))
          dataPoints.push({
            date: workout.createdAt,
            value: maxWeight
          })
        }
      })

      return {
        label: exerciseDef?.name || exerciseId,
        data: dataPoints
      }
    }).filter(ds => ds.data.length > 0)
  }, [selectedExercises, workouts, customExercises])

  // Get exercises for selected category (including custom)
  const categoryExercises = selectedCategory
    ? [
        ...(defaultExercises[selectedCategory] || []),
        ...customExercises.filter(e => e.category === selectedCategory)
      ]
    : []

  const toggleExercise = (exerciseId) => {
    setSelectedExercises(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId)
      }
      if (prev.length >= 5) {
        return prev // Max 5 exercises
      }
      return [...prev, exerciseId]
    })
  }

  const getCategoryName = (categoryId) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId
  }

  const getCategoryIcon = (categoryId) => {
    return categories.find(c => c.id === categoryId)?.icon || '💪'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-950 flex items-center justify-center">
        <p className="text-accent">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-midnight-950 px-4 py-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-1">Track your progress</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="text-center py-3">
          <p className="text-2xl font-bold text-accent">{stats.total}</p>
          <p className="text-xs text-gray-400">Total Workouts</p>
        </Card>
        <Card className="text-center py-3">
          <p className="text-2xl font-bold text-accent">{stats.thisWeek}</p>
          <p className="text-xs text-gray-400">This Week</p>
        </Card>
        <Card className="text-center py-3">
          <p className="text-2xl font-bold text-accent">{stats.weeklyProgress}/5</p>
          <p className="text-xs text-gray-400">Weekly Progress</p>
        </Card>
        <Card className="text-center py-3">
          <p className="text-2xl font-bold text-accent">{stats.avgRating}⭐</p>
          <p className="text-xs text-gray-400">Avg Rating</p>
        </Card>
      </div>

      {/* Streak Stats */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Streaks</h2>
        <div className="flex gap-4">
          <div className="flex-1 text-center p-3 bg-midnight-700 rounded-xl">
            <p className="text-2xl font-bold text-accent">
              {currentStreak > 0 ? `🔥 ${currentStreak}` : '0'}
            </p>
            <p className="text-xs text-gray-400">Current Streak</p>
          </div>
          <div className="flex-1 text-center p-3 bg-midnight-700 rounded-xl">
            <p className="text-2xl font-bold text-green-400">
              {bestStreak > 0 ? `🏆 ${bestStreak}` : '0'}
            </p>
            <p className="text-xs text-gray-400">Best Streak</p>
          </div>
          <div className="flex-1 text-center p-3 bg-midnight-700 rounded-xl">
            <p className="text-2xl font-bold text-blue-400">{stats.totalHours}h</p>
            <p className="text-xs text-gray-400">Total Time</p>
          </div>
        </div>
      </Card>

      {/* Activity Calendar */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Activity (Last 28 Days)</h2>
        <div className="grid grid-cols-7 gap-1">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <div key={i} className="text-center text-xs text-gray-500 mb-1">{day}</div>
          ))}
          {activityCalendar.map((day, i) => (
            <div
              key={i}
              className={`aspect-square rounded-sm flex items-center justify-center text-xs ${
                day.count === 0
                  ? 'bg-midnight-700'
                  : day.count === 1
                    ? 'bg-green-500/40'
                    : 'bg-green-500'
              } ${day.isToday ? 'ring-2 ring-accent' : ''}`}
              title={`${day.date.toLocaleDateString()}: ${day.count} workout${day.count !== 1 ? 's' : ''}`}
            >
              {day.count > 1 && <span className="text-white font-bold">{day.count}</span>}
            </div>
          ))}
        </div>
      </Card>

      {/* Muscle Group Breakdown */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Muscles Hit This Week</h2>
        {muscleBreakdown.length > 0 ? (
          <div className="space-y-2">
            {muscleBreakdown.map(([muscle, sets]) => {
              const maxSets = muscleBreakdown[0][1]
              const percentage = (sets / maxSets) * 100
              return (
                <div key={muscle}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 capitalize">{muscle}</span>
                    <span className="text-gray-500">{sets} sets</span>
                  </div>
                  <div className="h-2 bg-midnight-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-green-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No workouts this week yet</p>
        )}
      </Card>

      {/* Personal Records */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Personal Records 🏆</h2>
        {prs.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {prs
              .filter(pr => pr.personalBest?.weight)
              .sort((a, b) => (b.personalBest?.weight || 0) - (a.personalBest?.weight || 0))
              .map(pr => {
                const allExercises = getAllExercisesList()
                const exerciseDef = allExercises.find(e => e.id === pr.exerciseId)
                return (
                  <div key={pr.id} className="flex justify-between items-center py-2 border-b border-midnight-700 last:border-0">
                    <span className="text-gray-300">{exerciseDef?.name || pr.exerciseId}</span>
                    <span className="text-accent font-bold">{pr.personalBest.weight}kg</span>
                  </div>
                )
              })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Complete some workouts to set PRs!</p>
        )}
      </Card>

      {/* Category Breakdown */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Workout Distribution</h2>
        {Object.keys(stats.categoryCount).length > 0 ? (
          <div className="space-y-2">
            {categories.map(cat => {
              const count = stats.categoryCount[cat.id] || 0
              const maxCount = Math.max(...Object.values(stats.categoryCount))
              const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0
              return (
                <div key={cat.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">
                      {cat.icon} {cat.name}
                    </span>
                    <span className="text-gray-500">{count}</span>
                  </div>
                  <div className="h-2 bg-midnight-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No workouts yet</p>
        )}
      </Card>

      {/* Exercise Progress Chart */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Weight Progress</h2>

        {/* Category Filter */}
        <div className="mb-3">
          <label className="text-sm text-gray-400 block mb-2">Select Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setSelectedExercises([])
            }}
            className="w-full bg-midnight-700 text-white rounded-lg px-3 py-2 border border-midnight-600 focus:border-accent focus:outline-none"
          >
            <option value="">Choose a category...</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Exercise Selection */}
        {selectedCategory && (
          <div className="mb-4">
            <label className="text-sm text-gray-400 block mb-2">
              Select Exercises (max 5)
            </label>
            <div className="flex flex-wrap gap-2">
              {categoryExercises.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => toggleExercise(ex.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedExercises.includes(ex.id)
                      ? 'bg-accent text-midnight-950 font-medium'
                      : 'bg-midnight-700 text-gray-300 hover:bg-midnight-600'
                  }`}
                >
                  {ex.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chart */}
        <LineChart datasets={exerciseChartData} height={200} />
      </Card>

      {/* Recent Workouts */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Workouts</h2>
        {workouts.length > 0 ? (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {[...workouts].reverse().slice(0, 15).map((workout) => (
              <div key={workout.id} className="flex items-center justify-between py-2 border-b border-midnight-700 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getCategoryIcon(workout.category)}</span>
                  <div>
                    <p className="text-white font-medium">{getCategoryName(workout.category)}</p>
                    <p className="text-xs text-gray-500">
                      {workout.duration}min • {workout.exercises?.length || 0} exercises
                      {workout.rating > 0 && ` • ${workout.rating}⭐`}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">
                  {workout.createdAt?.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No workouts yet. Get moving!</p>
        )}
      </Card>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-midnight-900 border-t border-midnight-700 px-6 py-3">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button onClick={() => navigate('/')} className="flex flex-col items-center text-gray-500">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span className="text-xs mt-1">Home</span>
          </button>
          <button className="flex flex-col items-center text-accent">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <span className="text-xs mt-1">Analytics</span>
          </button>
          <button onClick={() => navigate('/settings')} className="flex flex-col items-center text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
