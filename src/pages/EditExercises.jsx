import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth.jsx'
import { categories as allCategories, defaultExercises } from '../data/defaultExercises'

// Filter out cardio since it uses its own page
const categories = allCategories.filter(c => c.id !== 'cardio')
import {
  getCustomExercises,
  getHiddenExercises,
  toggleExerciseVisibility,
  deleteCustomExercise
} from '../firebase/firestore'

export function EditExercises() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id)
  const [customExercises, setCustomExercises] = useState([])
  const [hiddenExercises, setHiddenExercises] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        const [custom, hidden] = await Promise.all([
          getCustomExercises(user.uid),
          getHiddenExercises(user.uid)
        ])
        setCustomExercises(custom)
        setHiddenExercises(hidden)
      } catch (error) {
        console.error('Error fetching exercise data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleToggleVisibility = async (exerciseId) => {
    if (!user) return

    try {
      const newHidden = await toggleExerciseVisibility(user.uid, exerciseId)
      setHiddenExercises(newHidden)
    } catch (error) {
      console.error('Error toggling visibility:', error)
      alert('Failed to update. Check Firestore rules allow userPreferences collection.')
    }
  }

  const handleDeleteCustom = async (exercise) => {
    if (!confirm('Delete this custom exercise?')) return

    try {
      await deleteCustomExercise(exercise.docId)
      setCustomExercises(prev => prev.filter(e => e.id !== exercise.id))
    } catch (error) {
      console.error('Error deleting custom exercise:', error)
      alert('Failed to delete exercise')
    }
  }

  // Get exercises for selected category
  const defaultForCategory = defaultExercises[selectedCategory] || []
  const customForCategory = customExercises.filter(e => e.category === selectedCategory)
  const allExercises = [...defaultForCategory, ...customForCategory]

  const category = categories.find(c => c.id === selectedCategory)

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
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/settings')} className="text-gray-400 p-2 -ml-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Exercises</h1>
          <p className="text-gray-400 text-sm">Show/hide exercises for your workouts</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-accent text-midnight-950 font-medium'
                : 'bg-midnight-800 text-gray-300'
            }`}
          >
            <span>{cat.icon}</span>
            <span className="text-sm">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Exercise Count */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-400">
          {allExercises.filter(e => !hiddenExercises.includes(e.id)).length} of {allExercises.length} visible
        </p>
        <Button
          onClick={() => navigate('/add-exercise', { state: { category: selectedCategory } })}
          variant="secondary"
          size="sm"
        >
          + Add Custom
        </Button>
      </div>

      {/* Exercise List */}
      <div className="space-y-3">
        {allExercises.map(exercise => {
          const isHidden = hiddenExercises.includes(exercise.id)
          const isCustom = customExercises.some(e => e.id === exercise.id)

          return (
            <Card
              key={exercise.id}
              className={`flex items-center justify-between ${isHidden ? 'opacity-50' : ''}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-medium">{exercise.name}</h3>
                  {isCustom && (
                    <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                      Custom
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {exercise.muscles?.slice(0, 3).join(', ')}
                </p>
                <p className="text-xs text-gray-600">
                  {exercise.equipment} • {exercise.defaultSets}×{exercise.defaultReps}
                  {exercise.unit === 'seconds' ? 's' : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isCustom && (
                  <button
                    onClick={() => handleDeleteCustom(exercise)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => handleToggleVisibility(exercise.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    isHidden
                      ? 'text-gray-500 hover:bg-midnight-700'
                      : 'text-green-500 hover:bg-green-500/20'
                  }`}
                >
                  {isHidden ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </Card>
          )
        })}
      </div>

      {customForCategory.length === 0 && defaultForCategory.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No exercises in this category</p>
          <Button
            onClick={() => navigate('/add-exercise', { state: { category: selectedCategory } })}
            className="mt-4"
          >
            Add Custom Exercise
          </Button>
        </div>
      )}
    </div>
  )
}
