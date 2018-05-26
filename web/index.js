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

let init = false
const windDirData = []
const maWindDirData = new MovingAverage(windDirData, 200)
let linearDirData = maWindDirData.linearData()

var dirData = {
  datasets: [
    {
      label: 'Winddreher (°) relativ zur Hauptwindrichtung',
      data: linearDirData,
      backgroundColor: '#0144ee',
      borderColor: '#0144ee',
      pointRadius: 0,
      fill: true
    }
  ]
}

var dirChartOptions = {
  legend: {
    display: true,
    position: 'top'
  },
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: false,
          suggestedMin: -10,
          suggestedMax: 10
        }
      }
    ],
    xAxes: [
      {
        type: 'linear',
        ticks: {
          beginAtZero: true,
          min: 0,
          max: 200,
          stepsize: 40
        }
      }
    ]
  },
  elements: {
    line: {
      tension: 0 // disables bezier curves
    }
  },
  animation: false
}

const windspeedData = []
const maWindspeedData = new MovingAverage(windspeedData, 200)
let linearWindspeedData = maWindspeedData.linearData()

var windspeedChartData = {
  datasets: [
    {
      label: 'Windstärken (km/h) relativ zum mittleren Wind',
      data: linearWindspeedData,
      backgroundColor: '#0144ee',
      borderColor: '#0144ee',
      pointRadius: 0,
      fill: true
    }
  ]
}

var windspeedChartOptions = {
  legend: {
    display: true,
    position: 'top'
  },
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: false,
          suggestedMin: -1,
          suggestedMax: 1
        }
      }
    ],
    xAxes: [
      {
        type: 'linear',
        ticks: {
          beginAtZero: true,
          min: 0,
          max: 200,
          stepsize: 40
        }
      }
    ]
  },
  elements: {
    line: {
      tension: 0 // disables bezier curves
    }
  },
  animation: false
}

function windspeedChart(text) {
  return
  new Chart(text, {
    type: 'line',
    data: windspeedChartData,
    options: windspeedChartOptions
  })
}

function myChart(text) {
  return
  new Chart(text, {
    type: 'line',
    data: dirData,
    options: dirChartOptions
  })
}

const av = []
const mav = new MovingAverage(av, 100)
const aa = []
const maa = new MovingAverage(aa, 100)

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

    // Wind direction information
    var winddirDiff = mav.statistics().tendency - mav.average()
    $('#winddir').html('Winddreher: ' + winddirDiff.toFixed(0) + '°')

    maWindDirData.add(winddirDiff)
    //
  } else if (data[0] == 'anemo/anemo') {
    maa.add(parseFloat(data[1]))
    console.log('MAA', maa.statistics())

    // Wind speed information
    let sign = ''
    var x = Math.abs(maa.statistics().tendency - maa.average()) - 0.5 * maa.statistics().variance
    var y = Math.abs(maa.statistics().tendency - maa.average()) - 1.5 * maa.statistics().variance
    if (x > 0) {
      sign = maa.statistics().tendency > maa.average() ? 'zunehmend' : 'abflauend'
    }
    if (y > 0) {
      sign = maa.statistics().tendency > maa.average() ? 'Böen' : 'stark abflauend'
    }

    const kmh = maa.average()
    const knoten = kmh / 1.852
    $('#windspeed').html(kmh.toFixed(1) + ' km/h  - ' + knoten.toFixed(1) + ' kn ')
    $('#windspeedComment').html(sign)

    maWindspeedData.add(maa.statistics().tendency - maa.average())
    //
  }

  /*
  else if (data[0] == 'anemo/rain') {
    $('#rain').html('Letzter Regen: ' + moment(parseInt(data[1])).fromNow())
    //
  }
  */
}

const updateMyChart = () => {
  linearDirData = maWindDirData.linearData()
  dirData.datasets[0].data = linearDirData
  var dirCanvas = document.getElementById('windstats')
  const mychart = new Chart(dirCanvas, {
    type: 'line',
    data: dirData,
    options: dirChartOptions
  })
  setTimeout(updateMyChart, 5000)
}

const updateWindspeedChart = () => {
  linearWindspeedData = maWindspeedData.linearData()
  windspeedChartData.datasets[0].data = linearWindspeedData
  var windspeedCanvas = document.getElementById('windspeedstats')
  const windspeedChart = new Chart(windspeedCanvas, {
    type: 'line',
    data: windspeedChartData,
    options: windspeedChartOptions
  })
  setTimeout(updateWindspeedChart, 5000)
}

if (!init) {
  updateMyChart()
  updateWindspeedChart()
  init = true
}

const anemoChartCtx = document.getElementById('anemoChart').getContext('2d')
const vaneChartCtx = document.getElementById('vaneChart').getContext('2d')
//const rainChartCtx = document.getElementById('rainChart').getContext('2d')

const anemoChart = new Chart(anemoChartCtx, chartDefinition.anemoChartDefinition)
const vaneChart = new Chart(vaneChartCtx, chartDefinition.vaneChartDefinition)
//const rainChart = new Chart(rainChartCtx, chartDefinition.rainChartDefintion)

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

function myChart() {}
