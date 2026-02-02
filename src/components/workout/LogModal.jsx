import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

export function LogModal({ isOpen, onClose, exercise, lastWeight, onLog }) {
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
      // Close modal after logging - set will appear on the card
      onClose()
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
      <div className="space-y-5">
        {/* Weight/Speed Input */}
        <div>
          <label className="block text-sm text-gray-400 mb-3">{weightLabel}</label>
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => adjustWeight(-weightIncrement)}
              className="w-16 h-16 flex-shrink-0 rounded-2xl bg-midnight-700 text-white text-3xl font-bold active:bg-midnight-600 active:scale-95 transition-transform touch-manipulation"
            >
              −
            </button>
            <input
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="flex-1 min-w-0 h-16 rounded-2xl bg-midnight-800 border-2 border-midnight-700 text-center text-3xl font-bold text-white focus:border-accent focus:outline-none"
              placeholder="0"
            />
            <button
              onClick={() => adjustWeight(weightIncrement)}
              className="w-16 h-16 flex-shrink-0 rounded-2xl bg-midnight-700 text-white text-3xl font-bold active:bg-midnight-600 active:scale-95 transition-transform touch-manipulation"
            >
              +
            </button>
          </div>
        </div>

        {/* Reps/Duration Input */}
        <div>
          <label className="block text-sm text-gray-400 mb-3">{isTimeBased ? timeLabel : 'Reps'}</label>
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => adjustReps(-repsIncrement)}
              className="w-16 h-16 flex-shrink-0 rounded-2xl bg-midnight-700 text-white text-3xl font-bold active:bg-midnight-600 active:scale-95 transition-transform touch-manipulation"
            >
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
              className="flex-1 min-w-0 h-16 rounded-2xl bg-midnight-800 border-2 border-midnight-700 text-center text-3xl font-bold text-white focus:border-accent focus:outline-none"
            />
            <button
              onClick={() => adjustReps(repsIncrement)}
              className="w-16 h-16 flex-shrink-0 rounded-2xl bg-midnight-700 text-white text-3xl font-bold active:bg-midnight-600 active:scale-95 transition-transform touch-manipulation"
            >
              +
            </button>
          </div>
        </div>

        {/* To Failure Toggle */}
        <button
          onClick={() => setToFailure(!toFailure)}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-midnight-800 border-2 border-midnight-700 active:bg-midnight-700 transition-colors touch-manipulation"
        >
          <span className="text-white text-lg">To failure? 🔥</span>
          <div className={`w-14 h-8 rounded-full transition-colors ${toFailure ? 'bg-accent' : 'bg-midnight-600'}`}>
            <div className={`w-6 h-6 mt-1 rounded-full bg-white transition-transform ${toFailure ? 'translate-x-7' : 'translate-x-1'}`} />
          </div>
        </button>

        {/* Submit Button */}
        <Button onClick={handleSubmit} size="xl" className="w-full">
          Log Set ✓
        </Button>
      </div>
    </Modal>
  )
}
