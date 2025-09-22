import { ref, computed } from 'vue'
import Papa from 'papaparse'
import _ from 'lodash'

export function useData() {
  const rawData = ref([])
  const schools = ref([])
  const loading = ref(false)
  const error = ref(null)

  const loadData = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch('/data/ccps_data.csv')
      const csvText = await response.text()
      
      const parsed = Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      })
      
      rawData.value = parsed.data
      processData()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const processData = () => {
    console.log('Processing', rawData.value.length, 'raw records')
    
    // Use your original reformat logic
    var lookup = {}
    var schoolsArray = []
    
    for (var item, i = 0; item = rawData.value[i++];) {
      var id = item.school_id
      if (!(id in lookup)) {
        lookup[id] = 1
        schoolsArray.push({
          id: item.school_id, // Vue needs 'id' for keys
          school_id: item.school_id,
          info: {
            name: item.school,
            address: item.address,
            city: item.city,
            state: item.state,
            zip: item.zip,
            level: item.level,
            lat: +item.latitude, // Convert to number with +
            lon: +item.longitude // Convert to number with +
          },
          before: [{
            short_year: item.short_year,
            white: item.white,
            black: item.black,
            other: item.other,
            hispanic: item.hispanic,
            total: item.total
          }],
          after: [] // Initialize empty, will be filled below
        })
      }
    }

    // Now add the "after" data (14-15 year data)
    const afterData = _.chain(rawData.value)
      .filter(d => d && d.short_year && d.short_year === "14-15")
      .value()

    // Add after data to matching schools
    afterData.forEach(record => {
      const school = schoolsArray.find(s => s.school_id === record.school_id)
      if (school) {
        school.after = [{
          short_year: record.short_year,
          white: record.white,
          black: record.black,
          other: record.other,
          hispanic: record.hispanic,
          total: record.total
        }]
      }
    })

    schools.value = schoolsArray
    console.log('Processed', schools.value.length, 'schools')
    console.log('First school:', schools.value[0])
  }

  const availableYears = computed(() => {
    return _.chain(rawData.value)
      .map('short_year')
      .uniq()
      .sort()
      .value()
  })

  return {
    rawData,
    schools,
    loading,
    error,
    availableYears,
    loadData
  }
}