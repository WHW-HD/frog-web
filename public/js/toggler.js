// see index.mustache
//
const sunset = document.querySelector('#sunset')
const forecast = document.querySelector('#vorhersage')
const statics = document.querySelector('#statistics')

const pressed = []
const secretCode = ['sunset', 'forecast', 'statistics']
const maxLength = secretCode.reduce((len, elem) => (elem.length > len ? elem.length : len), 0)

window.addEventListener('keyup', (e) => {
  pressed.push(e.key)
  pressed.splice(-maxLength - 1, pressed.length - maxLength)
  const index = secretCode.findIndex((elem) => pressed.join('').includes(elem))

  switch (index) {
    case 0:
      sunset.classList.toggle('hidediv')
      break
    case 1:
      forecast.classList.toggle('hidediv')
      break
    case 2:
      statistics.classList.toggle('hidediv')
      break
    default:
      break
  }
  console.log(pressed)
})
