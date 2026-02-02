import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProfile } from 'firebase/auth'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth.jsx'
import { resetUserData, getUserPreferences, saveUserPreferences } from '../firebase/firestore'

export function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(user?.displayName || '')
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [weeklyCardioGoal, setWeeklyCardioGoal] = useState(0)
  const [savingCardioGoal, setSavingCardioGoal] = useState(false)

  // Load user preferences
  useEffect(() => {
    if (user) {
      getUserPreferences(user.uid).then(prefs => {
        setWeeklyCardioGoal(prefs.weeklyCardioGoal || 0)
      })
    }
  }, [user])

  const handleSaveCardioGoal = async (newGoal) => {
    if (!user) return
    setSavingCardioGoal(true)
    try {
      await saveUserPreferences(user.uid, { weeklyCardioGoal: newGoal })
      setWeeklyCardioGoal(newGoal)
    } catch (error) {
      console.error('Failed to save cardio goal:', error)
    } finally {
      setSavingCardioGoal(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleSaveName = async () => {
    if (!user || !name.trim()) return
    setSaving(true)

    try {
      await updateProfile(user, {
        displayName: name.trim()
      })
      setEditingName(false)
      // Force a page refresh to update the user object
      window.location.reload()
    } catch (error) {
      console.error('Failed to update name:', error)
      alert('Failed to update name')
    } finally {
      setSaving(false)
    }
  }

  const handleResetAccount = async () => {
    if (!user) return

    const confirmed = confirm(
      'Are you sure you want to reset your account? This will delete ALL your workout history, stats, and progress. This cannot be undone!'
    )

    if (!confirmed) return

    // Double confirm for safety
    const doubleConfirm = confirm(
      'This is your last chance. All data will be permanently deleted. Continue?'
    )

    if (!doubleConfirm) return

    setResetting(true)

    try {
      const result = await resetUserData(user.uid)
      alert(`Account reset complete. Deleted ${result.workoutsDeleted} workouts and ${result.statsDeleted} exercise records.`)
      // Refresh to show clean state
      window.location.reload()
    } catch (error) {
      console.error('Failed to reset account:', error)
      alert('Failed to reset account. Please try again.')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="min-h-screen bg-midnight-950 px-4 py-6 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Customize your experience</p>
      </div>

      {/* Account */}
      <div className="mb-6">
        <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-3">Account</h2>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-midnight-950 text-xl font-bold">
              {(user?.displayName?.[0] || user?.email?.[0] || '?').toUpperCase()}
            </div>
            <div className="flex-1">
              {editingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="flex-1 h-10 px-3 rounded-lg bg-midnight-700 border border-midnight-600 text-white placeholder-gray-500 focus:border-accent focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving}
                    className="px-3 py-2 bg-accent text-midnight-950 rounded-lg font-medium text-sm"
                  >
                    {saving ? '...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false)
                      setName(user?.displayName || '')
                    }}
                    className="px-3 py-2 text-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{user?.displayName || 'No name set'}</p>
                    <p className="text-sm text-gray-400">{user?.email || 'Not signed in'}</p>
                  </div>
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-accent text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Workout Settings */}
      <div className="mb-6">
        <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-3">Workouts</h2>
        <Card className="space-y-4">
          <button
            onClick={() => navigate('/edit-exercises')}
            className="w-full flex items-center justify-between py-2"
          >
            <span className="text-white">Edit Exercises</span>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="h-px bg-midnight-700" />
          <button
            onClick={() => navigate('/add-exercise')}
            className="w-full flex items-center justify-between py-2"
          >
            <span className="text-white">Add Custom Exercise</span>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </Card>
      </div>

      {/* Goals */}
      <div className="mb-6">
        <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-3">Goals</h2>
        <Card className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-white">Weekly Cardio Goal</span>
              <p className="text-xs text-gray-500">Distance to complete each week</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSaveCardioGoal(Math.max(0, weeklyCardioGoal - 5))}
                disabled={savingCardioGoal}
                className="w-8 h-8 rounded-lg bg-midnight-700 text-white text-lg font-bold active:bg-midnight-600"
              >
                −
              </button>
              <span className="text-accent font-bold w-12 text-center">{weeklyCardioGoal}km</span>
              <button
                onClick={() => handleSaveCardioGoal(weeklyCardioGoal + 5)}
                disabled={savingCardioGoal}
                className="w-8 h-8 rounded-lg bg-midnight-700 text-white text-lg font-bold active:bg-midnight-600"
              >
                +
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Preferences */}
      <div className="mb-6">
        <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-3">Preferences</h2>
        <Card className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-white">Weight Unit</span>
            <select className="bg-midnight-700 text-white rounded-lg px-3 py-1 border-none focus:outline-none focus:ring-2 focus:ring-accent">
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
            </select>
          </div>
          <div className="h-px bg-midnight-700" />
          <div className="flex items-center justify-between py-2">
            <span className="text-white">Distance Unit</span>
            <select className="bg-midnight-700 text-white rounded-lg px-3 py-1 border-none focus:outline-none focus:ring-2 focus:ring-accent">
              <option value="km">km</option>
              <option value="miles">miles</option>
            </select>
          </div>
        </Card>
      </div>

      {/* Danger Zone */}
      <div className="mb-6">
        <h2 className="text-sm text-red-500 uppercase tracking-wider mb-3">Danger Zone</h2>
        <Card className="border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Reset Account</p>
              <p className="text-sm text-gray-400">Delete all workout history and stats</p>
            </div>
            <button
              onClick={handleResetAccount}
              disabled={resetting}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-medium text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50"
            >
              {resetting ? 'Resetting...' : 'Reset'}
            </button>
          </div>
        </Card>
      </div>

      {/* Logout */}
      <Button onClick={handleLogout} variant="secondary" className="w-full">
        Log Out
      </Button>

      {/* Version */}
      <p className="text-center text-gray-600 text-sm mt-8">JimsJim v1.0.0</p>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-midnight-900 border-t border-midnight-700 px-6 py-3">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button onClick={() => navigate('/')} className="flex flex-col items-center text-gray-500">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span className="text-xs mt-1">Home</span>
          </button>
          <button onClick={() => navigate('/analytics')} className="flex flex-col items-center text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <span className="text-xs mt-1">Analytics</span>
          </button>
          <button className="flex flex-col items-center text-accent">
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
