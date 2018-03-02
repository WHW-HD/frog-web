import sqliteModule from 'sqlite3'

const sqlite = sqliteModule.verbose()
const db = new sqlite.Database('./db/anemo.db', (err) => {
  if (err) {
    throw err
  }
  console.log('connected to database')
})

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS data (
		id     integer PRIMARY KEY, 
		date   text    NOT NULL, 
		sensor text    NOT NULL, 
		value  real    NOT NULL)`)
})

const storeSensorData = db.prepare('INSERT INTO data (date, sensor, value) values (?, ?, ?)')

module.exports = {
  db,
  storeSensorData
}
