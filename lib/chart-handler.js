import moment from 'moment'

const util = require('./util')
const chartDefinition = require('./chart-definition')

function intervalGenerator(start, end, incrementFn) {
  const intervals = []
  let c = start.clone()
  while (c.isSameOrBefore(end)) {
    intervals.push(c)
    c = incrementFn.call(null, c)
  }
  return intervals
}


const asyncPrepareData = (callback, rows, start, end, incFn, mode) => {
  /* callback = function that will be called upon calculation result */
  /* rows = array of tuples with keys t = momentjs and y = value */
  /* start = start of data, momentjs */
  /* end = end of data, momentjs */
  /* incFn = function that will increment moment object in specific intervals */
  // mode = 'sum', 'avg', 'med'
  // will :fill empty datapoints with zeroes
  const result = []
  const intervals = intervalGenerator(start, end, incFn)
  
  const handleInterval = (cb) => {
    const splice = intervals.splice(0, 1); 
    if (splice.length === 0) {
      cb(result);
      return;
    } 
    const intervalStart = splice[0]
    const intervalEnd = incFn.call(null, intervalStart)
    const filteredRows = rows.filter((row) => row.t.isBetween(intervalStart, intervalEnd, null, '[)'))

    // build the sum of all values in this interval
    let reducedValue = filteredRows.map((row) => row.y).reduce((sum, val) => sum + val, 0)

    // AVERAGE
    if (mode === 'avg' && filteredRows.length > 0) {
      reducedValue = reducedValue / filteredRows.length
    } 
    // MEDIAN
    else if (mode === 'med' && filteredRows.length > 1) {
      const sorted = filteredRows.slice(0).sort((a, b) => a.y - b.y)
      const len = sorted.length
      const half = Math.floor(len / 2)

      if (len % 2) {
        // eslint-disable-next-line security/detect-object-injection
        reducedValue = (sorted[half - 1].y + sorted[half].y) / 2.0
      }
      // eslint-disable-next-line security/detect-object-injection
      reducedValue = sorted[half].y
    }

    result.push({
      y: reducedValue,
      t: intervalStart.clone()
    })

    // this way the event loop will not block and handle other events 
    // while this heavy compuatation is running...
    setImmediate(handleInterval.bind(null, cb));
  }
  handleInterval((res) => callback(res))
}

const handleChart = (db, res, start, end, sensorGraph) => {
  // TODO The variant data has been defined in the sensorGraoh object. To be extended, if needed.

  //console.log(sensorGraph.sensorType)
  db.all(sensorGraph.dataQuery, start.valueOf(), end.valueOf(), (err, rows) => {
    if (err) throw err
    const callback = (result) => {
      const dataSetBase = util.clone(sensorGraph.datasetProperties)
      dataSetBase.data = result 
      res.json({
        datasets: [dataSetBase],
        labels: result.map((r) => r.t)
      })
    }

    asyncPrepareData(
      callback,
      rows.map((row) => ({ y: row.value, t: moment(parseInt(row.date)) })),
      start,
      end,
      sensorGraph.timeBin,
      sensorGraph.estimator
    )

  })
}

export const builder = (db, type) => {
  return (req, res) => {
    const end = moment()
      .startOf('hour')
      .add(1, 'h')
    const start = end.clone().subtract(6, 'h')
          
    const index = chartDefinition.graphDefinitionArray.findIndex((elem) => elem.sensorType === type)
    // eslint-disable-next-line security/detect-object-injection
    const sensorGraphDefinition = chartDefinition.graphDefinitionArray[index]
    handleChart(db, res, start, end, sensorGraphDefinition)
  }
}
