import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { categories } from '../data/defaultExercises'
import { useAuth } from '../hooks/useAuth.jsx'
import { getLastWorkoutDate, getMostRecentWorkoutDate, getWorkoutStreak, getWorkoutHistory, getWeeklyCardioDistance, getUserPreferences } from '../firebase/firestore'

// Streak messages - for daily warriors (2+ day streak)
const streakMessages = [
  "Here's the fucking king! Back for more pain? That's right, own this day, you savage!",
  "Welcome back, you unbreakable motherfucker! Streaks like yours are built on blood and guts—keep pushing!",
  "The beast returns! Daily grind ain't for the weak—you're proving you're a warrior every damn time!",
  "Back at it, you legend? Streaks don't lie—you're forging an empire out of sweat and suffering!",
  "Here's the real deal! Daily commitment? That's your ticket to god mode—stay hard!",
]

// Day 1 of a new streak - encouraging start
const firstDayMessages = [
  "Day 1 locked in! This is where legends begin. Keep that momentum going!",
  "First day down! You showed up—that's already more than most. Now stack another.",
  "The journey of a thousand reps starts with day one. You've begun. Don't stop.",
  "One day, one step closer to greatness. Come back tomorrow and make it two!",
]

// Returned after a short break (1-2 days, broke a streak)
const shortBreakMessages = [
  "Welcome back! One day off ain't the end—now lace up and reclaim your power.",
  "You're here again—good. Missed a day? Shake it off and hit it harder today.",
  "Back in the fight! One slip doesn't define you—time to grind like never before.",
]

// >1 day break - harsh wake-up calls
const longBreakMessages = [
  "You fucking pathetic loser! Days off like that? Can't even commit to your own damn self—get your weak ass moving now!",
  "What the hell happened, you quitter? Multiple days gone? That's weakness talking—prove me wrong, or stay soft!",
  "Back already? After ditching for days? You're a joke if you think excuses fly here—suffer and redeem yourself!",
]

