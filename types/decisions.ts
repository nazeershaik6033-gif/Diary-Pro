export type DecisionType = 'proscons' | 'journal' | 'matrix'
export type DecisionStatus = 'exploring' | 'decided' | 'reviewing' | 'archived'

export interface ProConItem {
  id: string
  text: string
  weight: 1 | 2 | 3
}

export interface ProsConsData {
  options: { name: string; pros: ProConItem[]; cons: ProConItem[] }[]
}

export interface JournalData {
  situation: string
  options: string[]
  reasoning: string
  expectedOutcome: string
  actualOutcome?: string
  reviewDate?: string
  lessonsLearned?: string
  tags: string[]
}

export interface MatrixCriterion {
  id: string
  name: string
  weight: 1 | 2 | 3
}

export interface MatrixData {
  criteria: MatrixCriterion[]
  options: string[]
  scores: Record<string, Record<string, number>>
}

export type DecisionData = ProsConsData | JournalData | MatrixData

export interface Decision {
  id?: number
  title: string
  type: DecisionType
  status: DecisionStatus
  deadline?: string
  chosenOption?: string
  data: DecisionData
  createdAt: number
  updatedAt: number
}
