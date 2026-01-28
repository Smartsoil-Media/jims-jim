import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth.jsx'
import { categories as allCategories } from '../data/defaultExercises'

// Filter out cardio since it uses its own page
const categories = allCategories.filter(c => c.id !== 'cardio')
import { addCustomExercise } from '../firebase/firestore'

const MUSCLE_OPTIONS = [
  'shoulders', 'biceps', 'triceps', 'forearms',
  'chest', 'lats', 'upper back', 'lower back',
  'core', 'abs', 'obliques',
  'quads', 'glutes', 'hamstrings', 'calves',
  'hip flexors', 'hips'
]

const EQUIPMENT_OPTIONS = [
  'dumbbells', 'dumbbell', 'kettlebell', 'barbell',
  'bench', 'pull-up bar', 'band', 'none'
]

export function AddExercise() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const initialCategory = location.state?.category || categories[0].id

  const [name, setName] = useState('')
  const [category, setCategory] = useState(initialCategory)
  const [muscles, setMuscles] = useState([])
  const [equipment, setEquipment] = useState('dumbbells')
  const [defaultSets, setDefaultSets] = useState(3)
  const [defaultReps, setDefaultReps] = useState(10)
  const [unit, setUnit] = useState('reps')
  const [golfNote, setGolfNote] = useState('')
  const [saving, setSaving] = useState(false)

  const toggleMuscle = (muscle) => {
    setMuscles(prev => {
      if (prev.includes(muscle)) {
        return prev.filter(m => m !== muscle)
      }
      return [...prev, muscle]
    })
  }

  const handleSave = async () => {
    if (!user) return
    if (!name.trim()) {
      alert('Please enter an exercise name')
      return
    }
    if (muscles.length === 0) {
      alert('Please select at least one muscle group')
      return
    }

    setSaving(true)

    try {
      const exerciseId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const exerciseData = {
        id: exerciseId,
        name: name.trim(),
        category,
        muscles,
        equipment,
        defaultSets,
        defaultReps
      }

      // Only add optional fields if they have values (Firestore doesn't accept undefined)
      if (unit === 'seconds') {
        exerciseData.unit = 'seconds'
      }
      if (golfNote.trim()) {
        exerciseData.golfNote = golfNote.trim()
      }

      await addCustomExercise(user.uid, exerciseData)

      navigate('/edit-exercises')
    } catch (error) {
      console.error('Error adding exercise:', error)
      alert('Failed to add exercise')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-midnight-950 px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 p-2 -ml-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Add Exercise</h1>
          <p className="text-gray-400 text-sm">Create a custom exercise</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="text-sm text-gray-400 block mb-2">Exercise Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Incline Dumbbell Curls"
            className="w-full h-12 px-4 rounded-xl bg-midnight-800 border-2 border-midnight-700 text-white placeholder-gray-500 focus:border-accent focus:outline-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm text-gray-400 block mb-2">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-midnight-800 border-2 border-midnight-700 text-white focus:border-accent focus:outline-none"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Muscles */}
        <div>
          <label className="text-sm text-gray-400 block mb-2">
            Target Muscles * ({muscles.length} selected)
          </label>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_OPTIONS.map(muscle => (
              <button
                key={muscle}
                type="button"
                onClick={() => toggleMuscle(muscle)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors capitalize ${
                  muscles.includes(muscle)
                    ? 'bg-accent text-midnight-950 font-medium'
                    : 'bg-midnight-800 text-gray-300 border border-midnight-700'
                }`}
              >
                {muscle}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div>
          <label className="text-sm text-gray-400 block mb-2">Equipment</label>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map(equip => (
              <button
                key={equip}
                type="button"
                onClick={() => setEquipment(equip)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors capitalize ${
                  equipment === equip
                    ? 'bg-accent text-midnight-950 font-medium'
                    : 'bg-midnight-800 text-gray-300 border border-midnight-700'
                }`}
              >
                {equip}
              </button>
            ))}
          </div>
        </div>

        {/* Default Sets & Reps */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-3">Default Sets</label>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setDefaultSets(Math.max(1, defaultSets - 1))}
                className="w-14 h-14 rounded-xl bg-midnight-800 text-white text-2xl font-bold border border-midnight-700 active:bg-midnight-700 active:scale-95 transition-transform touch-manipulation"
              >
                −
              </button>
              <span className="text-3xl font-bold text-accent">{defaultSets}</span>
              <button
                type="button"
                onClick={() => setDefaultSets(Math.min(10, defaultSets + 1))}
                className="w-14 h-14 rounded-xl bg-midnight-800 text-white text-2xl font-bold border border-midnight-700 active:bg-midnight-700 active:scale-95 transition-transform touch-manipulation"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-3">
              Default {unit === 'seconds' ? 'Seconds' : 'Reps'}
            </label>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setDefaultReps(Math.max(1, defaultReps - (unit === 'seconds' ? 5 : 1)))}
                className="w-14 h-14 rounded-xl bg-midnight-800 text-white text-2xl font-bold border border-midnight-700 active:bg-midnight-700 active:scale-95 transition-transform touch-manipulation"
              >
                −
              </button>
              <span className="text-3xl font-bold text-accent">{defaultReps}</span>
              <button
                type="button"
                onClick={() => setDefaultReps(defaultReps + (unit === 'seconds' ? 5 : 1))}
                className="w-14 h-14 rounded-xl bg-midnight-800 text-white text-2xl font-bold border border-midnight-700 active:bg-midnight-700 active:scale-95 transition-transform touch-manipulation"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Unit Toggle */}
        <div>
          <label className="text-sm text-gray-400 block mb-2">Measurement</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setUnit('reps')}
              className={`flex-1 py-2 rounded-xl text-sm transition-colors ${
                unit === 'reps'
                  ? 'bg-accent text-midnight-950 font-medium'
                  : 'bg-midnight-800 text-gray-300 border border-midnight-700'
              }`}
            >
              Reps
            </button>
            <button
              type="button"
              onClick={() => {
                setUnit('seconds')
                if (defaultReps < 15) setDefaultReps(30)
              }}
              className={`flex-1 py-2 rounded-xl text-sm transition-colors ${
                unit === 'seconds'
                  ? 'bg-accent text-midnight-950 font-medium'
                  : 'bg-midnight-800 text-gray-300 border border-midnight-700'
              }`}
            >
              Seconds (timed)
            </button>
          </div>
        </div>

        {/* Golf Note (optional) */}
        <div>
          <label className="text-sm text-gray-400 block mb-2">Golf Benefit (optional)</label>
          <input
            type="text"
            value={golfNote}
            onChange={(e) => setGolfNote(e.target.value)}
            placeholder="e.g., Improves hip rotation for drives"
            className="w-full h-12 px-4 rounded-xl bg-midnight-800 border-2 border-midnight-700 text-white placeholder-gray-500 focus:border-accent focus:outline-none"
          />
        </div>

        {/* Preview */}
        {name && (
          <div className="p-4 rounded-xl bg-midnight-800 border border-midnight-700">
            <p className="text-xs text-gray-500 mb-2">Preview</p>
            <h3 className="text-white font-medium">{name}</h3>
            <p className="text-sm text-gray-400">
              {muscles.slice(0, 3).join(', ') || 'No muscles selected'}
            </p>
            <p className="text-xs text-gray-500">
              {equipment} • {defaultSets}×{defaultReps}{unit === 'seconds' ? 's' : ''}
            </p>
            {golfNote && (
              <p className="text-xs text-green-400 mt-1">🏌️ {golfNote}</p>
            )}
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          size="xl"
          className="w-full"
          disabled={saving || !name.trim() || muscles.length === 0}
        >
          {saving ? 'Saving...' : 'Add Exercise'}
        </Button>
      </div>
    </div>
  )
}
