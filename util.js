const getRandomInt = function (max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const ucfirst = function (str) {
  let firstLetter = str.substr(0, 1);
  return firstLetter.toUpperCase() + str.substr(1);
}

const findString = (string, target) => {
  const stringArray = string.split('')
  let indexOfTarget = stringArray.findIndex(el => el === target)
  let lengthOfSymbol = stringArray.length - 1
  return new Promise(function (resolve, reject) {
    if (isNaN(stringArray[indexOfTarget + 1])) {
      for (let i = indexOfTarget; i < stringArray.length; i++) {
        if (stringArray[i] === ' ') {
          lengthOfSymbol = i - indexOfTarget - 1
          break
        }
      }
      let symbol = stringArray.splice(indexOfTarget + 1, lengthOfSymbol).join('')
      if (symbol) {
        resolve(symbol)
      } else {
        reject('ERROR')
      }
    } else {
      reject(null)
    }
  })
}

const today = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  const yyyy = today.getFullYear();
  return `${yyyy}-${mm}-${dd}`
}

module.exports = {
  getRandomInt, 
  ucfirst,
  findString,
  today
}
 