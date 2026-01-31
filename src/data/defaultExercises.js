export const categories = [
  {
    id: 'shoulders-arms',
    name: 'Shoulders & Arms',
    icon: '💪',
    color: 'from-orange-500 to-amber-600'
  },
  {
    id: 'back-chest',
    name: 'Back & Chest',
    icon: '🏋️',
    color: 'from-amber-500 to-yellow-600'
  },
  {
    id: 'legs',
    name: 'Legs',
    icon: '🦵',
    color: 'from-yellow-500 to-orange-600'
  },
  {
    id: 'abs-core',
    name: 'Abs & Core',
    icon: '🔥',
    color: 'from-red-500 to-orange-600'
  },
  {
    id: 'flexibility',
    name: 'Flexibility',
    icon: '🧘',
    color: 'from-amber-400 to-orange-500'
  },
  {
    id: 'cardio',
    name: 'Cardio',
    icon: '🏃',
    color: 'from-blue-500 to-cyan-600'
  }
]

export const defaultExercises = {
  'shoulders-arms': [
    { id: 'shoulder-press', name: 'Shoulder Press', muscles: ['shoulders', 'triceps'], equipment: 'dumbbells', defaultSets: 4, defaultReps: 10 },
    { id: 'lateral-raises', name: 'Lateral Raises', muscles: ['shoulders'], equipment: 'dumbbells', defaultSets: 3, defaultReps: 12 },
    { id: 'front-raises', name: 'Front Raises', muscles: ['shoulders'], equipment: 'dumbbells', defaultSets: 3, defaultReps: 12 },
    { id: 'arnold-press', name: 'Arnold Press', muscles: ['shoulders', 'triceps'], equipment: 'dumbbells', defaultSets: 3, defaultReps: 10 },
    { id: 'bicep-curls', name: 'Bicep Curls', muscles: ['biceps'], equipment: 'dumbbells', defaultSets: 3, defaultReps: 12 },
    { id: 'hammer-curls', name: 'Hammer Curls', muscles: ['biceps', 'forearms'], equipment: 'dumbbells', defaultSets: 3, defaultReps: 12 },
    { id: 'concentration-curls', name: 'Concentration Curls', muscles: ['biceps'], equipment: 'dumbbell', defaultSets: 3, defaultReps: 10 },
    { id: 'reverse-curls', name: 'Reverse Curls', muscles: ['forearms', 'biceps'], equipment: 'dumbbells', defaultSets: 3, defaultReps: 12 },
    { id: 'tricep-dips', name: 'Tricep Dips', muscles: ['triceps', 'chest'], equipment: 'bench', defaultSets: 3, defaultReps: 15 },
    { id: 'tricep-kickbacks', name: 'Tricep Kickbacks', muscles: ['triceps'], equipment: 'dumbbells', defaultSets: 3, defaultReps: 12 },
    { id: 'overhead-tricep', name: 'Overhead Tricep Extension', muscles: ['triceps'], equipment: 'dumbbell', defaultSets: 3, defaultReps: 12 },
    { id: 'skull-crushers', name: 'Skull Crushers', muscles: ['triceps'], equipment: 'dumbbells', defaultSets: 3, defaultReps: 10 },
    { id: 'face-pull', name: 'Face Pull', muscles: ['rear delts', 'traps', 'rhomboids'], equipment: 'cable', defaultSets: 3, defaultReps: 15 },
    { id: 'tricep-pushdown', name: 'Tricep Pushdown', muscles: ['triceps', 'forearms'], equipment: 'cable', defaultSets: 3, defaultReps: 12 },
    { id: 'cable-hammer-curl', name: 'Cable Rope Hammer Curl', muscles: ['biceps', 'forearms', 'brachialis'], equipment: 'cable', defaultSets: 3, defaultReps: 12 },
  ],
  'back-chest': [
    { id: 'flat-bench', name: 'Flat Bench Press', muscles: ['chest', 'triceps', 'shoulders'], equipment: 'bench', defaultSets: 4, defaultReps: 8 },
    { id: 'incline-bench', name: 'Incline Bench Press', muscles: ['chest', 'shoulders', 'triceps'], equipment: 'bench', defaultSets: 4, defaultReps: 8 },
    { id: 'decline-pushups', name: 'Decline Push-ups', muscles: ['chest', 'shoulders', 'triceps'], equipment: 'bench', defaultSets: 3, defaultReps: 15 },
    { id: 'cable-pec-fly', name: 'Cable Pec Fly', muscles: ['chest'], equipment: 'cable', defaultSets: 3, defaultReps: 12 },
    { id: 'dumbbell-pullovers', name: 'Dumbbell Pullovers', muscles: ['chest', 'lats'], equipment: 'dumbbell', defaultSets: 3, defaultReps: 12 },
    { id: 'pull-ups', name: 'Pull-ups', muscles: ['lats', 'biceps', 'upper back'], equipment: 'pull-up bar', defaultSets: 4, defaultReps: 8 },
    { id: 'chin-ups', name: 'Chin-ups', muscles: ['biceps', 'lats', 'upper back'], equipment: 'pull-up bar', defaultSets: 3, defaultReps: 8 },
    { id: 'bent-over-rows', name: 'Bent Over Rows', muscles: ['upper back', 'lats', 'biceps'], equipment: 'dumbbells', defaultSets: 4, defaultReps: 10 },
    { id: 'single-arm-rows', name: 'Single Arm Rows', muscles: ['lats', 'upper back', 'biceps'], equipment: 'dumbbell', defaultSets: 3, defaultReps: 10 },
    { id: 'reverse-flyes', name: 'Reverse Flyes', muscles: ['upper back', 'shoulders'], equipment: 'dumbbells', defaultSets: 3, defaultReps: 12 },
    { id: 'kettlebell-swings', name: 'Kettlebell Swings', muscles: ['glutes', 'hamstrings', 'lower back', 'core'], equipment: 'kettlebell', defaultSets: 4, defaultReps: 15, golfNote: 'Hip hinge power for drives' },
    { id: 'supermans', name: 'Supermans', muscles: ['lower back', 'glutes'], equipment: 'none', defaultSets: 3, defaultReps: 15 },
    { id: 'lat-pulldown', name: 'Lat Pulldown', muscles: ['lats', 'rhomboids', 'biceps', 'rear delts'], equipment: 'cable', defaultSets: 4, defaultReps: 10 },
    { id: 'seated-cable-row', name: 'Seated Cable Row', muscles: ['rhomboids', 'lats', 'traps', 'biceps'], equipment: 'cable', defaultSets: 4, defaultReps: 10 },
    { id: 'straight-arm-pulldown', name: 'Straight Arm Pulldown', muscles: ['lats', 'rear delts', 'triceps', 'core'], equipment: 'cable', defaultSets: 3, defaultReps: 12 },
  ],
  'legs': [
    { id: 'barbell-squats', name: 'Barbell Squats', muscles: ['quads', 'glutes', 'hamstrings'], equipment: 'bench', defaultSets: 4, defaultReps: 8 },
    { id: 'goblet-squats', name: 'Goblet Squats', muscles: ['quads', 'glutes', 'core'], equipment: 'kettlebell', defaultSets: 3, defaultReps: 12 },
    { id: 'sumo-squats', name: 'Sumo Squats', muscles: ['quads', 'glutes', 'inner thighs'], equipment: 'dumbbell', defaultSets: 3, defaultReps: 12 },
    { id: 'lunges', name: 'Lunges', muscles: ['quads', 'glutes', 'hamstrings'], equipment: 'dumbbells', defaultSets: 3, defaultReps: 10 },
    { id: 'reverse-lunges', name: 'Reverse Lunges', muscles: ['quads', 'glutes', 'hamstrings'], equipment: 'dumbbells', defaultSets: 3, defaultReps: 10 },
    { id: 'bulgarian-split-squats', name: 'Bulgarian Split Squats', muscles: ['quads', 'glutes', 'hamstrings'], equipment: 'bench', defaultSets: 3, defaultReps: 10 },
    { id: 'romanian-deadlifts', name: 'Romanian Deadlifts', muscles: ['hamstrings', 'glutes', 'lower back'], equipment: 'dumbbells', defaultSets: 4, defaultReps: 10, golfNote: 'Hamstring strength for stability' },
    { id: 'single-leg-deadlifts', name: 'Single Leg Deadlifts', muscles: ['hamstrings', 'glutes', 'core'], equipment: 'dumbbell', defaultSets: 3, defaultReps: 8, golfNote: 'Balance and hip stability' },
    { id: 'hip-thrusts', name: 'Hip Thrusts', muscles: ['glutes', 'hamstrings'], equipment: 'bench', defaultSets: 4, defaultReps: 12 },
    { id: 'calf-raises', name: 'Calf Raises', muscles: ['calves'], equipment: 'dumbbells', defaultSets: 3, defaultReps: 15 },
    { id: 'step-ups', name: 'Step-ups', muscles: ['quads', 'glutes'], equipment: 'bench', defaultSets: 3, defaultReps: 12 },
    { id: 'wall-sit', name: 'Wall Sit', muscles: ['quads', 'glutes'], equipment: 'none', defaultSets: 3, defaultReps: 45, unit: 'seconds' },
    { id: 'leg-extension', name: 'Leg Extension', muscles: ['quads'], equipment: 'cable', defaultSets: 3, defaultReps: 12 },
    { id: 'standing-leg-curl', name: 'Standing Leg Curl', muscles: ['hamstrings', 'calves'], equipment: 'cable', defaultSets: 3, defaultReps: 12 },
    { id: 'cable-pull-through', name: 'Cable Pull Through', muscles: ['hamstrings', 'glutes', 'lower back'], equipment: 'cable', defaultSets: 3, defaultReps: 12 },
    { id: 'cable-hip-abduction', name: 'Cable Hip Abduction', muscles: ['glutes', 'hip abductors'], equipment: 'cable', defaultSets: 3, defaultReps: 15 },
  ],
  'abs-core': [
    { id: 'planks', name: 'Planks', muscles: ['core', 'abs', 'shoulders'], equipment: 'none', defaultSets: 3, defaultReps: 60, unit: 'seconds' },
    { id: 'side-planks', name: 'Side Planks', muscles: ['obliques', 'core'], equipment: 'none', defaultSets: 3, defaultReps: 30, unit: 'seconds' },
    { id: 'russian-twists', name: 'Russian Twists', muscles: ['obliques', 'abs'], equipment: 'dumbbell', defaultSets: 3, defaultReps: 20, golfNote: 'Rotational power' },
    { id: 'bicycle-crunches', name: 'Bicycle Crunches', muscles: ['abs', 'obliques'], equipment: 'none', defaultSets: 3, defaultReps: 20 },
    { id: 'leg-raises', name: 'Leg Raises', muscles: ['abs', 'hip flexors'], equipment: 'none', defaultSets: 3, defaultReps: 15 },
    { id: 'dead-bug', name: 'Dead Bug', muscles: ['core', 'abs'], equipment: 'none', defaultSets: 3, defaultReps: 10 },
    { id: 'mountain-climbers', name: 'Mountain Climbers', muscles: ['core', 'abs', 'shoulders'], equipment: 'none', defaultSets: 3, defaultReps: 30 },
    { id: 'v-ups', name: 'V-Ups', muscles: ['abs', 'hip flexors'], equipment: 'none', defaultSets: 3, defaultReps: 12 },
    { id: 'flutter-kicks', name: 'Flutter Kicks', muscles: ['abs', 'hip flexors'], equipment: 'none', defaultSets: 3, defaultReps: 30 },
    { id: 'hollow-body-hold', name: 'Hollow Body Hold', muscles: ['core', 'abs'], equipment: 'none', defaultSets: 3, defaultReps: 30, unit: 'seconds' },
    { id: 'kettlebell-windmills', name: 'Kettlebell Windmills', muscles: ['obliques', 'shoulders', 'core'], equipment: 'kettlebell', defaultSets: 3, defaultReps: 8, golfNote: 'Core stability + rotation' },
    { id: 'pallof-press', name: 'Pallof Press', muscles: ['core', 'obliques'], equipment: 'band', defaultSets: 3, defaultReps: 12, golfNote: 'Anti-rotation strength' },
  ],
  'flexibility': [
    { id: 'hip-flexor-stretch', name: 'Hip Flexor Stretch', muscles: ['hip flexors', 'quads'], equipment: 'none', defaultSets: 2, defaultReps: 30, unit: 'seconds' },
    { id: '90-90-stretch', name: '90/90 Hip Stretch', muscles: ['hips', 'glutes'], equipment: 'none', defaultSets: 2, defaultReps: 30, unit: 'seconds', golfNote: 'Hip mobility for rotation' },
    { id: 'thoracic-rotations', name: 'Thoracic Spine Rotations', muscles: ['upper back', 'spine'], equipment: 'none', defaultSets: 2, defaultReps: 10, golfNote: 'Essential for full backswing' },
    { id: 'cat-cow', name: 'Cat-Cow', muscles: ['spine', 'core'], equipment: 'none', defaultSets: 2, defaultReps: 10 },
    { id: 'worlds-greatest', name: "World's Greatest Stretch", muscles: ['hips', 'hamstrings', 'upper back', 'hip flexors'], equipment: 'none', defaultSets: 2, defaultReps: 5, golfNote: 'Full body mobility' },
    { id: 'shoulder-dislocates', name: 'Shoulder Dislocates', muscles: ['shoulders', 'chest'], equipment: 'band/stick', defaultSets: 2, defaultReps: 10 },
    { id: 'pigeon-pose', name: 'Pigeon Pose', muscles: ['hips', 'glutes'], equipment: 'none', defaultSets: 2, defaultReps: 30, unit: 'seconds' },
    { id: 'seated-hamstring', name: 'Seated Hamstring Stretch', muscles: ['hamstrings'], equipment: 'none', defaultSets: 2, defaultReps: 30, unit: 'seconds' },
    { id: 'quad-stretch', name: 'Standing Quad Stretch', muscles: ['quads', 'hip flexors'], equipment: 'none', defaultSets: 2, defaultReps: 30, unit: 'seconds' },
    { id: 'childs-pose', name: "Child's Pose", muscles: ['lower back', 'hips', 'shoulders'], equipment: 'none', defaultSets: 2, defaultReps: 45, unit: 'seconds' },
    { id: 'figure-four', name: 'Figure Four Stretch', muscles: ['glutes', 'hips'], equipment: 'none', defaultSets: 2, defaultReps: 30, unit: 'seconds' },
    { id: 'doorway-chest', name: 'Doorway Chest Stretch', muscles: ['chest', 'shoulders'], equipment: 'none', defaultSets: 2, defaultReps: 30, unit: 'seconds' },
  ],
  // Cardio uses its own dedicated page, not exercise selection
  'cardio': []
}
