'use client'

import type { LucideProps } from 'lucide-react'
import {
  Activity,
  Bike,
  Dumbbell,
  Goal,
  Mountain,
  Sparkles,
  Waves,
} from 'lucide-react'

const ACTIVITY_ICONS = {
  Running: Activity,
  Cycling: Bike,
  Swimming: Waves,
  Gym: Dumbbell,
  Yoga: Sparkles,
  Hiking: Mountain,
  Football: Goal,
} as const

export type ActivityName = keyof typeof ACTIVITY_ICONS

export const ACTIVITY_ORDER: ActivityName[] = [
  'Running',
  'Cycling',
  'Swimming',
  'Gym',
  'Yoga',
  'Hiking',
  'Football',
]

type Props = { activity: string; className?: string } & LucideProps

export default function ActivityIcon({ activity, className, ...props }: Props) {
  const Icon = ACTIVITY_ICONS[activity as ActivityName] ?? Activity
  return <Icon className={className} aria-hidden {...props} />
}
