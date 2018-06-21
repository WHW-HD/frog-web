class MovingAverage {
  constructor(speicher, maxSize) {
    if (typeof maxSize === 'number' && maxSize >= 10) {
      this.maxSize = maxSize
    }
    else {
      throw new Error('maxSize should be at least 10')
    }

    if (speicher instanceof Array) {
      this.speicher = speicher
    }
    else {
      throw new Error('is not an array')
    }
  }

  // Methoden
  add(element) {
    if (typeof element !== 'number') throw new Error('Element of type number expected')
    if (isNaN(element)) {
      console.log('NaN detected, check your data ', new Date())
      return
    }

    this.speicher.push(element)
    if (this.speicher.length > this.maxSize) {
      this.speicher = this.speicher.slice(1, this.maxSize + 1)
    }
    this.statistics()
  }

  average() {
    const ar = [...this.speicher]
    return this.internalAverage(ar)
  }

  internalAverage(ar) {
    const summe = ar.reduce((previous, current) => previous + current, 0)
    const average = summe / ar.length

    const devSumme = ar.reduce((prev, curr) => prev + (curr - average) * (curr - average), 0)
    const variance = devSumme / (ar.length - 1)
    const sigma = Math.sqrt(variance)

    return {
      average: average,
      standardDev: variance,
      sigma: sigma
    }
  }

  statistics() {
    const result = this.average()
    const upper = [...this.speicher].slice((8 * this.maxSize) / 10)

    // use average if not enough data is present
    const tendency = upper.length > 0 ? this.internalAverage(upper) : result

    const stats = {
      //size: this.speicher.length,

      actual: this.speicher[this.speicher.length - 1],
      //speicher: this.speicher,
      upper: upper,
      average: result.average,
      averageDev: result.standardDev,
      averageSigma: result.sigma,
      tendency: tendency.average,
      tendencyDev: tendency.standardDev,
      tendencySigma: tendency.sigma
    }
    //console.log(stats)
    return stats
  }

  linearData() {
    let linear = []
    const start = [...this.speicher]

    for (let i = 0; i < start.length; i++) {
      const element = { x: i, y: start[i] }
      linear.push(element)
    }

    return linear
  }
}

module.exports = MovingAverage
