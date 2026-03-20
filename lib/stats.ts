export type Workout = {
  id: string
  activity: string
  duration: number
  date: string
}

export type WorkoutStats = {
  streak: number
  weekCount: number
  topActivity: string
  totalMinutes: number
  lastWorkoutDate: string | null
}

export function computeStats(workouts: Workout[]): WorkoutStats {
  if (workouts.length === 0) {
    return {
      streak: 0,
      weekCount: 0,
      topActivity: 'None',
      totalMinutes: 0,
      lastWorkoutDate: null,
    }
  }

  const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0)

  const activityCount: Record<string, number> = {}
  workouts.forEach((w) => {
    activityCount[w.activity] = (activityCount[w.activity] || 0) + 1
  })
  const topActivity = Object.entries(activityCount).sort((a, b) => b[1] - a[1])[0][0]

  const lastWorkoutDate = [...workouts]
    .sort((a, b) => b.date.localeCompare(a.date))[0]
    .date

  const now = new Date()
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - dayOfWeek)
  monday.setHours(0, 0, 0, 0)
  const weekCount = workouts.filter((w) => new Date(w.date) >= monday).length

  const uniqueDays = [...new Set(workouts.map((w) => w.date))].sort((a, b) =>
    b.localeCompare(a),
  )
  let streak = 0
  const check = new Date()
  check.setHours(0, 0, 0, 0)

  for (const day of uniqueDays) {
    const d = new Date(day)
    d.setHours(0, 0, 0, 0)
    const diff = Math.round((check.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0 || diff === 1) {
      streak++
      check.setDate(check.getDate() - 1)
    } else {
      break
    }
  }

  return { streak, weekCount, topActivity, totalMinutes, lastWorkoutDate }
}
