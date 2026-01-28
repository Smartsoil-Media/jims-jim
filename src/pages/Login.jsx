import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProfile } from 'firebase/auth'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth.jsx'

export function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, signup, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        const userCredential = await signup(email, password)
        // Update the user's display name
        if (name.trim()) {
          await updateProfile(userCredential.user, {
            displayName: name.trim()
          })
        }
      } else {
        await login(email, password)
      }
      navigate('/')
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      await loginWithGoogle()
      navigate('/')
    } catch (err) {
      setError(err.message || 'Google login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-midnight-950 px-6 py-12 flex flex-col justify-center">
      {/* Logo */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-accent">JimsJim</h1>
        <p className="text-gray-400 mt-2">Golf-focused workout tracker</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto w-full">
        {isSignUp && (
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full h-14 px-4 rounded-xl bg-midnight-800 border-2 border-midnight-700 text-white placeholder-gray-500 focus:border-accent focus:outline-none"
              required
            />
          </div>
        )}

        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full h-14 px-4 rounded-xl bg-midnight-800 border-2 border-midnight-700 text-white placeholder-gray-500 focus:border-accent focus:outline-none"
            required
          />
        </div>

        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full h-14 px-4 rounded-xl bg-midnight-800 border-2 border-midnight-700 text-white placeholder-gray-500 focus:border-accent focus:outline-none"
            required
            minLength={6}
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Log In'}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6 max-w-sm mx-auto w-full">
        <div className="flex-1 h-px bg-midnight-700" />
        <span className="text-gray-500 text-sm">or</span>
        <div className="flex-1 h-px bg-midnight-700" />
      </div>

      {/* Google Sign In */}
      <div className="max-w-sm mx-auto w-full">
        <Button
          onClick={handleGoogleLogin}
          variant="secondary"
          size="lg"
          className="w-full flex items-center justify-center gap-3"
          disabled={loading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>
      </div>

      {/* Toggle Sign Up / Log In */}
      <p className="text-center text-gray-400 mt-8">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-accent ml-2 font-medium"
        >
          {isSignUp ? 'Log In' : 'Sign Up'}
        </button>
      </p>
    </div>
  )
}
