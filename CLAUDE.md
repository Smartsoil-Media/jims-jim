# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JimsJim is a mobile-first PWA workout tracker for home gym users, specifically tailored for golfers. It uses a midnight dark theme with orange accent colors.

## Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
```

No test or lint commands are configured.

## Tech Stack

- **Frontend**: React 19 + Vite 7 + TailwindCSS 4
- **Routing**: React Router DOM v7
- **Backend**: Firebase (Authentication + Firestore)
- **Deployment**: Firebase Hosting (project: "jim-s-jim")

## Architecture

### Key Directories

- `src/pages/` - Route pages (Home, Workout, Cardio, Analytics, Settings, EditExercises, AddExercise, Login)
- `src/components/ui/` - Reusable components (Button, Card, Modal, LineChart, Confetti)
- `src/components/workout/` - Domain components (ExerciseCard, LogModal)
- `src/hooks/` - Custom hooks (useAuth for Firebase auth context, useWorkout for session state)
- `src/firebase/` - Firebase config and Firestore operations
- `src/data/defaultExercises.js` - Default exercise library (50+ exercises across 6 categories)

### Data Flow

- AuthProvider wraps the app providing user state via useAuth hook
- All routes except /login are protected via ProtectedRoute component
- Firestore collections: `workoutSessions`, `userExerciseStats`, `customExercises`, `userPreferences`
- User data is scoped by userId in queries

### Key Files

- `src/firebase/firestore.js` - All Firestore CRUD operations (~500 lines), includes fallback queries for missing indexes
- `src/pages/Home.jsx` - Dashboard with workout categories and personalized motivational messaging
- `src/pages/Workout.jsx` - Active workout session with exercise logging
- `src/pages/Analytics.jsx` - Stats, charts, and personal records

## Design System

- Background: `#0a0a0f` (midnight)
- Cards: `#1a1a2e`
- Accent: Orange/gold (`#f59e0b`)
- Mobile-optimized with safe area support
- Custom Tailwind theme classes: `bg-midnight-*`, `text-accent`

## Specification

See `v1.md` for the complete product specification including feature requirements, data model schema, and default exercise library.
