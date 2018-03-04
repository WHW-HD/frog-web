const mqtt = require('mqtt')

const server = 'mqtt://test.mosquitto.org'

const mqttClient = mqtt.connect(server)

const connectToAnemo = mqttClient.on('connect', () => {
  mqttClient.subscribe('anemo/#', (err, granted) => {
    if (err) {
      return console.log('[subscribe]', err)
    }
    console.log('[subscribe] listening on ', granted)
  })
})

module.exports = {
  connectToAnemo
}
