const getRandomInt = function (max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const ucfirst = function (str) {
  let firstLetter = str.substr(0, 1);
  return firstLetter.toUpperCase() + str.substr(1);
}

module.exports = {
  getRandomInt, 
  ucfirst 
}
 