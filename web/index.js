import moment from 'moment'

console.log("WHW ANEMOMETER")

var socket = new WebSocket("ws://" + document.location.host +'/echo')
socket.onopen = function(event) {
  socket.send("hello from " + navigator.userAgent)
}

socket.onmessage = function(event) {
  console.log("received data: " + event.data)
  var data = event.data.split(":")
  if (data[0] == 'anemo/windvane') {
    $('#windvane').css('transform', 'rotate(' + (parseFloat(data[1]) - 90) + 'deg)')
  }
  else if (data[0] == 'anemo/anemo') {
    $('#windspeed').html(parseFloat(data[1]).toFixed(2) + " km/h")
  }
  else if (data[0] == 'anemo/rain') {
    $('#rain').html("Letzer Regen: " + moment(parseInt(data[1])).fromNow())
  }
}

var anemoChartCtx = document.getElementById("anemoChart").getContext('2d');
var vaneChartCtx = document.getElementById("vaneChart").getContext('2d');
var rainChartCtx = document.getElementById("rainChart").getContext('2d');

var anemoChart = new Chart(anemoChartCtx, {
  type: 'line',
  options: {
    scales: {
      yAxes: [{
        id: 'a1',
        ticks: {
          beginAtZero:false,
          suggestedMax: 25
        }
      }],
      xAxes: [{
        type: 'time',
        position: 'bottom'
      }]
    },
    elements: {
      line: {
        tension: 0, // disables bezier curves
      }
    },
    animation: false
  }
})

var vaneChart = new Chart(vaneChartCtx, {
  type: 'line',
  options: {
    scales: {
      yAxes: [{
        id: 'a1',
        ticks: {
          beginAtZero:true,
          suggestedMax: 360
        }
      }],
      xAxes: [{
        type: 'time',
        position: 'bottom'
      }]
    },
    elements: {
      line: {
        tension: 0, // disables bezier curves
      }
    },
    animation: false
  }
})

var rainChart = new Chart(rainChartCtx, {
  type: 'bar',
  options: {
    scales: {
      yAxes: [{
        id: 'a1',
        ticks: {
          beginAtZero:true,
          suggestedMax: 20
        }
      }],
      xAxes: [{
        type: 'time',
        position: 'bottom',
        gridLines: {
          offsetGridLines: false
        },
        ticks: {
          source: 'labels'
        },
        bounds: 'ticks'
      }]
    },
    animation: false
  }
})

const updateCharts = () => {
  let ic = 3;
  jQuery.get(document.location.protocol + "//" + document.location.host + "/chartdata/anemo", function(data) {
    anemoChart.data = data
    anemoChart.update()
    ic--
    if (ic == 0) setTimeout(updateCharts, 5000)
  });
  jQuery.get(document.location.protocol + "//" + document.location.host + "/chartdata/vane", function(data) {
    vaneChart.data = data
    vaneChart.update()
    ic--
    if (ic == 0) setTimeout(updateCharts, 5000)
  });
  jQuery.get(document.location.protocol + "//" + document.location.host + "/chartdata/rain", function(data) {
    rainChart.data = data
    rainChart.update()
    ic--
    if (ic == 0) setTimeout(updateCharts, 5000)
  });
}
updateCharts()