// Time-based greetings
const getTimeGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [lastWorkouts, setLastWorkouts] = useState({})
  const [streak, setStreak] = useState(0)
  const [daysSinceWorkout, setDaysSinceWorkout] = useState(null)
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [recentWorkout, setRecentWorkout] = useState(null)
  const [weeklyCardioDistance, setWeeklyCardioDistance] = useState(0)
  const [weeklyCardioGoal, setWeeklyCardioGoal] = useState(0)

  // Fetch last workout dates for all categories
  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch all data in parallel
        const [dates, currentStreak, lastWorkoutDate, history, cardioDistance, prefs] = await Promise.all([
          Promise.all(categories.map(async (category) => {
            const date = await getLastWorkoutDate(user.uid, category.id)
            return { id: category.id, date }
          })),
          getWorkoutStreak(user.uid),
          getMostRecentWorkoutDate(user.uid),
          getWorkoutHistory(user.uid, 1),
          getWeeklyCardioDistance(user.uid),
          getUserPreferences(user.uid)
        ])

        // Set cardio data
        setWeeklyCardioDistance(cardioDistance)
        setWeeklyCardioGoal(prefs.weeklyCardioGoal || 0)

        // Set last workouts
        const workoutDates = {}
        dates.forEach(({ id, date }) => {
          workoutDates[id] = date
        })
        setLastWorkouts(workoutDates)

        // Set streak
        setStreak(currentStreak)

        // Set recent workout
        if (history.length > 0) {
          setRecentWorkout(history[0])
        }

        // Set welcome message
        if (lastWorkoutDate) {
          const now = new Date()
          const diffTime = now - lastWorkoutDate
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
          setDaysSinceWorkout(diffDays)

          if (currentStreak >= 2) {
            // On a 2+ day streak - keep it going!
            setWelcomeMessage(streakMessages[Math.floor(Math.random() * streakMessages.length)])
          } else if (currentStreak === 1) {
            // Day 1 of a new streak - encouraging start
            setWelcomeMessage(firstDayMessages[Math.floor(Math.random() * firstDayMessages.length)])
          } else if (diffDays <= 2) {
            // No streak but worked out recently (just broke a streak)
            setWelcomeMessage(shortBreakMessages[Math.floor(Math.random() * shortBreakMessages.length)])
          } else {
            // Long break - harsh wake-up call
            setWelcomeMessage(longBreakMessages[Math.floor(Math.random() * longBreakMessages.length)])
          }
        } else {
          setWelcomeMessage('')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, location.key])

  const getDaysAgo = (date) => {
    if (!date) return null
    const now = new Date()
    const diffTime = now - date
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const isCompletedThisWeek = (date) => {
    if (!date) return false
    const daysAgo = getDaysAgo(date)
    return daysAgo !== null && daysAgo <= 7
  }

  // Weekly goal is 5 workouts (excluding cardio)
  const strengthCategories = categories.filter(cat => cat.id !== 'cardio')
  const completedThisWeek = strengthCategories.filter(cat =>
    isCompletedThisWeek(lastWorkouts[cat.id])
  )
  const allComplete = completedThisWeek.length === 5

  const getCategoryName = (categoryId) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId
  }

  const getCategoryIcon = (categoryId) => {
    return categories.find(c => c.id === categoryId)?.icon || '💪'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-950 px-4 py-6 pb-20">
        {/* Skeleton loader */}
        <div className="animate-pulse">
          <div className="h-8 bg-midnight-800 rounded w-32 mb-2" />
          <div className="h-4 bg-midnight-800 rounded w-64 mb-6" />
          <div className="h-20 bg-midnight-800 rounded-xl mb-6" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-36 bg-midnight-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-midnight-950 px-4 py-6 pb-20">
      {/* Header with greeting */}
      <div className="mb-6">
        <p className="text-gray-500 text-sm">{getTimeGreeting()}</p>
        <h1 className="text-3xl font-bold text-white">
          {daysSinceWorkout === null ? (
            <>Welcome, {user?.displayName || 'Athlete'}!</>
          ) : (
            <>{user?.displayName || 'Athlete'}</>
          )}
        </h1>

        {/* Streak badge */}
        {streak >= 2 && (
          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full border border-orange-500/30">
            <span className="text-xl animate-pulse">🔥</span>
            <span className="text-orange-400 font-bold">{streak} day streak!</span>
          </div>
        )}

        {welcomeMessage && (
          <p className="text-gray-400 text-sm mt-3 italic leading-relaxed">"{welcomeMessage}"</p>
        )}
      </div>

      {/* Weekly Progress Banner */}
      {allComplete ? (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent" />
          <div className="flex items-center gap-3 relative">
            <span className="text-4xl">🏆</span>
            <div>
              <p className="font-bold text-green-400 text-lg">Full Week Complete!</p>
              <p className="text-sm text-green-300/70">All 5 workouts done. You're a machine.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-midnight-800 to-midnight-900 border border-midnight-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Weekly progress</span>
            <span className="text-sm font-bold text-accent">{completedThisWeek.length}/5</span>
          </div>
          <div className="h-3 bg-midnight-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent via-orange-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedThisWeek.length / 5) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {strengthCategories.map(cat => (
              <div
                key={cat.id}
                className={`text-lg transition-all ${
                  isCompletedThisWeek(lastWorkouts[cat.id])
                    ? 'opacity-100 scale-110'
                    : 'opacity-30 grayscale'
                }`}
              >
                {cat.icon}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cardio Tracker */}
      {weeklyCardioGoal > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-midnight-800 to-midnight-900 border border-midnight-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🚴</span>
              <span className="text-sm text-gray-400">Weekly cardio</span>
            </div>
            <span className="text-sm font-bold text-accent">
              {weeklyCardioDistance.toFixed(1)} / {weeklyCardioGoal}km
            </span>
          </div>
          <div className="h-3 bg-midnight-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                weeklyCardioDistance >= weeklyCardioGoal
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}
              style={{ width: `${Math.min(100, (weeklyCardioDistance / weeklyCardioGoal) * 100)}%` }}
            />
          </div>
          {weeklyCardioDistance >= weeklyCardioGoal && (
            <p className="text-xs text-green-400 mt-2 text-center">Goal reached! 🎉</p>
          )}
        </div>
      )}

      {/* Category Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {categories.map((category, index) => {
          const lastDate = lastWorkouts[category.id]
          const lastDays = getDaysAgo(lastDate)
          const doneThisWeek = isCompletedThisWeek(lastDate)

          return (
            <Card
              key={category.id}
              onClick={() => navigate(category.id === 'cardio' ? '/cardio' : `/workout/${category.id}`)}
              className={`min-h-[140px] flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] ${
                doneThisWeek ? 'border-green-500/50 bg-green-500/5' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex justify-between items-start relative">
                <span className="text-3xl">{category.icon}</span>
                {doneThisWeek && (
                  <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="relative">
                <h2 className="text-lg font-semibold text-white">
                  {category.name}
                </h2>
                <p className={`text-sm ${doneThisWeek ? 'text-green-400' : 'text-gray-400'}`}>
                  {lastDays !== null
                    ? lastDays === 0
                      ? 'Today'
                      : lastDays === 1
                        ? 'Yesterday'
                        : `${lastDays} days ago`
                    : 'Not yet started'}
                </p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Recent Workout Summary */}
      {recentWorkout && (
        <div className="mb-6">
          <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-3">Last Session</h3>
          <div className="p-4 rounded-2xl bg-midnight-800/50 border border-midnight-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getCategoryIcon(recentWorkout.category)}</span>
                <div>
                  <p className="text-white font-medium">{getCategoryName(recentWorkout.category)}</p>
                  <p className="text-sm text-gray-500">
                    {recentWorkout.exercises?.length || 0} exercises • {recentWorkout.duration || 0}min
                    {recentWorkout.rating > 0 && ` • ${recentWorkout.rating}⭐`}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {recentWorkout.createdAt?.toLocaleDateString('en-AU', { weekday: 'short' })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-midnight-900/95 backdrop-blur-sm border-t border-midnight-700 safe-area-bottom">
        <div className="flex justify-around items-center max-w-md mx-auto px-4 py-2">
          <button className="flex flex-col items-center text-accent p-3 touch-manipulation min-w-[64px]">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span className="text-xs mt-1 font-medium">Home</span>
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="flex flex-col items-center text-gray-500 active:text-gray-300 transition-colors p-3 touch-manipulation min-w-[64px]"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <span className="text-xs mt-1">Analytics</span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="flex flex-col items-center text-gray-500 active:text-gray-300 transition-colors p-3 touch-manipulation min-w-[64px]"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
