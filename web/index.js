import moment from 'moment'
import Chart from 'chart.js'
import d2d from 'degrees-to-direction'

const chartDefinition = require('../lib/chart-definition')
const MovingAverage = require('../lib/movingaverage_class')

console.log('WHW ANEMOMETER')

const socket = new WebSocket('ws://' + document.location.host + '/echo')
socket.onopen = function(event) {
  socket.send('hello from ' + navigator.userAgent)
}

const av = []
const mav = new MovingAverage(av, 100)
const aa = []
const maa = new MovingAverage(aa, 30)

socket.onmessage = function(event) {
  const data = event.data.split(':')

  if (data[0] == 'anemo/windvane') {
    mav.add(parseFloat(data[1]))
    const degrees = mav.average()
    const direction = d2d(degrees)
    console.log('MAV', mav.statistics())
    $('#windvane-label').html(direction)
    $('#tendency-rose').css('transform', 'rotate(' + (mav.statistics().tendency - 90) + 'deg)')
    $('#windvane').css(
      'transform',
      'rotate(' + (mav.average() - mav.statistics().tendency) + 'deg)'
    )
    //
  } else if (data[0] == 'anemo/anemo') {
    maa.add(parseFloat(data[1]))
    //console.log('MAA', maa.statistics())
    let sign = maa.statistics().tendency > maa.average() ? 'zunehmend' : 'abnehmend'
    const kmh = maa.average()
    const knoten = kmh / 1.852
    $('#windspeed').html(kmh.toFixed(1) + ' km/h  - ' + knoten.toFixed(1) + ' Kn (' + sign + ')')
    //
  }
  /*
  else if (data[0] == 'anemo/rain') {
    $('#rain').html('Letzter Regen: ' + moment(parseInt(data[1])).fromNow())
    //
  }
  */
}

const anemoChartCtx = document.getElementById('anemoChart').getContext('2d')
const vaneChartCtx = document.getElementById('vaneChart').getContext('2d')
//const rainChartCtx = document.getElementById('rainChart').getContext('2d')

const anemoChart = new Chart(anemoChartCtx, chartDefinition.anemoChartDefinition)
const vaneChart = new Chart(vaneChartCtx, chartDefinition.vaneChartDefinition)
//const rainChart = new Chart(rainChartCtx, chartDefinition.rainChartDefintion)

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
  /*
  jQuery.get(
    document.location.protocol + '//' + document.location.host + '/chartdata/rain',
    function(data) {
      rainChart.data = data
      rainChart.update()
      ic--
      if (ic == 0) setTimeout(updateCharts, updateInterval)
    }
  )
  */
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
