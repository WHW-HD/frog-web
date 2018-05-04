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

  statistics() {
    const average = this.average()
    const secondHalf = [...this.speicher].splice(this.maxSize / 2)

    // use average if not enough data is present
    const tendency = secondHalf.length > 0 ? this.internalAverage(secondHalf) : average

    const stats = {
      actual: this.speicher[this.speicher.length - 1],
      //speicher: this.speicher,
      //upper: secondHalf,
      average: average,
      tendency: tendency
    }
    //console.log(stats)
    return stats
  }
}

module.exports = MovingAverage
