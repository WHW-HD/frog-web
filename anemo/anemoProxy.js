const mqtt = require('mqtt')
const server = 'mqtt://test.mosquitto.org'

const mqttClient = mqtt.connect(server)
const connectToAnemo = mqttClient.on('connect', () => {
  mqttClient.subscribe('anemo/#')
})

module.exports = {
  connectToAnemo
}
