<template>
  <div id="app">
    <nav class="navbar">
      <div class="navbar-header">
        <p class="navbar-text">A T-Liu Production</p>
      </div>
    </nav>

    <div class="content">
      <div v-if="loading">Loading data...</div>
      <div v-else-if="error">Error: {{ error }}</div>

      <template v-else>
        <!-- left column (empty for padding purposes) -->
        <div class="col-xs-2 col-sm-1 col-mid-1 col-lg-2"></div>

        <div class="col-xs-14 col-sm-10 col-mid-10 col-lg-8">
          <div id="briefsummary">
            <h3 class="upper ral heavier black">
              The Changing Demographics of Charles County Public Schools
            </h3>
            <p class="rob">
              In light of an August 2014
              <a
                href="http://www.cnn.com/2014/08/18/opinion/navarrette-majority-minority-students-public-schools/"
                target="_blank"
                title="Navarrette: Don't be afraid of America's changing demographics"
                >CNN article</a
              >
              by
              <a href="https://twitter.com/RubenNavarrette" target="_blank">Ruben Navarrette</a>
              that speaks about America's changing demographics in public schools, the below is a
              study on the same topic within this Southern Maryland county. The data visualization
              and short blurbs below will provide clarity on the breakdown at a county level and by
              each school.
            </p>
          </div>

          <div id="ccps-breakdown">
            <h4 class="upper fat ral black">Demographics at the county level</h4>
            <p class="small gray rob">
              The student body in Charles County public schools has seen an increase in minorities
              from the 2005-2006 school year to 2014-2015 school year and overall student enrollment
              has slightly decreased within that ten year span. The African-American and Hispanic
              population has seen a 15% and 110% rise, respectively, in that period. The white
              population, in that same time frame, has decreased 36% and had gradual decreases year
              over year.
            </p>
            <p class="small black rob" style="text-align: center">
              Hover over the chart to explore the overall demographics breakdown.
            </p>
          </div>

          <div class="jumbotron">
            <DemographicsChart :data="chartData" />
          </div>

          <div id="school-breakdown">
            <div id="school-breakdown-summary">
              <h4 class="upper fat ral black">Demographics by each schools</h4>
              <p class="small gray rob">
                Due to five new schools that were added after the 2005-2006 school year (North Point
                High, William A. Diggs Elementary, Theodore G. Davis, Mary B. Neal Elementary, and
                St. Charles High), student body count for several schools within their proximity has
                dropped in recent years. Of the 36 schools in Charles County, 25 of them entered the
                2014-2015 school year with non-Hispanic white students as a minority group. Of those
                25 schools, two of them had an African-American student population less than 50%. 12
                schools had at least eight percent of their student body represented with Hispanic
                background entering that same school year.
              </p>
              <p class="small black rob" style="text-align: center">
                Use this interactive map to explore the demographics of each school.
              </p>
            </div>
            <div>
              <div id="map-container">
                <SchoolMap
                  :schools="schools"
                  :selected-school="selectedSchool"
                  @school-selected="onSchoolSelected"
                />
              </div>

              <div id="school-list-container">
                <SchoolList
                  :schools="schools"
                  :selected-school="selectedSchool"
                  @school-selected="onSchoolSelected"
                />
              </div>
            </div>
          </div>
          <div id="school-breakdown-notation">
            <p class="gray small rob">
              <span class="upper fat ral">Note: </span>This analysis includes schools and programs
              listed under the
              <a href="http://www.ccboe.com/" target="_blank">Charles County Board of Education</a>.
              "Other" in the analysis includes the following: American Indian/Alaska Natives, Asian
              or Asian/Pacific Islanders, Hawaiian Native/Pacific Islanders, and Multi-racial
              students (data prior to 2010-2011 were not applicable to a few of the race/ethnicity
              listed above). <span class="upper fat ral"> Sources: </span
              ><a href="http://nces.ed.gov/" target="_blank"
                >National Center for Education Statistics</a
              >
              and
              <a href="http://www.ccboe.com/aboutus/fastfacts.php" target="_blank"
                >Charles County Public School System.</a
              >
            </p>
          </div>
        </div>

        <!-- right column (empty for padding purposes) -->
        <div class="col-xs-2 col-sm-1 col-mid-1 col-lg-2"></div>
      </template>
    </div>
  </div>

  <!-- Add your footer here -->
  <footer>
    <div class="footer">
      <div class="navbar-footer-left">
        <p class="navbar-text">Copyright &copy; {{ new Date().getFullYear() }} Thomas Liu</p>
      </div>
      <div class="navbar-collapse social-bookmarks">
        <ul class="nav navbar-nav navbar-right">
          <li class="mailto">
            <a href="mailto:thomas.s.liu@gmail.com" target="_blank" title="Personal E-mail"> </a>
          </li>
          <li class="twitter">
            <a href="https://twitter.com/tliu301" target="_blank" title="Personal Twitter"> </a>
          </li>
          <li class="linkedin">
            <a
              href="http://www.linkedin.com/in/thomas-liu-tech"
              target="_blank"
              title="Personal LinkedIn"
            >
            </a>
          </li>
          <li class="github">
            <a href="https://github.com/t-liu" target="_blank" title="Personal Github"> </a>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useData } from '@/composables/useData'
import DemographicsChart from '@/components/DemographicsChart.vue'
import SchoolMap from '@/components/SchoolMap.vue'
import SchoolList from '@/components/SchoolList.vue'

const { rawData, schools, loading, error, loadData } = useData()
const selectedSchool = ref(null)

const chartData = computed(() => {
  // Process your data for the chart
  return rawData.value
})

const onSchoolSelected = (school) => {
  selectedSchool.value = school
}

onMounted(() => {
  loadData()
})
</script>

<style>
/* Import your existing CSS */
@import '@/assets/style.css';

/* Add Vue-specific styles */
#app {
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  #school-breakdown {
    flex-direction: column;
  }
}
</style>
