import moment from 'moment'
import Chart from 'chart.js'

const chartDefinition = require('../lib/chart-definition')

console.log('WHW ANEMOMETER')

const socket = new WebSocket('ws://' + document.location.host + '/echo')
socket.onopen = function(event) {
  socket.send('hello from ' + navigator.userAgent)
}

socket.onmessage = function(event) {
  console.log('received data: ' + event.data)
  const data = event.data.split(':')
  if (data[0] == 'anemo/windvane') {
    $('#windvane').css('transform', 'rotate(' + (parseFloat(data[1]) - 90) + 'deg)')
  } else if (data[0] == 'anemo/anemo') {
    $('#windspeed').html(parseFloat(data[1]).toFixed(2) + ' km/h')
  } else if (data[0] == 'anemo/rain') {
    $('#rain').html('Letzter Regen: ' + moment(parseInt(data[1])).fromNow())
  }
}

const anemoChartCtx = document.getElementById('anemoChart').getContext('2d')
const vaneChartCtx = document.getElementById('vaneChart').getContext('2d')
const rainChartCtx = document.getElementById('rainChart').getContext('2d')

const anemoChart = new Chart(anemoChartCtx, chartDefinition.anemoChartDefinition)
const vaneChart = new Chart(vaneChartCtx, chartDefinition.vaneChartDefinition)
const rainChart = new Chart(rainChartCtx, chartDefinition.rainChartDefintion)

console.log('anemochart', anemoChart)
const updateCharts = () => {
  const updateInterval = 5000
  console.log('anemochart', anemoChart)
  let ic = 3
  jQuery.get(
    document.location.protocol + '//' + document.location.host + '/chartdata/anemo',
    function(data) {
      anemoChart.data = data
      anemoChart.update()
      ic--
      if (ic == 0) setTimeout(updateCharts, updateInterval)
    }
  )
  jQuery.get(
    document.location.protocol + '//' + document.location.host + '/chartdata/vane',
    function(data) {
      vaneChart.data = data
      vaneChart.update()
      ic--
      if (ic == 0) setTimeout(updateCharts, updateInterval)
    }
  )
  jQuery.get(
    document.location.protocol + '//' + document.location.host + '/chartdata/rain',
    function(data) {
      rainChart.data = data
      rainChart.update()
      ic--
      if (ic == 0) setTimeout(updateCharts, updateInterval)
    }
  )
}

updateCharts()
