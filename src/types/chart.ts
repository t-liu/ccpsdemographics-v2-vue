export interface ChartRecord {
  school_id?: string | number
  school?: string
  short_year: string
  year?: string
  white: number
  black: number
  hispanic: number
  other: number
  total?: number
}

export interface YearTotals {
  year: string
  white: number
  black: number
  hispanic: number
  other: number
  total: number
}
