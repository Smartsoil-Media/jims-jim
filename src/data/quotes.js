// Motivational quotes for during workouts
export const workoutQuotes = [
  // Personal attacks - get uncomfortable
  "You're soft as fuck and you know it. Fix that today.",
  "Still making excuses? Pathetic.",
  "Your weak ass showed up. Now prove you deserve to be here.",
  "Nobody gives a shit about your feelings. Lift the weight.",
  "You think you're tired? You're not tired, you're lazy.",
  "Stop being a little bitch and get under that bar.",
  "Your comfort zone is a coffin. Get the fuck out.",
  "While you're reading this, someone's outworking you.",
  "You're one workout away from a better mood. Still sitting there?",
  "That voice telling you to quit? Tell it to fuck off.",

  // Calling you out
  "You promised yourself you'd change. Was that another lie?",
  "Remember when you said 'I'll start Monday'? It's always fucking Monday.",
  "Your potential is rotting while you scroll your phone.",
  "Skipping today? Cool, stay mediocre forever then.",
  "You want results but won't do the work. Clown behavior.",
  "Everyone's tired. Winners show up anyway.",
  "Your excuses are embarrassing. You know that, right?",
  "That body isn't going to build itself, princess.",
  "You're not too busy. You're just not committed.",
  "Feeling sorry for yourself again? How's that working out?",

  // Reality checks
  "Nobody's coming to save you. Get off your ass.",
  "Your dreams don't work unless you do, dipshit.",
  "Still haven't started? What a fucking surprise.",
  "You'll regret this laziness. Not today, but soon.",
  "The only thing standing between you and greatness is your weak mind.",
  "Complaining burns zero calories. Moving does.",
  "You're not special. Work like everyone else has to.",
  "That belly didn't build itself. Neither will abs.",
  "Talk is cheap. So is your effort lately.",
  "You want sympathy? It's in the dictionary between shit and syphilis.",

  // Get angry
  "Use that anger. Channel it into every fucking rep.",
  "Prove everyone who doubted you right? Or fucking wrong?",
  "They said you couldn't. Show them they were right then, coward.",
  "You gonna let yesterday's version of you win? Weak.",
  "Mad at yourself? Good. Now do something about it.",
  "Your haters are watching. Give them nothing.",
  "Every time you quit, you prove them right.",
  "Angry at your reflection? Change it or shut up.",
  "That chip on your shoulder? Turn it into muscle.",
  "Let the hate fuel the workout. Get moving.",

  // Brutal honesty
  "You're the only one who can change this. Scary, huh?",
  "Your body is a reflection of your choices. Look at it.",
  "Discipline or regret. You're choosing regret right now.",
  "You'll never outrun a shit diet. But try anyway, fatty.",
  "Your future self will thank you. Or hate you. Your choice.",
  "The pain of discipline or the pain of regret. Pick one.",
  "You know what you need to do. Why aren't you doing it?",
  "Your genetics aren't the problem. Your effort is.",
  "Blaming others? Classic loser move.",
  "You're not unlucky. You're unprepared.",

  // Tough love
  "I believe in you. But you gotta believe in yourself, bitch.",
  "This is gonna hurt. That's how you know it's working.",
  "Suffering today or suffering forever. Easy choice.",
  "You're capable of more. Stop sandbagging.",
  "One hour of pain for 23 hours of pride. Do the math.",
  "The iron doesn't judge. It just exposes weakness.",
  "Sore? Good. That means you actually tried for once.",
  "You showed up. Don't waste it by going half-ass.",
  "Your ancestors survived wars. You can survive leg day.",
  "This is the battle. Your body vs. your bullshit excuses.",

  // Wake up calls
  "Another day you 'didn't feel like it.' Pathetic pattern.",
  "Your body keeps score. What's the tally looking like?",
  "Still waiting for motivation? It's not coming. Move anyway.",
  "You've got the same 24 hours as everyone else. Use them.",
  "Tired of starting over? Then stop fucking quitting.",
  "Your only competition is who you were yesterday. And you're losing.",
  "How many times you gonna restart this journey?",
  "New year, same lazy you? Change that narrative.",
  "The best time to start was years ago. Second best is now, idiot.",
  "You're not too old. You're too comfortable.",

  // In your face
  "Get comfortable being uncomfortable or stay a nobody.",
  "Pain is weakness leaving the body. You've got a lot to lose.",
  "Champions train. Losers complain. Which one are you today?",
  "Your mind will quit before your body. Don't let it.",
  "Embrace the suck. It's the only way forward.",
  "You want easy? Go home. This ain't for you.",
  "Every rep you skip is a rep your competition isn't.",
  "Can't? Or won't? Be honest with yourself for once.",
  "The weight room doesn't care about your bad day.",
  "Shut up and lift. Nobody wants to hear it.",

  // Final push
  "One more rep. You've got one more in you. Always.",
  "Quitting now? After coming this far? Embarrassing.",
  "Your muscles aren't screaming. Your weak mind is.",
  "Push through or go home. No middle ground.",
  "This set isn't going to finish itself.",
  "You're almost done. Don't bitch out now.",
  "Pain is temporary. Being a quitter is forever.",
  "Dig deeper. You haven't found your limit yet.",
  "The last rep is where champions are made.",
  "Finish what you fucking started."
]

export const getRandomQuote = () => {
  return workoutQuotes[Math.floor(Math.random() * workoutQuotes.length)]
}
