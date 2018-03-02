import moment from 'moment'

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

export const TYPE_ANEMO = 'anemo'
export const TYPE_VANE = 'vane'
export const TYPE_RAIN = 'rain'

function* intervalGenerator(start, end, incrementFn) {
  let c = start.clone()
  while (c.isSameOrBefore(end)) {
    yield c
    c = incrementFn.call(null, c)
  }
}

const hourly = (t) => t.clone().add(1, 'h')
const halfHourly = (t) => t.clone().add(30, 'm')
const fiveMinutely = (t) => t.clone().add(5, 'm')

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
    } else if (mode == 'med' && filteredRows.length > 1) {
      // calculate median
      const sorted = filteredRows.slice(0).sort((a, b) => a.y - b.y)
      const len = sorted.length
      const half = Math.floor(len / 2)

      if (len % 2) {
        reducedValue = (sorted[half - 1].y + sorted[half].y) / 2.0
      } else {
        reducedValue = sorted[half].y
      }
    }

    result.push({
      y: reducedValue,
      t: s.clone()
    })
  }

  return result
}

const handleAnemo = (db, res, start, end) => {
  console.log('Handle ANEMO ****************')
  db.all(ANEMO_SQL, start.valueOf(), end.valueOf(), (err, rows) => {
    if (err) throw err

    const data = prepareData(
      rows.map((row) => ({ y: row.value, t: moment(parseInt(row.date)) })),
      start,
      end,
      fiveMinutely,
      'med'
    )

    res.json({
      datasets: [
        {
          label: 'Windgeschwindigkeit (km/h)',
          yAxisID: 'a1',
          data: data,
          backgroundColor: '#bada55',
          pointRadius: 0
        }
      ],
      labels: data.map((r) => r.t)
    })
  })
}

const handleWindvane = (db, res, start, end) => {
  db.all(WINDVANE_SQL, start.valueOf(), end.valueOf(), (err, rows) => {
    if (err) throw err

    const data = prepareData(
      rows.map((row) => ({ y: row.value, t: moment(parseInt(row.date)) })),
      start,
      end,
      fiveMinutely,
      'avg'
    )
    data.pop()

    res.json({
      datasets: [
        {
          label: 'Windrichtung (grad)',
          yAxisID: 'a1',
          data: data,
          backgroundColor: 'rgba(100, 100, 0, 0.2)',
          pointRadius: 0
        }
      ],
      labels: data.map((r) => r.t)
    })
  })
}

const handleAnemoRain = (db, res, start, end) => {
  db.all(RAIN_SQL, start.valueOf(), end.valueOf(), (err, rows) => {
    if (err) throw err

    const data = prepareData(
      rows.map((row) => ({ y: 0.2794, t: moment(parseInt(row.date)) })),
      start,
      end,
      halfHourly
    )

    res.json({
      datasets: [
        {
          label: 'Regen (mm/h)',
          yAxisID: 'a1',
          data: data,
          backgroundColor: 'rgba(0, 0, 100, 0.8)',
          pointRadius: 0
        }
      ],
      labels: data.map((r) => {
        return r.t
      })
    })
  })
}

export const builder = (db, type) => {
  return (req, res) => {
    const end = moment()
      .startOf('hour')
      .add(1, 'h')
    const start = end.clone().subtract(6, 'h')

    if (type === TYPE_ANEMO) {
      handleAnemo(db, res, start, end)
    } else if (type === TYPE_VANE) {
      handleWindvane(db, res, start, end)
    } else if (type === TYPE_RAIN) {
      handleAnemoRain(db, res, start, end)
    } else {
      throw new Error('unsupported sensor type')
    }
  }
}
