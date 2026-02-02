import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './config'

// Save a workout session
export async function saveWorkout(userId, workoutData) {
  const workout = {
    userId,
    category: workoutData.category,
    duration: workoutData.duration,
    rating: workoutData.rating || 0,
    notes: workoutData.notes || '',
    cardio: workoutData.cardio || null,
    exercises: workoutData.exercises || [],
    createdAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'workoutSessions'), workout)

  // Update last weights for each exercise
  for (const exercise of workoutData.exercises) {
    if (exercise.sets && exercise.sets.length > 0) {
      const lastSet = exercise.sets[exercise.sets.length - 1]
      await updateExerciseStats(userId, exercise.id, lastSet.weight, exercise.sets)
    }
  }

  return docRef.id
}

// Update exercise stats (last weight, PR, etc)
async function updateExerciseStats(userId, exerciseId, lastWeight, sets) {
  const statsRef = doc(db, 'userExerciseStats', `${userId}_${exerciseId}`)
  const statsDoc = await getDoc(statsRef)

  const maxWeight = Math.max(...sets.map(s => s.weight))
  const totalReps = sets.reduce((sum, s) => sum + s.reps, 0)

  if (statsDoc.exists()) {
    const existing = statsDoc.data()
    const updates = {
      lastWeight,
      lastUsed: serverTimestamp()
    }

    // Check for new PR
    if (maxWeight > (existing.personalBest?.weight || 0)) {
      updates.personalBest = { weight: maxWeight, date: serverTimestamp() }
    }

    await updateDoc(statsRef, updates)
  } else {
    await setDoc(statsRef, {
      userId,
      exerciseId,
      lastWeight,
      personalBest: { weight: maxWeight, date: serverTimestamp() },
      lastUsed: serverTimestamp()
    })
  }
}

// Get last workout date for a category
export async function getLastWorkoutDate(userId, category) {
  try {
    const q = query(
      collection(db, 'workoutSessions'),
      where('userId', '==', userId),
      where('category', '==', category),
      orderBy('createdAt', 'desc'),
      limit(1)
    )

    const snapshot = await getDocs(q)
    if (snapshot.empty) return null

    const data = snapshot.docs[0].data()
    return data.createdAt?.toDate() || null
  } catch (error) {
    console.error('getLastWorkoutDate error:', error)
    // If index doesn't exist, try without orderBy
    if (error.code === 'failed-precondition') {
      console.log('Index missing, using fallback query')
      const q = query(
        collection(db, 'workoutSessions'),
        where('userId', '==', userId),
        where('category', '==', category)
      )
      const snapshot = await getDocs(q)
      if (snapshot.empty) return null

      // Sort manually
      const docs = snapshot.docs
        .map(doc => ({ ...doc.data(), createdAt: doc.data().createdAt?.toDate() }))
        .filter(d => d.createdAt)
        .sort((a, b) => b.createdAt - a.createdAt)

      return docs[0]?.createdAt || null
    }
    throw error
  }
}

// Get last weight used for an exercise
export async function getLastWeight(userId, exerciseId) {
  const statsRef = doc(db, 'userExerciseStats', `${userId}_${exerciseId}`)
  const statsDoc = await getDoc(statsRef)

  if (statsDoc.exists()) {
    return statsDoc.data().lastWeight || null
  }
  return null
}

// Get all last weights for a user (batch fetch)
export async function getAllLastWeights(userId) {
  const q = query(
    collection(db, 'userExerciseStats'),
    where('userId', '==', userId)
  )

  const snapshot = await getDocs(q)
  const weights = {}

  snapshot.forEach(doc => {
    const data = doc.data()
    weights[data.exerciseId] = data.lastWeight
  })

  return weights
}

// Get all exercise stats for a user (includes last used dates)
export async function getAllExerciseStats(userId) {
  const q = query(
    collection(db, 'userExerciseStats'),
    where('userId', '==', userId)
  )

  const snapshot = await getDocs(q)
  const stats = {}

  snapshot.forEach(doc => {
    const data = doc.data()
    stats[data.exerciseId] = {
      lastWeight: data.lastWeight,
      lastUsed: data.lastUsed?.toDate() || null,
      personalBest: data.personalBest
    }
  })

  return stats
}

