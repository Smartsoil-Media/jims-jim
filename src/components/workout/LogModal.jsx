import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

export function LogModal({ isOpen, onClose, exercise, lastWeight, onLog, loggedSets = [] }) {
  const [weight, setWeight] = useState(lastWeight || '')
  const [reps, setReps] = useState(exercise?.defaultReps || 10)
  const [toFailure, setToFailure] = useState(false)

  // Check if this is a time-based exercise
  const isTimeBased = exercise?.unit === 'seconds' || exercise?.unit === 'minutes'
  const isMinutes = exercise?.unit === 'minutes'
  const timeLabel = isMinutes ? 'Duration (min)' : 'Duration (sec)'
  const weightLabel = isTimeBased ? 'Speed (km/h)' : 'Weight (kg)'

  // Reset weight when exercise changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setWeight(lastWeight || '')
      setReps(exercise?.defaultReps || 10)
      setToFailure(false)
    }
  }, [isOpen, exercise?.id, lastWeight])

  const handleSubmit = () => {
    if (weight && reps) {
      onLog(Number(weight), Number(reps), toFailure)
      // Reset for next set but keep weight
      setReps(exercise?.defaultReps || 10)
      setToFailure(false)
    }
  }

  // Different increments for cardio vs weight training
  const weightIncrement = isTimeBased ? 0.5 : 2.5
  const repsIncrement = isMinutes ? 5 : (exercise?.unit === 'seconds' ? 10 : 1)

  const adjustWeight = (amount) => {
    setWeight(prev => Math.max(0, (Number(prev) || 0) + amount))
  }

  const adjustReps = (amount) => {
    setReps(prev => Math.max(1, prev + amount))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={exercise?.name}>
      <div className="space-y-6">
        {/* Weight/Speed Input */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">{weightLabel}</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => adjustWeight(-weightIncrement)}
              className="w-12 h-12 rounded-xl bg-midnight-700 text-white text-xl font-bold active:bg-midnight-600"
            >
              -
            </button>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="flex-1 h-14 rounded-xl bg-midnight-800 border-2 border-midnight-700 text-center text-2xl font-bold text-white focus:border-accent focus:outline-none"
              placeholder="0"
            />
            <button
              onClick={() => adjustWeight(weightIncrement)}
              className="w-12 h-12 rounded-xl bg-midnight-700 text-white text-xl font-bold active:bg-midnight-600"
            >
              +
            </button>
          </div>
        </div>

        {/* Reps/Duration Input */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">{isTimeBased ? timeLabel : 'Reps'}</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => adjustReps(-repsIncrement)}
              className="w-12 h-12 rounded-xl bg-midnight-700 text-white text-xl font-bold active:bg-midnight-600"
            >
              -
            </button>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
              className="flex-1 h-14 rounded-xl bg-midnight-800 border-2 border-midnight-700 text-center text-2xl font-bold text-white focus:border-accent focus:outline-none"
            />
            <button
              onClick={() => adjustReps(repsIncrement)}
              className="w-12 h-12 rounded-xl bg-midnight-700 text-white text-xl font-bold active:bg-midnight-600"
            >
              +
            </button>
          </div>
        </div>

        {/* To Failure Toggle */}
        <div
          onClick={() => setToFailure(!toFailure)}
          className="flex items-center justify-between p-4 rounded-xl bg-midnight-800 border-2 border-midnight-700 cursor-pointer active:bg-midnight-700"
        >
          <span className="text-white">To failure? 🔥</span>
          <div className={`w-12 h-7 rounded-full transition-colors ${toFailure ? 'bg-accent' : 'bg-midnight-600'}`}>
            <div className={`w-5 h-5 mt-1 rounded-full bg-white transition-transform ${toFailure ? 'translate-x-6' : 'translate-x-1'}`} />
          </div>
        </div>

        {/* Submit Button */}
        <Button onClick={handleSubmit} size="xl" className="w-full">
          Log Set
        </Button>

        {/* Logged Sets Display */}
        {loggedSets.length > 0 && (
          <div className="pt-2 border-t border-midnight-700">
            <p className="text-sm text-gray-400 mb-2">Sets logged:</p>
            <div className="space-y-1">
              {loggedSets.map((set, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-accent font-medium">S{index + 1}:</span>
                  <span className="text-white">
                    {isTimeBased
                      ? `${set.reps}${isMinutes ? 'min' : 's'} @ ${set.weight}km/h`
                      : `${set.reps} reps @ ${set.weight}kg`
                    }
                  </span>
                  {set.toFailure && <span className="text-orange-500">🔥</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
