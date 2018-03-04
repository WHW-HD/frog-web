import moment from 'moment'
import { clearLine } from 'readline'

const util = require('./util')
const chartDefinition = require('./chart-definition')

function* intervalGenerator(start, end, incrementFn) {
  let c = start.clone()
  while (c.isSameOrBefore(end)) {
    yield c
    c = incrementFn.call(null, c)
  }
}

const prepareData = (rows, start, end, incFn, mode) => {
  /* rows = array of tuples with keys t = momentjs and y = value */
  /* start = start of data, momentjs */
  /* end = end of data, momentjs */
  /* incFn = function that will increment moment object in specific intervals */
  // mode = 'sum', 'avg', 'med'
  // will :fill empty datapoints with zeroes
  const result = []

  for (const s of intervalGenerator(start, end, incFn)) {
    const e = incFn.call(null, s)
    const filteredRows = rows.filter((row) => row.t.isBetween(s, e, null, '[)'))
    let reducedValue = filteredRows.reduce((acc, cur, idx, arr) => cur.y + acc, 0)

    if (mode == 'avg' && filteredRows.length > 0) {
      reducedValue = reducedValue / filteredRows.length
    }
    else if (mode == 'med' && filteredRows.length > 1) {
      // calculate median
      const sorted = filteredRows.slice(0).sort((a, b) => a.y - b.y)
      const len = sorted.length
      const half = Math.floor(len / 2)

      if (len % 2) reducedValue = (sorted[half - 1].y + sorted[half].y) / 2.0
      reducedValue = sorted[half].y
    }

    result.push({
      y: reducedValue,
      t: s.clone()
    })
  }

  return result
}

const handleChart = (db, res, start, end, sensorGraph) => {
  // TODO The variant data has been defined in the sensorGraoh object. To be extended, if needed.

  console.log(sensorGraph.sensorType)
  db.all(sensorGraph.dataQuery, start.valueOf(), end.valueOf(), (err, rows) => {
    if (err) throw err

    const data = prepareData(
      rows.map((row) => ({ y: row.value, t: moment(parseInt(row.date)) })),
      start,
      end,
      sensorGraph.timeBin,
      sensorGraph.estimator
    )

    const dataSetBase = util.clone(sensorGraph.datasetProperties)
    dataSetBase.data = data
    res.json({
      datasets: [dataSetBase],
      labels: data.map((r) => r.t)
    })
  })
}

export const builder = (db, type) => {
  return (req, res) => {
    const end = moment()
      .startOf('hour')
      .add(1, 'h')
    const start = end.clone().subtract(6, 'h')

    const index = chartDefinition.graphDefinitionArray.findIndex((elem) => elem.sensorType === type)
    const sensorGraphDefinition = chartDefinition.graphDefinitionArray[index]
    handleChart(db, res, start, end, sensorGraphDefinition)
  }
}