// Get workout history
export async function getWorkoutHistory(userId, limitCount = 20) {
  try {
    const q = query(
      collection(db, 'workoutSessions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }))
  } catch (error) {
    console.error('getWorkoutHistory error:', error)
    // Fallback without orderBy
    if (error.code === 'failed-precondition') {
      const q = query(
        collection(db, 'workoutSessions'),
        where('userId', '==', userId)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }))
        .filter(d => d.createdAt)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limitCount)
    }
    throw error
  }
}

// Get all workouts (for analytics)
export async function getAllWorkouts(userId) {
  try {
    const q = query(
      collection(db, 'workoutSessions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'asc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }))
  } catch (error) {
    console.error('getAllWorkouts error:', error)
    if (error.code === 'failed-precondition') {
      const q = query(
        collection(db, 'workoutSessions'),
        where('userId', '==', userId)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }))
        .filter(d => d.createdAt)
        .sort((a, b) => a.createdAt - b.createdAt)
    }
    throw error
  }
}

// Get all exercise stats with PRs
export async function getAllPRs(userId) {
  const q = query(
    collection(db, 'userExerciseStats'),
    where('userId', '==', userId)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    personalBest: doc.data().personalBest ? {
      ...doc.data().personalBest,
      date: doc.data().personalBest.date?.toDate()
    } : null
  }))
}

// ============ Custom Exercises & Preferences ============

// Get user's custom exercises
export async function getCustomExercises(userId) {
  const q = query(
    collection(db, 'customExercises'),
    where('userId', '==', userId)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    docId: doc.id  // Store Firestore doc ID separately so it doesn't get overwritten
  }))
}

