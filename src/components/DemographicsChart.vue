<template>
  <div class="chart-container">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as d3 from 'd3'
import _ from 'lodash'
import { useTooltips } from '@/composables/useTooltips'

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
})

const chartRef = ref(null)
const { initTooltips } = useTooltips()

const createChart = () => {
  if (props.data.length === 0) return

  // Clear existing
  d3.select(chartRef.value).selectAll('*').remove()

  // Process data for visualization
  const yearlyData = _.chain(props.data)
    .groupBy('short_year')
    .map((records, year) => {
      const totals = records.reduce(
        (acc, record) => ({
          year: year,
          white: acc.white + (record.white || 0),
          black: acc.black + (record.black || 0),
          hispanic: acc.hispanic + (record.hispanic || 0),
          other: acc.other + (record.other || 0),
        }),
        { white: 0, black: 0, hispanic: 0, other: 0 },
      )

      totals.total = totals.white + totals.black + totals.hispanic + totals.other
      return totals
    })
    .sortBy('year')
    .value()

  console.log('Processed yearly data:', yearlyData)

  // Set dimensions and margins
  const margin = { top: 20, right: 120, bottom: 60, left: 80 }
  const width = 800 - margin.left - margin.right
  const height = 400 - margin.top - margin.bottom

  // Create SVG
  const svg = d3
    .select(chartRef.value)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Set up scales
  const x = d3
    .scaleBand()
    .domain(yearlyData.map((d) => d.year))
    .range([0, width])
    .padding(0.1)

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(yearlyData, (d) => d.total)])
    .nice()
    .range([height, 0])

  // Define colors
  const colors = {
    white: '#98abc5',
    black: '#8a89a6',
    other: '#a05d56',
    hispanic: '#ff8c00',
  }

  // Create color scale for D3 format function
  const colorScale = d3
    .scaleOrdinal()
    .domain(['white', 'black', 'other', 'hispanic'])
    .range(['#98abc5', '#8a89a6', '#a05d56', '#ff8c00'])

  // Stack the data
  const stack = d3.stack().keys(['white', 'black', 'other', 'hispanic'])

  const stackedData = stack(yearlyData)

  // Create the bars
  const groups = g
    .selectAll('.year-group')
    .data(stackedData)
    .enter()
    .append('g')
    .attr('class', 'year-group')
    .attr('fill', (d) => colors[d.key])

  const rects = groups
    .selectAll('rect')
    .data((d) => d)
    .enter()
    .append('rect')
    .attr('x', (d) => x(d.data.year))
    .attr('y', (d) => y(d[1]))
    .attr('height', (d) => y(d[0]) - y(d[1]))
    .attr('width', x.bandwidth())

  // Convert your original tooltip code to work with the modern D3 stack pattern
  rects.attr('title', function (d) {
    // Get the ethnicity/race from the parent group
    const parentData = d3.select(this.parentNode).datum()
    const ethnicity = parentData.key // 'white', 'black', 'hispanic', 'other'
    const year = d.data.year // '05-06', '06-07', etc.
    const studentCount = d[1] - d[0] // The height of this segment
    const totalStudents = d.data.total // Total for this year
    const color = colorScale(ethnicity) // Get the color for this ethnicity

    // Convert to your original tooltip format
    const tip =
      '<span class="summary-tooltip">' +
      '<p class="tip3"> School Year: ' +
      year +
      '</p>' +
      '<p class="tip3"> Student Body #: ' +
      d3.format(',')(totalStudents) +
      '</p>' +
      '<p class="tip3"> -------------------------- </p>' +
      '<p class="tip3"> Race/Ethnicity: <span style="color:' +
      color +
      '"> ' +
      ethnicity.charAt(0).toUpperCase() +
      ethnicity.slice(1) +
      '</span></p>' +
      '<p class="tip1"> # of Students: <span style="color:' +
      color +
      '"> ' +
      d3.format(',')(studentCount) +
      '</span></p>' +
      '<p class="tip1"> % of Students: <span style="color:' +
      color +
      '"> ' +
      d3.format('.2%')(studentCount / totalStudents) +
      '</span></p>' +
      '</span>'

    return tip
  })

  console.log('Created', rects.size(), 'rectangles with tooltips')

  // Add X axis
  g.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))

  // Add Y axis
  g.append('g').attr('class', 'y axis').call(d3.axisLeft(y))

  // Add legend
  const legend = svg
    .append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width + margin.left + 10}, ${margin.top + 20})`)

  const legendItems = Object.entries(colors).map((d, i) => ({
    key: d[0],
    color: d[1],
    y: i * 25,
  }))

  const legendItem = legend
    .selectAll('.legend-item')
    .data(legendItems)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d) => `translate(0, ${d.y})`)

  legendItem
    .append('rect')
    .attr('width', 15)
    .attr('height', 15)
    .attr('fill', (d) => d.color)
    .attr('stroke', '#000')
    .attr('stroke-width', 1)

  legendItem
    .append('text')
    .attr('x', 20)
    .attr('y', 12)
    .style('font-size', '12px')
    .style('font-family', 'Raleway, sans-serif')
    .style('fill', '#000')
    .text((d) => d.key.charAt(0).toUpperCase() + d.key.slice(1))

  // Initialize tooltips after chart is created
  setTimeout(() => {
    const rectElements = document.querySelectorAll('svg rect[title]')
    console.log('Found', rectElements.length, 'elements with titles for tooltips')
    if (rectElements.length > 0) {
      initTooltips('svg rect[title]')
      console.log('Tooltips initialized')
    }
  }, 500)
}

onMounted(() => {
  if (props.data.length > 0) {
    createChart()
  }
})

watch(
  () => props.data,
  (newData) => {
    if (newData.length > 0) {
      createChart()
    }
  },
)
</script>

<style scoped>
.chart-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.chart {
  max-width: 100%;
}
</style>
