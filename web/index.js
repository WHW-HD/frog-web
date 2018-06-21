import moment from 'moment'
import Chart from 'chart.js'
import d2d from 'degrees-to-direction'

const chartDefinition = require('../lib/chart-definition')
const MovingAverage = require('../lib/movingaverage')
const WindAverage = require('../lib/windaverage')

console.log('WHW ANEMOMETER')

const socket = new WebSocket('ws://' + document.location.host + '/echo')
socket.onopen = function(event) {
  socket.send('hello from ' + navigator.userAgent)
}

const av = []
const mav = new WindAverage(av, 100)
const aa = []
const maa = new MovingAverage(aa, 100)

socket.onmessage = function(event) {
  const data = event.data.split(':')

  if (data[0] == 'anemo/windvane') {
    // Wind direction
    mav.add(parseFloat(data[1]))
    const dirStats = mav.statistics()
    console.log('MAV', dirStats)
    const degrees = dirStats.average //mav.average()
    const direction = d2d(degrees)

    $('#windvane-label').html(direction)
    $('#tendency-rose').css('transform', 'rotate(' + (dirStats.tendency - 90) + 'deg)')
    $('#windvane').css('transform', 'rotate(' + (dirStats.average - dirStats.tendency) + 'deg)')

    // Wind direction information
    var winddirDiff = dirStats.tendency - dirStats.average
    $('#winddir').html('Winddreher: ' + winddirDiff.toFixed(0) + '°')
    //
  }
  else if (data[0] == 'anemo/anemo') {
    // Windstärke
    maa.add(parseFloat(data[1]))
    const windStats = maa.statistics()
    console.log('MAA', windStats)

    // Wind speed information
    let sign = ''
    var x = Math.abs(windStats.tendency - windStats.average) - 0.5 * windStats.averageDev
    var y = Math.abs(windStats.tendency - windStats.average) - 1.5 * windStats.averageDev
    if (x > 0) {
      sign = windStats.tendency > windStats.average ? 'zunehmend' : 'abflauend'
    }
    if (y > 0) {
      sign = windStats.tendency > windStats.average ? 'Böen' : 'stark abflauend'
    }

    const kmh = windStats.average
    const knoten = kmh / 1.852
    $('#windspeed').html(kmh.toFixed(1) + ' km/h  - ' + knoten.toFixed(1) + ' kn ')
    $('#windspeedComment').html(sign)
    //
  }
}

const anemoChartCtx = document.getElementById('anemoChart').getContext('2d')
const vaneChartCtx = document.getElementById('vaneChart').getContext('2d')

const anemoChart = new Chart(anemoChartCtx, chartDefinition.anemoChartDefinition)
const vaneChart = new Chart(vaneChartCtx, chartDefinition.vaneChartDefinition)

//console.log('anemochart', anemoChart)
const updateCharts = () => {
  const updateInterval = 1000 * 60 * 5 // 5 minutes
  //console.log('anemochart', anemoChart)
  let ic = 2
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
}

updateCharts()

// button handler

jQuery(function($) {
  let sunsetButtonTextExpanded = false
  $('#toggle-extended-sunset').click(function(event) {
    $('.fn-extended-sunset').toggle()
    $(this).html(
      sunsetButtonTextExpanded ? 'Erweiterte Infos anzeigen' : 'Erweiterte Infos verbergen'
    )
    sunsetButtonTextExpanded = !sunsetButtonTextExpanded
  })
})