// Add a custom exercise
export async function addCustomExercise(userId, exercise) {
  try {
    const docRef = await addDoc(collection(db, 'customExercises'), {
      userId,
      ...exercise,
      createdAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('addCustomExercise error:', error)
    throw error
  }
}

// Update a custom exercise
export async function updateCustomExercise(exerciseId, updates) {
  await updateDoc(doc(db, 'customExercises', exerciseId), updates)
}

// Delete a custom exercise
export async function deleteCustomExercise(exerciseId) {
  await deleteDoc(doc(db, 'customExercises', exerciseId))
}

// Get user's hidden exercises
export async function getHiddenExercises(userId) {
  const docRef = doc(db, 'userPreferences', userId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return docSnap.data().hiddenExercises || []
  }
  return []
}

// Toggle exercise visibility
export async function toggleExerciseVisibility(userId, exerciseId) {
  try {
    const docRef = doc(db, 'userPreferences', userId)
    const docSnap = await getDoc(docRef)

    let hiddenExercises = []
    if (docSnap.exists()) {
      hiddenExercises = docSnap.data().hiddenExercises || []
    }

    if (hiddenExercises.includes(exerciseId)) {
      hiddenExercises = hiddenExercises.filter(id => id !== exerciseId)
    } else {
      hiddenExercises.push(exerciseId)
    }

    await setDoc(docRef, { hiddenExercises }, { merge: true })
    console.log('Toggled visibility for', exerciseId, '- hidden list now:', hiddenExercises)
    return hiddenExercises
  } catch (error) {
    console.error('toggleExerciseVisibility error:', error)
    throw error
  }
}

// Get user preferences
export async function getUserPreferences(userId) {
  const docRef = doc(db, 'userPreferences', userId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return docSnap.data()
  }
  return { hiddenExercises: [], weeklyCardioGoal: 0 }
}

// Save user preferences
export async function saveUserPreferences(userId, preferences) {
  const docRef = doc(db, 'userPreferences', userId)
  await setDoc(docRef, preferences, { merge: true })
}

// Get weekly cardio distance (km done this week)
export async function getWeeklyCardioDistance(userId) {
  try {
    // Get start of current week (Monday)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const monday = new Date(now)
    monday.setDate(now.getDate() - diffToMonday)
    monday.setHours(0, 0, 0, 0)

    const q = query(
      collection(db, 'workoutSessions'),
      where('userId', '==', userId),
      where('category', '==', 'cardio'),
      where('createdAt', '>=', monday),
      orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(q)
    let totalDistance = 0

    snapshot.forEach(doc => {
      const data = doc.data()
      if (data.cardio?.distance) {
        totalDistance += data.cardio.distance
      }
    })

    return totalDistance
  } catch (error) {
    console.error('getWeeklyCardioDistance error:', error)
    // Fallback without index
    if (error.code === 'failed-precondition') {
      const q = query(
        collection(db, 'workoutSessions'),
        where('userId', '==', userId),
        where('category', '==', 'cardio')
      )

      const now = new Date()
      const dayOfWeek = now.getDay()
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const monday = new Date(now)
      monday.setDate(now.getDate() - diffToMonday)
      monday.setHours(0, 0, 0, 0)

      const snapshot = await getDocs(q)
      let totalDistance = 0

      snapshot.forEach(doc => {
        const data = doc.data()
        const createdAt = data.createdAt?.toDate()
        if (createdAt && createdAt >= monday && data.cardio?.distance) {
          totalDistance += data.cardio.distance
        }
      })

      return totalDistance
    }
    return 0
  }
}

// Delete a workout
export async function deleteWorkout(workoutId) {
  await deleteDoc(doc(db, 'workoutSessions', workoutId))
}

// Get a single workout
export async function getWorkout(workoutId) {
  const docRef = doc(db, 'workoutSessions', workoutId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() }
  }
  return null
}

// Get most recent workout date (any category)
export async function getMostRecentWorkoutDate(userId) {
  try {
    const q = query(
      collection(db, 'workoutSessions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(1)
    )

    const snapshot = await getDocs(q)
    if (snapshot.empty) return null

    const data = snapshot.docs[0].data()
    return data.createdAt?.toDate() || null
  } catch (error) {
    console.error('getMostRecentWorkoutDate error:', error)
    // Fallback without orderBy
    if (error.code === 'failed-precondition') {
      const q = query(
        collection(db, 'workoutSessions'),
        where('userId', '==', userId)
      )
      const snapshot = await getDocs(q)
      if (snapshot.empty) return null

      const docs = snapshot.docs
        .map(doc => doc.data().createdAt?.toDate())
        .filter(Boolean)
        .sort((a, b) => b - a)

      return docs[0] || null
    }
    throw error
  }
}

// Reset all user data (workouts and exercise stats)
export async function resetUserData(userId) {
  // Delete all workout sessions
  const workoutsQuery = query(
    collection(db, 'workoutSessions'),
    where('userId', '==', userId)
  )
  const workoutsSnapshot = await getDocs(workoutsQuery)

  const deletePromises = []
  workoutsSnapshot.forEach(docSnap => {
    deletePromises.push(deleteDoc(doc(db, 'workoutSessions', docSnap.id)))
  })

  // Delete all exercise stats
  const statsQuery = query(
    collection(db, 'userExerciseStats'),
    where('userId', '==', userId)
  )
  const statsSnapshot = await getDocs(statsQuery)

  statsSnapshot.forEach(docSnap => {
    deletePromises.push(deleteDoc(doc(db, 'userExerciseStats', docSnap.id)))
  })

  await Promise.all(deletePromises)

  return {
    workoutsDeleted: workoutsSnapshot.size,
    statsDeleted: statsSnapshot.size
  }
}

// Calculate current streak (consecutive days with workouts)
export async function getWorkoutStreak(userId) {
  let snapshot

  try {
    const q = query(
      collection(db, 'workoutSessions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(60)
    )
    snapshot = await getDocs(q)
  } catch (error) {
    console.error('getWorkoutStreak error:', error)
    // Fallback without orderBy
    if (error.code === 'failed-precondition') {
      const q = query(
        collection(db, 'workoutSessions'),
        where('userId', '==', userId)
      )
      snapshot = await getDocs(q)
    } else {
      throw error
    }
  }

  if (snapshot.empty) return 0

  const workoutDates = snapshot.docs
    .map(doc => doc.data().createdAt?.toDate())
    .filter(Boolean)
    .sort((a, b) => b - a) // Sort descending
    .map(date => date.toDateString())

  // Remove duplicates (multiple workouts same day)
  const uniqueDates = [...new Set(workoutDates)]

  if (uniqueDates.length === 0) return 0

  // Check if most recent workout was today or yesterday
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const mostRecentDate = new Date(uniqueDates[0])
  const todayStr = today.toDateString()
  const yesterdayStr = yesterday.toDateString()
  const mostRecentStr = mostRecentDate.toDateString()

  // If most recent workout isn't today or yesterday, streak is broken
  if (mostRecentStr !== todayStr && mostRecentStr !== yesterdayStr) {
    return 0
  }

  // Count consecutive days
  let streak = 1
  let checkDate = new Date(mostRecentDate)

  for (let i = 1; i < uniqueDates.length; i++) {
    checkDate.setDate(checkDate.getDate() - 1)
    const expectedDateStr = checkDate.toDateString()

    if (uniqueDates[i] === expectedDateStr) {
      streak++
    } else {
      break
    }
  }

  return streak
}
