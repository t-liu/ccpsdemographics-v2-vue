<template>
  <div class="map-container">
    <div ref="mapContainer" id="map"></div>

    <!-- Add the hover box (hidden by default) -->
    <div
      id="map-hover-box"
      ref="hoverBox"
      :style="{
        display: hoverBoxVisible ? 'block' : 'none',
        left: hoverBoxPosition.x + 'px',
        top: hoverBoxPosition.y + 'px',
      }"
      v-html="hoverBoxContent"
    ></div>

    <div class="legend">
      <h4>School Levels</h4>
      <div class="legend-item">
        <div class="legend-circle" style="background-color: #ff6b6b"></div>
        <span>Elementary (E)</span>
      </div>
      <div class="legend-item">
        <div class="legend-circle" style="background-color: #4ecdc4"></div>
        <span>Middle (M)</span>
      </div>
      <div class="legend-item">
        <div class="legend-circle" style="background-color: #45b7d1"></div>
        <span>High (H)</span>
      </div>
      <div class="legend-item">
        <div class="legend-circle" style="background-color: #96ceb4"></div>
        <span>Other (O)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  schools: {
    type: Array,
    required: true,
  },
  selectedSchool: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['school-selected'])

const mapContainer = ref(null)
const hoverBox = ref(null)
let map = null
let markersLayer = null
let mapReady = false

// Hover box reactive variables
const hoverBoxVisible = ref(false)
const hoverBoxPosition = ref({ x: 0, y: 0 })
const hoverBoxContent = ref('')

// Color mapping for school levels
const levelColors = {
  E: '#ff6b6b', // Red for Elementary
  M: '#4ecdc4', // Teal for Middle
  H: '#45b7d1', // Blue for High
  O: '#96ceb4', // Green for Other
}

const initMap = () => {
  console.log('🗺️ Initializing map...')

  map = L.map(mapContainer.value).setView([38.6, -76.9], 10)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map)

  markersLayer = L.layerGroup().addTo(map)

  // Add mouse move listener to map container for hover box positioning
  map.getContainer().addEventListener('mousemove', updateHoverBoxPosition)

  // Wait for map to be fully loaded
  map.whenReady(() => {
    console.log('✅ Map is ready!')
    mapReady = true

    // Try to add markers if we already have school data
    if (props.schools && props.schools.length > 0) {
      console.log('🎯 Map ready and schools available, adding markers')
      addSchoolMarkers()
    }
  })

  console.log('🗺️ Map initialization complete')
}

const updateHoverBoxPosition = (e) => {
  if (hoverBoxVisible.value) {
    hoverBoxPosition.value = {
      x: e.clientX + 10, // Offset from cursor
      y: e.clientY - 50, // Offset from cursor
    }
  }
}

const initHover = () => {
  // Your original initHover function logic if needed
  // For now, just ensure hover box is ready
}

const addSchoolMarkers = () => {
  console.log('🎯 addSchoolMarkers called')
  console.log('  Schools:', props.schools.length)

  if (!mapReady || !map || !markersLayer) {
    console.log('❌ Prerequisites not met, skipping marker addition')
    return
  }

  console.log('🧹 Clearing existing markers')
  markersLayer.clearLayers()

  let markersAdded = 0

  props.schools.forEach((school) => {
    const lat = school.info?.lat
    const lon = school.info?.lon
    const level = school.info?.level || 'O'

    if (lat && lon && !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
      try {
        console.log(
          `📍 Adding circle marker ${markersAdded + 1} for ${school.info.name} (${level}) at [${lat}, ${lon}]`,
        )

        // Create circle marker matching your old codebase style
        const circle = L.circleMarker([lat, lon], {
          radius: 7,
          fillColor: levelColors[level] || levelColors['O'],
          color: '#000', // Black stroke
          weight: 1, // stroke-width="1"
          opacity: 1, // stroke-opacity="1"
          fillOpacity: 0.6, // Semi-transparent fill
          lineCap: 'round', // stroke-linecap="round"
          lineJoin: 'round', // stroke-linejoin="round"
        })

        circle.on('click', () => {
          console.log('📍 Circle clicked for:', school.info.name)
          emit('school-selected', school)
          layer.setStyle({
            weight: 3,
            color: '#000',
            fillOpacity: 0.8,
          })
          layer.bringToFront()
        })

        circle.on('mouseover', function (e) {
          initHover()
          const layer = e.target

          // Update circle style (matching your old code)
          layer.setStyle({
            weight: 3,
            color: '#000',
            fillOpacity: 0.8,
          })
          layer.bringToFront()

          // Update hover box content (matching your old HTML structure)
          hoverBoxContent.value =
            `<b>${school.info.name}</b><br>` +
            `${school.info.address}<br>` +
            `${school.info.city}, ${school.info.state}&nbsp;${school.info.zip}<br>`

          // Show hover box
          hoverBoxVisible.value = true
        })

        circle.on('mouseout', function (e) {
          const layer = e.target

          // Reset circle style
          layer.setStyle({
            fillOpacity: 0.6,
            weight: 1,
            color: '#000',
          })
          layer.bringToBack()

          // Hide hover box
          hoverBoxVisible.value = false
        })

        markersLayer.addLayer(circle)
        markersAdded++
      } catch (error) {
        console.error('❌ Error creating circle marker:', error)
      }
    } else {
      console.warn(`⚠️ Invalid coordinates for ${school.info?.name}: lat=${lat}, lon=${lon}`)
    }
  })

  console.log(`✅ Successfully added ${markersAdded} circle markers`)

  // Fit map to show all markers
  if (markersAdded > 0) {
    setTimeout(() => {
      try {
        const group = new L.featureGroup(markersLayer.getLayers())
        map.fitBounds(group.getBounds(), { padding: [20, 20] })
      } catch (e) {
        console.warn('Could not fit bounds:', e)
      }
    }, 100)
  }
}

onMounted(async () => {
  console.log('🚀 SchoolMap mounted')
  await nextTick()
  initMap()
})

// timeout to make sure map is ready before adding school markers
watch(
  () => props.schools,
  (newSchools) => {
    console.log('👁️ Schools data changed:', newSchools?.length || 0, 'schools')

    if (newSchools && newSchools.length > 0) {
      if (mapReady) {
        addSchoolMarkers()
      } else {
        const checkMapReady = () => {
          if (mapReady) {
            addSchoolMarkers()
          } else {
            setTimeout(checkMapReady, 100)
          }
        }
        setTimeout(checkMapReady, 100)
      }
    }
  },
  { immediate: true },
)

watch(
  () => props.selectedSchool,
  (school) => {
    if (school && map && school.info?.lat && school.info?.lon) {
      // Center map and highlight the selected school
      map.setView([school.info.lat, school.info.lon], 12)

      // Find and highlight the selected school's circle
      markersLayer.eachLayer((layer) => {
        if (
          layer.getLatLng &&
          layer.getLatLng().lat === school.info.lat &&
          layer.getLatLng().lng === school.info.lon
        ) {
          layer.openPopup()
          // Temporarily highlight
          layer.setStyle({ weight: 3, fillOpacity: 0.8 })
          setTimeout(() => {
            layer.setStyle({ weight: 1, fillOpacity: 0.6 })
          }, 2000)
        }
      })
    }
  },
)
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 500px;
  position: relative;
}
</style>
