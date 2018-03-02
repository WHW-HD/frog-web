let connectionCounter = 0

const echoHandlerBuilder = (db, connectedClients) => {
  // eslint-disable-next-line no-unused-vars
  return (ws, req) => {
    const id = connectionCounter++
    connectedClients[id] = ws
    console.log('adding client: ' + ws + ' (' + id + ')')
    ws.on('message', (msg) => {
      ws.send(msg)
      db.get(
        "SELECT sensor, value from data where sensor = 'anemo/rain' order by date desc limit 1",
        (err, row) => {
          if (row) {
            ws.send(row.sensor + ':' + row.value)
          }
        }
      )
    })
    // eslint-disable-next-line no-unused-vars
    ws.on('close', (event) => {
      console.log('connection closed: ' + id)
      delete connectedClients[id]
    })
  }
}

export default echoHandlerBuilder
