import { ref, computed } from 'vue'

export function useData() {
  const rawData = ref([])
  const schools = ref([])
  const loading = ref(false)
  const error = ref(null)

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

      const schoolData = await response.json()
      console.log('Data loaded:', schoolData.length, 'schools')

      rawData.value = schoolData
      processSchoolData()
    } catch (err) {
      console.error('Error loading data:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const processSchoolData = () => {
    console.log('Processing school data...')

    schools.value = rawData.value.map((school) => {
      // Extract first and last year data for "before" and "after"
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
          // MongoDB stores coordinates as [longitude, latitude], need to reverse
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
        // Store all yearly data for the chart
        yearlyData: school.yearlyData || [],
      }
    })

    console.log('Processed', schools.value.length, 'schools')
    console.log('First school:', schools.value[0])
  }

  // Helper function to extract numbers from MongoDB format
  const extractNumber = (value) => {
    if (!value) return 0

    // Handle MongoDB number types
    if (value.$numberInt) return parseInt(value.$numberInt)
    if (value.$numberDouble) return parseFloat(value.$numberDouble)
    if (value.$numberLong) return parseInt(value.$numberLong)

    // If it's already a plain number
    if (typeof value === 'number') return value

    // Try to parse as number
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }

  // Flatten yearlyData for chart consumption
  const chartData = computed(() => {
    const flattened = []

    rawData.value.forEach((school) => {
      if (school.yearlyData) {
        school.yearlyData.forEach((yearData) => {
          flattened.push({
            school_id: school.schoolId,
            school: school.name,
            address: school.location.address,
            city: school.location.city,
            state: school.location.state,
            zip: school.location.zipCode,
            level: school.level,
            year: yearData.academicYear.full,
            short_year: yearData.academicYear.short,
            latitude: extractNumber(school.location.coordinates.coordinates[1]),
            longitude: extractNumber(school.location.coordinates.coordinates[0]),
            black: extractNumber(yearData.demographics.black),
            hispanic: extractNumber(yearData.demographics.hispanic),
            white: extractNumber(yearData.demographics.white),
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
