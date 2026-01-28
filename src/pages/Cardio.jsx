import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth.jsx'
import { saveWorkout } from '../firebase/firestore'

export function Cardio() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedType, setSelectedType] = useState(null)
  const [duration, setDuration] = useState(30)
  const [distance, setDistance] = useState('')
  const [saving, setSaving] = useState(false)
  const [startTime, setStartTime] = useState(null)

  const runTypes = [
    { id: 'treadmill', name: 'Treadmill', icon: '🏃', description: 'Indoor run' },
    { id: 'outdoor', name: 'Outdoor Run', icon: '🌳', description: 'Hit the streets' },
  ]

  // Start timer when type is selected
  useEffect(() => {
    if (selectedType && !startTime) {
      setStartTime(Date.now())
    }
  }, [selectedType, startTime])

  const handleSave = async () => {
    if (!user || !selectedType) return

    setSaving(true)
    try {
      const workoutData = {
        category: 'cardio',
        duration: duration,
        exercises: [{
          id: selectedType,
          name: runTypes.find(t => t.id === selectedType)?.name || 'Run',
          sets: [{
            reps: duration,
            weight: distance ? parseFloat(distance) : 0,
            toFailure: false
          }]
        }],
        cardio: {
          type: selectedType,
          duration: duration,
          distance: distance ? parseFloat(distance) : null
        }
      }

      await saveWorkout(user.uid, workoutData)
      navigate('/')
    } catch (error) {
      console.error('Error saving cardio:', error)
      alert('Failed to save cardio session')
    } finally {
      setSaving(false)
    }
  }

  const adjustDuration = (amount) => {
    setDuration(prev => Math.max(1, prev + amount))
  }

  // Type selection screen
  if (!selectedType) {
    return (
      <div className="min-h-screen bg-midnight-950 px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/')} className="text-gray-400 p-2 -ml-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Cardio</h1>
            <p className="text-gray-400 text-sm">Choose your run type</p>
          </div>
        </div>

        {/* Run Type Selection */}
        <div className="space-y-4">
          {runTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className="w-full p-6 rounded-2xl bg-midnight-800 border-2 border-midnight-700 hover:border-accent/50 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">{type.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-white group-hover:text-accent transition-colors">
                    {type.name}
                  </h2>
                  <p className="text-gray-400">{type.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Logging screen
  const selectedRunType = runTypes.find(t => t.id === selectedType)

  return (
    <div className="min-h-screen bg-midnight-950 px-4 py-6 pb-32">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setSelectedType(null)} className="text-gray-400 p-2 -ml-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>{selectedRunType?.icon}</span>
            {selectedRunType?.name}
          </h1>
          <p className="text-gray-400 text-sm">Log your run</p>
        </div>
      </div>

      {/* Duration Input */}
      <div className="mb-8">
        <label className="block text-sm text-gray-400 mb-3">Duration (minutes)</label>
        <div className="flex items-center justify-center gap-5">
          <button
            onClick={() => adjustDuration(-5)}
            className="w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-midnight-800 text-white text-3xl font-bold border-2 border-midnight-700 active:bg-midnight-700 active:scale-95 transition-transform touch-manipulation"
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            value={duration}
            onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
            className="w-28 h-20 rounded-2xl bg-midnight-800 border-2 border-midnight-700 text-center text-4xl font-bold text-accent focus:border-accent focus:outline-none"
          />
          <button
            onClick={() => adjustDuration(5)}
            className="w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-midnight-800 text-white text-3xl font-bold border-2 border-midnight-700 active:bg-midnight-700 active:scale-95 transition-transform touch-manipulation"
          >
            +
          </button>
        </div>
        <p className="text-center text-gray-500 mt-2">min</p>
      </div>

      {/* Distance Input */}
      <div className="mb-8">
        <label className="block text-sm text-gray-400 mb-3">Distance (km) - optional</label>
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          placeholder="0.0"
          className="w-full h-16 rounded-2xl bg-midnight-800 border-2 border-midnight-700 text-center text-2xl font-bold text-white placeholder-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Stats Preview */}
      {distance && duration > 0 && (
        <Card className="mb-8">
          <h3 className="text-sm text-gray-400 mb-3">Session Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-accent">{duration}</p>
              <p className="text-sm text-gray-500">minutes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">{distance}</p>
              <p className="text-sm text-gray-500">km</p>
            </div>
            {parseFloat(distance) > 0 && (
              <>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {(duration / parseFloat(distance)).toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-500">min/km pace</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {((parseFloat(distance) / duration) * 60).toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-500">km/h avg</p>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-12 pb-4 bg-gradient-to-t from-midnight-950 via-midnight-950 to-transparent safe-area-bottom">
        <Button
          onClick={handleSave}
          size="xl"
          className="w-full"
          disabled={saving || duration < 1}
        >
          {saving ? 'Saving...' : 'Save Run'}
        </Button>
      </div>
    </div>
  )
}
