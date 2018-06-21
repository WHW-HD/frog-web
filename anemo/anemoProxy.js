const mqtt = require('mqtt')

const server = 'mqtt://' + process.env.MQTT_SERVER

const mqttClient = mqtt.connect(server, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD
})

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
