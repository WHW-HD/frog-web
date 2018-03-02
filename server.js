import * as charts from './lib/chart-handler.js'
import echoHandlerBuilder from './lib/echo-handler.js'

import mqtt from 'mqtt'
import express from 'express'
import mustacheExpress from 'mustache-express'
import sqliteModule from 'sqlite3'
import expressWsBuilder from 'express-ws'
import solarCalc from 'solar-calc'

import moment from 'moment'

const client = mqtt.connect('mqtt://test.mosquitto.org')
const app = express()
moment.locale("de")

const sqlite = sqliteModule.verbose()

const db = new sqlite.Database('./db/anemo.db', (err) => {
	if (err) {
		throw err
 	}
	console.log("connected to database")
})

db.serialize(() => {
	db.run(`CREATE TABLE IF NOT EXISTS data (
		id     integer PRIMARY KEY, 
		date   text    NOT NULL, 
		sensor text    NOT NULL, 
		value  real    NOT NULL)`)
})

app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

const expressWs = expressWsBuilder(app)
const latestMessages = []
const connectedClients = {}

const echoHandler = echoHandlerBuilder(db, connectedClients)

const LAT = 49.4101028
const LON = 8.6821984
const solarCalcProperties = ["sunrise", "sunset", "solarNoon", "nauticalDusk", "nauticalDawn", "civilDawn", "civilDusk", "astronomicalDusk", "astronomicalDawn"]

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

// Broadcast to all open connections
const broadcast = (data) => {
    Object.keys(connectedClients).forEach(function(key) {
        var connection = connectedClients[key];
        if (connection.readyState === 1) {
	    console.log(" sending " + data + " to " + key)
            connection.send(data);
        }
	else {
	debugger
            console.log(" client " + key + " not connected: " + connection.readyState)	    
	}
    });
}

client.on('connect', () =>  {
    client.subscribe('anemo/#')
})

const statement = db.prepare("INSERT INTO data (date, sensor, value) values (?, ?, ?)")
client.on('message', (topic, message) => {
    //latestMessages.push(message.toString())
    broadcast(topic + ":" + message)
    console.log(topic + ": " + message.toString())
    statement.run(moment().valueOf(), topic, parseFloat(message))
})
