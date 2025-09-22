<template>
  <div class="school-list-container">
    <div class="school-list">
      <ul>
        <li
          v-for="school in schools"
          :key="school.id"
          :class="{ 'selected-school': selectedSchool?.id === school.id }"
          @click="selectSchool(school)"
        >
          <h5>{{ school.info.name }}</h5>
          <div v-if="selectedSchool?.id === school.id" class="inner">
            <div class="upper ral normal black">
              {{ school.info.address }}, {{ school.info.city }}, {{ school.info.state }}
              {{ school.info.zip }}<br />
              <br />

              <!-- Check if we have both before and after data -->
              <div v-if="hasCompleteData(school)">
                <table>
                  <thead>
                    <tr class="heavier">
                      <th>Year</th>
                      <th>White</th>
                      <th>Black</th>
                      <th>Other</th>
                      <th>Hispanic</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- Before data -->
                    <tr>
                      <td>{{ school.before[0].short_year }} (#)</td>
                      <td class="white">{{ school.before[0].white || 0 }}</td>
                      <td class="black">{{ school.before[0].black || 0 }}</td>
                      <td class="other">{{ school.before[0].other || 0 }}</td>
                      <td class="hispanic">{{ school.before[0].hispanic || 0 }}</td>
                      <td>{{ school.before[0].total || calculateTotal(school.before[0]) }}</td>
                    </tr>
                    <tr>
                      <td>{{ school.before[0].short_year }} (%)</td>
                      <td class="white">
                        {{ calculatePercentage(school.before[0].white, school.before[0]) }}%
                      </td>
                      <td class="black">
                        {{ calculatePercentage(school.before[0].black, school.before[0]) }}%
                      </td>
                      <td class="other">
                        {{ calculatePercentage(school.before[0].other, school.before[0]) }}%
                      </td>
                      <td class="hispanic">
                        {{ calculatePercentage(school.before[0].hispanic, school.before[0]) }}%
                      </td>
                      <td>&nbsp;</td>
                    </tr>
                    <tr>
                      <td colspan="6">&nbsp;</td>
                    </tr>

                    <!-- After data -->
                    <tr>
                      <td>{{ school.after[0].short_year }} (#)</td>
                      <td class="white">{{ school.after[0].white || 0 }}</td>
                      <td class="black">{{ school.after[0].black || 0 }}</td>
                      <td class="other">{{ school.after[0].other || 0 }}</td>
                      <td class="hispanic">{{ school.after[0].hispanic || 0 }}</td>
                      <td>{{ school.after[0].total || calculateTotal(school.after[0]) }}</td>
                    </tr>
                    <tr>
                      <td>{{ school.after[0].short_year }} (%)</td>
                      <td class="white">
                        {{ calculatePercentage(school.after[0].white, school.after[0]) }}%
                      </td>
                      <td class="black">
                        {{ calculatePercentage(school.after[0].black, school.after[0]) }}%
                      </td>
                      <td class="other">
                        {{ calculatePercentage(school.after[0].other, school.after[0]) }}%
                      </td>
                      <td class="hispanic">
                        {{ calculatePercentage(school.after[0].hispanic, school.after[0]) }}%
                      </td>
                      <td>&nbsp;</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Show partial data -->
              <div v-else-if="school.before && school.before.length > 0">
                <table>
                  <thead>
                    <tr class="heavier">
                      <th>Year</th>
                      <th>White</th>
                      <th>Black</th>
                      <th>Other</th>
                      <th>Hispanic</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{{ school.before[0].short_year }} (#)</td>
                      <td class="white">{{ school.before[0].white || 0 }}</td>
                      <td class="black">{{ school.before[0].black || 0 }}</td>
                      <td class="other">{{ school.before[0].other || 0 }}</td>
                      <td class="hispanic">{{ school.before[0].hispanic || 0 }}</td>
                      <td>{{ school.before[0].total || calculateTotal(school.before[0]) }}</td>
                    </tr>
                    <tr>
                      <td>{{ school.before[0].short_year }} (%)</td>
                      <td class="white">
                        {{ calculatePercentage(school.before[0].white, school.before[0]) }}%
                      </td>
                      <td class="black">
                        {{ calculatePercentage(school.before[0].black, school.before[0]) }}%
                      </td>
                      <td class="other">
                        {{ calculatePercentage(school.before[0].other, school.before[0]) }}%
                      </td>
                      <td class="hispanic">
                        {{ calculatePercentage(school.before[0].hispanic, school.before[0]) }}%
                      </td>
                      <td>&nbsp;</td>
                    </tr>
                    <tr>
                      <td colspan="6"><em>No comparison data available for 14-15</em></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- No data at all -->
              <div v-else>
                <p><em>No demographic data available for this school.</em></p>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { watch, nextTick } from 'vue'
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

const selectSchool = (school) => {
  emit('school-selected', school)
}

const hasCompleteData = (school) => {
  return school.before && school.before.length > 0 && school.after && school.after.length > 0
}

const calculateTotal = (data) => {
  if (!data) return 0
  return (data.white || 0) + (data.black || 0) + (data.other || 0) + (data.hispanic || 0)
}

const calculatePercentage = (value, data) => {
  if (!value || !data) return '0.00'
  const total = data.total || calculateTotal(data)
  if (total === 0) return '0.00'
  return ((value / total) * 100).toFixed(2)
}

// Watch for selected school changes and scroll to it
watch(
  () => props.selectedSchool,
  async (newSchool) => {
    if (newSchool) {
      await nextTick()

      // Find the selected school element and scroll it into view
      const selectedElement = document.querySelector('.selected-school')
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })

        // Optional: Adjust scroll position like your old code
        const schoolList = document.getElementById('school-list')
        if (schoolList) {
          schoolList.scrollTop = schoolList.scrollTop - 33
        }
      }
    }
  },
)
</script>

<style scoped>
.selected-school {
  background: #fff;
  display: block !important;
  cursor: default !important;
}

.selected-school .inner {
  padding-bottom: 8px;
  font-size: 13px;
}

.selected-school .inner table {
  width: 100%;
}

.selected-school .inner td,
.selected-school .inner th {
  text-align: center;
}

.selected-school .inner td.white {
  color: #98abc5;
}

.selected-school .inner td.black {
  color: #8a89a6;
}

.selected-school .inner td.other {
  color: #a05d56;
}

.selected-school .inner td.hispanic {
  color: #ff8c00;
}
</style>
