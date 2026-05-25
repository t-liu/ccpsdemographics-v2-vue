import { ref, computed } from 'vue'
import type { ChartRecord } from '@/types/chart'
import type { School } from '@/types/school'

type MongoNumber = number | { $numberInt?: string; $numberDouble?: string; $numberLong?: string }

interface ApiYearData {
  academicYear: { short: string; full: string }
  demographics: Record<string, MongoNumber>
}

interface ApiSchool {
  schoolId: string | number
  name: string
  level: string
  location: {
    address: string
    city: string
    state: string
    zipCode: string
    coordinates: { coordinates: [number, number] }
  }
  yearlyData?: ApiYearData[]
}

export function useData() {
  const rawData = ref<ApiSchool[]>([])
  const schools = ref<School[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const extractNumber = (value: MongoNumber | null | undefined): number => {
    if (value == null) return 0

    if (typeof value === 'object') {
      if (value.$numberInt) return parseInt(value.$numberInt, 10)
      if (value.$numberDouble) return parseFloat(value.$numberDouble)
      if (value.$numberLong) return parseInt(value.$numberLong, 10)
    }

    if (typeof value === 'number') return value

    const parsed = parseFloat(String(value))
    return Number.isNaN(parsed) ? 0 : parsed
  }

  const processSchoolData = () => {
    schools.value = rawData.value.map((school) => {
      const firstYearData =
        school.yearlyData && school.yearlyData.length > 0 ? school.yearlyData[0] : null

      const lastYearData =
        school.yearlyData && school.yearlyData.length > 0
          ? school.yearlyData[school.yearlyData.length - 1]
          : null

      return {
        id: school.schoolId,
        school_id: school.schoolId,
        info: {
          name: school.name,
          address: school.location.address,
          city: school.location.city,
          state: school.location.state,
          zip: school.location.zipCode,
          level: school.level,
          lat: extractNumber(school.location.coordinates.coordinates[1]),
          lon: extractNumber(school.location.coordinates.coordinates[0]),
        },
        before: firstYearData
          ? [
              {
                short_year: firstYearData.academicYear.short,
                white: extractNumber(firstYearData.demographics.white),
                black: extractNumber(firstYearData.demographics.black),
                other: extractNumber(firstYearData.demographics.other),
                hispanic: extractNumber(firstYearData.demographics.hispanic),
                total: extractNumber(firstYearData.demographics.total),
              },
            ]
          : [],
        after: lastYearData
          ? [
              {
                short_year: lastYearData.academicYear.short,
                white: extractNumber(lastYearData.demographics.white),
                black: extractNumber(lastYearData.demographics.black),
                other: extractNumber(lastYearData.demographics.other),
                hispanic: extractNumber(lastYearData.demographics.hispanic),
                total: extractNumber(lastYearData.demographics.total),
              },
            ]
          : [],
        yearlyData: school.yearlyData || [],
      }
    })
  }

  const loadData = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/schools`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': `${import.meta.env.VITE_API_KEY}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const schoolData = (await response.json()) as ApiSchool[]
      rawData.value = schoolData
      processSchoolData()
    } catch (err) {
      console.error('Error loading data:', err)
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      loading.value = false
    }
  }

  const chartData = computed<ChartRecord[]>(() => {
    const flattened: ChartRecord[] = []

    rawData.value.forEach((school) => {
      if (school.yearlyData) {
        school.yearlyData.forEach((yearData) => {
          flattened.push({
            school_id: school.schoolId,
            school: school.name,
            short_year: yearData.academicYear.short,
            year: yearData.academicYear.full,
            white: extractNumber(yearData.demographics.white),
            black: extractNumber(yearData.demographics.black),
            hispanic: extractNumber(yearData.demographics.hispanic),
            other: extractNumber(yearData.demographics.other),
            total: extractNumber(yearData.demographics.total),
          })
        })
      }
    })

    return flattened
  })

  return {
    rawData,
    schools,
    loading,
    error,
    chartData,
    loadData,
  }
}
