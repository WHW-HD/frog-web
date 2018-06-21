class WindAverage {
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

  print() {
    console.log('------')
    this.speicher.forEach((element) => {
      console.log(element)
    })
    console.log('------Average:' + this.average())
  }

  average() {
    const ar = [...this.speicher]
    return this.internalAverage(ar)
  }

  internalAverage(ar) {
    // https://en.wikipedia.org/wiki/Yamartino_method
    let sinAverage = ar.reduce(
      (previous, current) => previous + Math.sin((Math.PI / 180) * current),
      0
    )
    sinAverage = sinAverage / ar.length

    let cosinAverage = ar.reduce(
      (previous, current) => previous + Math.cos((Math.PI / 180) * current),
      0
    )
    cosinAverage = cosinAverage / ar.length

    const epsilon = Math.sqrt(1 - (Math.pow(sinAverage, 2) + Math.pow(cosinAverage, 2)))
    console.log('EPSILON', epsilon)
    const sigma = Math.asin(epsilon) * (1 + (2 / Math.sqrt(3) - 1) * Math.pow(epsilon, 3))

    let avWindir = (Math.atan2(cosinAverage, sinAverage) * 180) / Math.PI + 90
    if (avWindir < 0) avWindir += 360

    return {
      average: avWindir,
      deviation: sigma
    }
  }

  statistics() {
    const result = this.average()
    const variance = result.deviation
    const upper = [...this.speicher].slice((8 * this.maxSize) / 10)

    // use average if not enough data is present
    //const tendency = secondHalf.length > 0 ? this.internalAverage(secondHalf) : average
    const tendency = upper.length > 0 ? this.internalAverage(upper) : result

    const stats = {
      size: this.speicher.length,
      actual: this.speicher[this.speicher.length - 1],
      //speicher: this.speicher,
      //upper: upper,
      average: result.average,
      variance: result.deviation,
      tendency: tendency.average
    }
    //console.log(stats)
    return stats
  }

  windstatistics() {
    const result = this.averageWindDirection()
    const average = result.average
    const variance = result.deviation

    const upper = [...this.speicher].slice((8 * this.maxSize) / 10)
    // use average if not enough data is present
    const tendency = upper.length > 0 ? this.internalWindAverage(upper).average : average
    console.log('WINDAVE', result)
    console.log('WINDCUR', this.internalWindAverage(upper))

    const stats = {
      //size: this.speicher.length,
      actual: this.speicher[this.speicher.length - 1],
      //speicher: this.speicher,
      upper: upper,
      average: average,
      tendency: tendency,
      variance: variance.sigma
    }
    //console.log(stats)
    return stats
  }
}

module.exports = WindAverage
