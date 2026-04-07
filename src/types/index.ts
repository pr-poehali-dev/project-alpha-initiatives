import type { ReactNode } from "react"

export interface Section {
  id: string
  title: string
  subtitle?: ReactNode
  content?: string
  showButton?: boolean
  buttonText?: string
  showQuiz?: boolean
}

export interface SectionProps extends Section {
  isActive: boolean
}