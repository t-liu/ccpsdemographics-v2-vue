<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as d3 from 'd3'
import _ from 'lodash'
import { useTooltips } from '@/composables/useTooltips'
import { debounce } from 'lodash'

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
})

const chartRef = ref(null)
const { initTooltips } = useTooltips()

const createChart = () => {
  if (props.data.length === 0 || !chartRef.value) {
    console.warn('Chart data is empty or chartRef is not available')
    return
  }

  // Clear existing
  d3.select(chartRef.value).selectAll('*').remove()

  // Process data
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

  // Get container width
  const containerWidth = chartRef.value.offsetWidth || 800

  // Set dimensions and margins
  const margin = {
    top: window.innerWidth <= 768 ? 10 : 20,
    right: window.innerWidth <= 768 ? 10 : 120,
    bottom: window.innerWidth <= 768 ? 40 : 60,
    left: window.innerWidth <= 768 ? 40 : 80,
  }
  const width = Math.min(containerWidth, 800) - margin.left - margin.right
  const height = 400 - margin.top - margin.bottom
  const fontSize = window.innerWidth <= 768 ? '10px' : '12px'

  // Create SVG
  const svg = d3
    .select(chartRef.value)
    .append('svg')
    .attr('width', '100%')
    .attr('height', height + margin.top + margin.bottom)
    .attr(
      'viewBox',
      `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`,
    )
    .attr('preserveAspectRatio', 'xMidYMid meet')

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Set up scales
  const x = d3
    .scaleBand()
    .domain(yearlyData.map((d) => d.year))
    .range([0, width])
    .padding(window.innerWidth <= 768 ? 0.05 : 0.1)

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

  const colorScale = d3
    .scaleOrdinal()
    .domain(['white', 'black', 'other', 'hispanic'])
    .range(['#98abc5', '#8a89a6', '#a05d56', '#ff8c00'])

  // Stack the data
  const stack = d3.stack().keys(['white', 'black', 'other', 'hispanic'])
  const stackedData = stack(yearlyData)

  // Create bars
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

  // Tooltips
  rects.attr('title', function (d) {
    const parentData = d3.select(this.parentNode).datum()
    const ethnicity = parentData.key
    const year = d.data.year
    const studentCount = d[1] - d[0]
    const totalStudents = d.data.total
    const color = colorScale(ethnicity)

    return `
      <span class="summary-tooltip">
        <p class="tip3">School Year: ${year}</p>
        <p class="tip3">Student Body #: ${d3.format(',')(totalStudents)}</p>
        <p class="tip3">--------------------------</p>
        <p class="tip3">Race/Ethnicity: <span style="color:${color}">${ethnicity.charAt(0).toUpperCase() + ethnicity.slice(1)}</span></p>
        <p class="tip1"># of Students: <span style="color:${color}">${d3.format(',')(studentCount)}</span></p>
        <p class="tip1">% of Students: <span style="color:${color}">${d3.format('.2%')(studentCount / totalStudents)}</span></p>
      </span>
    `
  })

  // Add axes
  g.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))

  g.append('g').attr('class', 'y axis').call(d3.axisLeft(y))

  // Add legend
  const legendX = window.innerWidth <= 768 ? 10 : width + margin.left + 10
  const legendY =
    window.innerWidth <= 768 ? height + margin.top + margin.bottom + 20 : margin.top + 20

  const legend = svg
    .append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${legendX}, ${legendY})`)

  const legendItems = Object.entries(colors).map((d, i) => ({
    key: d[0],
    color: d[1],
    y: window.innerWidth <= 768 ? 0 : i * 25,
    x: window.innerWidth <= 768 ? i * 80 : 0,
  }))

  const legendItem = legend
    .selectAll('.legend-item')
    .data(legendItems)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d) =>
      window.innerWidth <= 768 ? `translate(${d.x}, ${d.y})` : `translate(0, ${d.y})`,
    )

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
    .style('font-size', fontSize)
    .style('font-family', 'Raleway, sans-serif')
    .style('fill', '#000')
    .text((d) => d.key.charAt(0).toUpperCase() + d.key.slice(1))

  // Initialize tooltips
  setTimeout(() => {
    const rectElements = document.querySelectorAll('svg rect[title]')
    if (rectElements.length > 0) {
      initTooltips('svg rect[title]')
    }
  }, 500)
}

const debouncedCreateChart = debounce(createChart, 200)

const handleResize = () => {
  debouncedCreateChart()
}

onMounted(() => {
  if (props.data.length > 0) {
    createChart()
  }
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
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

<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<style scoped>
.chart-container {
  width: 100%;
  max-width: 800px;
  height: auto;
}
</style>
