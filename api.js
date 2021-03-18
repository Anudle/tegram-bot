const GIF_URL =  `https://g.tenor.com/v1/search?key=${process.env.GIF_KEY}`

require('dotenv').config();
const axios = require("axios");
const getRandomInt = require('./util')

const getGif = async (searchTerm) => {
  console.log(`url = ${GIF_URL}&q=${searchTerm}`)
  let gif
  try {
    const response = await axios.get(`${GIF_URL}&q=${searchTerm}`)
    if (response.data.results) {
      const randomInt = getRandomInt(response.data.results.length)
      gif = response.data.results[randomInt].url
    }
  } catch(e){
    console.log(e)
    bot.sendMessage(chat_id, "Not today I'm broken")
  }
  return gif
}

module.exports = getGif