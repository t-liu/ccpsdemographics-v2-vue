export interface YearDemographics {
  short_year: string
  white: number
  black: number
  other: number
  hispanic: number
  total: number
}

export interface SchoolInfo {
  name: string
  address: string
  city: string
  state: string
  zip: string
  level: string
  lat: number
  lon: number
}

export interface School {
  id: string | number
  school_id: string | number
  info: SchoolInfo
  before: YearDemographics[]
  after: YearDemographics[]
  yearlyData: unknown[]
}
