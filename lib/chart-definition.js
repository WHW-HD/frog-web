const TYPE_ANEMO = 'anemo'
const TYPE_VANE = 'vane'
//const TYPE_RAIN = 'rain'

const hourly = (t) => t.clone().add(1, 'h')
const halfHourly = (t) => t.clone().add(30, 'm')
const fiveMinutely = (t) => t.clone().add(5, 'm')

/*
  Definition for Anemo
*/
const anemoChartDefinition = {
  type: 'line',
  options: {
    scales: {
      yAxes: [
        {
          id: 'a1',
          ticks: {
            beginAtZero: false,
            suggestedMin: 0,
            suggestedMax: 25
          }
        }
      ],
      xAxes: [
        {
          type: 'time',
          time: {
            displayFormats: {
              hour: 'HHmm'
            }
          },
          position: 'bottom'
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
}

const ANEMO_SQL = `
	SELECT 
		date,
		value
	FROM 
		data 
	WHERE 
		sensor = 'anemo/anemo' 
		AND 
		date > ? 
		AND
		date < ?`

const anemoGraph = {
  sensorType: TYPE_ANEMO,
  logMessage: 'Handle Anemo',
  timeBin: fiveMinutely,
  estimator: 'med',
  datasetProperties: {
    label: 'Windgeschwindigkeit (km/h)',
    yAxisID: 'a1',
    backgroundColor: '#bada55',
    pointRadius: 0
  },
  dataQuery: ANEMO_SQL
}

/*
  Definition for windvane
*/
const vaneChartDefinition = {
  type: 'line',
  options: {
    scales: {
      yAxes: [{ id: 'a1', ticks: { beginAtZero: false, suggestedMax: 360 } }],
      xAxes: [
        {
          type: 'time',
          position: 'bottom'
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
}
const WINDVANE_SQL = `
	SELECT 
		date,
		value
	FROM 
		data 
	WHERE 
		sensor = 'anemo/windvane' 
		AND
		date > ? 		
		AND
    date < ?`

const windvaneGraph = {
  sensorType: TYPE_VANE,
  logMessage: 'Handle Windvane',
  timeBin: fiveMinutely,
  estimator: 'avg',
  datasetProperties: {
    label: 'Windrichtung (grad)',
    yAxisID: 'a1',
    backgroundColor: 'rgba(100, 100, 0, 0.2)',
    pointRadius: 0
  },
  dataQuery: WINDVANE_SQL
}

/*
  Definiton for rain
*/

/*
const rainChartDefintion = {
  type: 'bar',
  options: {
    scales: {
      yAxes: [
        {
          id: 'a1',
          ticks: {
            beginAtZero: true,
            suggestedMax: 20
          }
        }
      ],
      xAxes: [
        {
          type: 'time',
          position: 'bottom',
          gridLines: {
            offsetGridLines: false
          },
          ticks: {
            source: 'labels'
          },
          bounds: 'ticks'
        }
      ]
    },
    animation: false
  }
}

const RAIN_SQL = `
	SELECT
		date
	FROM
		data
	WHERE
		sensor = 'anemo/rain'
		AND
		date > ? 
		AND date < ?`

const rainGraph = {
  sensorType: TYPE_RAIN,
  logMessage: 'Handle Rain',
  timeBin: halfHourly,
  estimator: '',
  datasetProperties: {
    label: 'Regen (mm/h)',
    yAxisID: 'a1',
    backgroundColor: 'rgba(0, 0, 100, 0.8)',
    pointRadius: 0
  },
  dataQuery: RAIN_SQL
}
*/

const graphDefinitionArray = [anemoGraph, windvaneGraph/*, rainGraph*/]

module.exports = {
  anemoChartDefinition,
  graphDefinitionArray,
  vaneChartDefinition,
  //rainChartDefintion,
  TYPE_ANEMO,
  //TYPE_RAIN,
  TYPE_VANE
}
