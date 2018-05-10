class MovingAverage {
  constructor(speicher, maxSize) {
    if (typeof maxSize === 'number' && maxSize >= 10) {
      this.maxSize = maxSize
    } else {
      throw new Error('maxSize should be at least 10')
    }

    if (speicher instanceof Array) {
      this.speicher = speicher
    } else {
      throw new Error('is not an array')
    }
  }

  // Methoden
  add(element) {
    if (typeof element !== 'number') throw new Error('Element of type number expected')

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
    const summe = ar.reduce((previous, current) => previous + current, 0)
    return summe / ar.length
  }

  //Some deviation data
  varianz(average) {
    let sum = 0
    const ar = [...this.speicher]

    const summe = ar.reduce((prev, curr) => prev + (curr - average) * (curr - average), 0)
    const variance = summe / (ar.length - 1)
    const sigma = Math.sqrt(variance)

    const varianz = {
      standard: variance,
      sigma: sigma
    }
    return varianz
  }

  statistics() {
    const average = this.average()
    const secondHalf = [...this.speicher].slice(this.maxSize / 2)
    const upper = [...this.speicher].slice(8 * this.maxSize / 10)

    // use average if not enough data is present
    //const tendency = secondHalf.length > 0 ? this.internalAverage(secondHalf) : average
    const tendency = upper.length > 0 ? this.internalAverage(upper) : average
    const variance = this.varianz(average)

    const stats = {
      //size: this.speicher.length,
      //actual: this.speicher[this.speicher.length - 1],
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

module.exports = MovingAverage
