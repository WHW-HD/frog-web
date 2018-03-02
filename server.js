import * as charts from './lib/chart-handler.js'
import echoHandlerBuilder from './lib/echo-handler.js'

import express from 'express'
import mustacheExpress from 'mustache-express'
import expressWsBuilder from 'express-ws'
import moment from 'moment'
import solarCalc from 'solar-calc'

import { db, storeSensorData } from './db/db'
const anemoProxy = require('./anemo/anemoProxy')

const app = express()
moment.locale('de')
app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', __dirname + '/views')

const expressWs = expressWsBuilder(app)
const latestMessages = []
const connectedClients = {}
const echoHandler = echoHandlerBuilder(db, connectedClients)

const LAT = 49.4101028
const LON = 8.6821984
const solarCalcProperties = [
  'sunrise',
  'sunset',
  'solarNoon',
  'nauticalDusk',
  'nauticalDawn',
  'civilDawn',
  'civilDusk',
  'astronomicalDusk',
  'astronomicalDawn'
]

app.get('/', (req, res) => {
  const sc = new solarCalc(new Date(), LAT, LON) 
  const data = {}
  for (let prop of solarCalcProperties) {
    const date = moment(sc[prop])
    data[prop] = date.format("DD.MM, HH:mm")
    data[prop+"_diff"] = date.fromNow()
  }
  data["date"] = moment().format("DD. MMM YYYY")
  res.render('index', data ) 
})
app.get('/chartdata/anemo', charts.builder(db, charts.TYPE_ANEMO))
app.get('/chartdata/vane', charts.builder(db, charts.TYPE_VANE))
app.get('/chartdata/rain', charts.builder(db, charts.TYPE_RAIN))

app.ws('/echo', echoHandler)
app.use('/static', express.static('dist'))

app.listen(3000, () => console.log('Example app listening on port 3000!'))

// MQTT part
const whwsvhAnemo = anemoProxy.connectToAnemo

const broadcast = (data) => {
  // Broadcast to all open connections
  Object.keys(connectedClients).forEach(function(key) {
    const connection = connectedClients[key]
    if (connection.readyState === 1) {
      console.log(`[broadcast] sending  ${data} to ${key}`)
      connection.send(data)
    } else {
      console.log(`[broadcast] client ${key} not connected  ${connection.readyState}`)
    }
  })
}

whwsvhAnemo.on('message', (topic, message) => {
  //latestMessages.push(message.toString())
  broadcast(topic + ':' + message)
  //console.log('Dies' + topic + ': ' + message.toString())
  storeSensorData.run(moment().valueOf(), topic, parseFloat(message))
})
