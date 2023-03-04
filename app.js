const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const axios = require("axios");
const moment = require("moment-timezone")
const FACT_URL = 'https://uselessfacts.jsph.pl/random.json?language=en'
const INSULT_URL = 'https://insult.mattbas.org/api/insult.json'
const STOCK_URL = 'https://finnhub.io/api/v1/'
const CRYPTO_URL = `https://rest.coinapi.io`
const token = process.env.TOKEN;
const express = require('express')
const bodyParser = require('body-parser');
const { kylesAPI, getGif, getRandomPhoto, getTextOnPhoto} = require('./api')
const { getRandomInt, ucfirst, findString, today } = require('./util');
// const schedule = require('node-schedule');

let bot;

if (process.env.NODE_ENV === 'production') {
  bot = new TelegramBot(token);
  bot.setWebHook(process.env.HEROKU_URL + "/" + bot.token);
} else {
  bot = new TelegramBot(token, { polling: true });
}

const brock_bets = [' bet ', 'betting']
const gif_trigger = ['gme', 'amc', 'stonk', 'to the moon', 'wallstreetbets', 'wsb', 'yolo', 'diamond hand', 'autist', 'roll tide', 'rtr', 'go blue', 'sko buffs', 'denver lynx']
const insult_trigger = ['ohio state', 'the sun', 'auburn', 'lsu']
const insult_search = ['shit', 'sucks', 'chump', 'loser', 'stupid']
const david_compliments = ['Roll tide my dude', 'you make a good point', "God you're so handsome David", 'Auburn is the worst', 'Can ABC just make you in charge of Disney already', 'How do you walk around with such a huge package David?']
const timeZoneWatchers = ['mdt', 'edt', 'cdt', 'pdt', 'cst']
const timeZoneMap = {
  'mdt': 'America/Denver',
  'cdt': 'America/Chicago',
  'edt': 'America/New_York',
  'pdt': 'America/Los_Angeles',
  'cst': 'Asia/Shanghai'
}

bot.on('text', async (ctx) => {
  const chat_id = ctx.chat.id
  const string = ctx.text.toLowerCase()
  const name = ctx.from.first_name.toLowerCase()
  if (timeZoneWatchers.some(value => string.includes(value))) {
    const timeZone = timeZoneWatchers.filter(zone => string.includes(zone))
    const index = string.indexOf(timeZone)
    let newString = string.slice(0, index)
    let hour = newString.match(/\d+/g)[0]
    if (hour && hour < 13 && hour > 0) {
      let pmOrAM = string.includes('am') && !string.includes('pm') ? 'AM' : 'PM'
      let time = `${today()} ${hour}${pmOrAM}`
      const UTC = moment.tz(`${time}`, "YYYY-MM-DD HHa", `${timeZoneMap[timeZone]}`).format();
      const shanghai = moment.utc(`${UTC}`).tz('Asia/Shanghai').format("hh:mm a")
      const chicago = moment.utc(`${UTC}`).tz('America/Chicago').format("hh:mm a")
      const la = moment.utc(`${UTC}`).tz('America/Los_Angeles').format("hh:mm a")
      const ny = moment.utc(`${UTC}`).tz('America/New_York').format("hh:mm a")
      const denver = moment.utc(`${UTC}`).tz('America/Denver').format("hh:mm a")
      bot.sendMessage(chat_id, `Shanghai: ${shanghai} \nNew York: ${ny}\nChicago: ${chicago}\nDenver ${denver}\nLos Angeles: ${la}`)
    }
  }
  // if (name === 'david') {
  //   const randomNumber = getRandomInt(20)
  //   if (randomNumber === 5) {
  //     const index = getRandomInt(6)
  //     bot.sendMessage(chat_id, david_compliments[index])
  //   }
  // }
  if (name  === 'brock') {
    if (brock_bets.some(word => string.includes(word))) {
      bot.sendMessage(chat_id, "'Nahhhhh' -Lucas Brandl")
    }
    const randomNumber = getRandomInt(40)
    // if (randomNumber === 7) {
    //   bot.sendMessage("is that your actual opinion or are you just making a bad faith argument because it’s 'provocative'?")
    // }
  }
  if (insult_trigger.some(word => string.includes(word))) {
    let randomSearch = insult_search[getRandomInt(insult_search.length - 1)]
    let response = await getGif(randomSearch)
    const insult_name = insult_trigger.filter(word => {
      if (string.includes(word)) {
        return word
      }
    })
    if (response.includes('.gif')) {
      bot.sendDocument(chat_id, response);
      if (insult_name[0] !== 'csu') {
        bot.sendMessage(chat_id, `${insult_name[0].toUpperCase()} sucks`)
      }  
    }
  }
  if (gif_trigger.some(word => string.includes(word))) {
    const searchWord = gif_trigger.filter(word => {
      if (string.includes(word)) {
        return word
      }
    })
    if (searchWord.includes('autist')) {
      searchWord.unshift('rain man')
    }
    if (searchWord.includes('sko buffs')) {
      searchWord.unshift('colorado buffs')
    }
    let response = await getGif(searchWord[0])
    if (response.includes('.gif')) {
      bot.sendDocument(chat_id, response);
    }
  }
  if (string.includes('evolve') || string.includes('evolution')) {
    let response = await getGif('pokemon evolve')
    if (response.includes('.gif')) {
      bot.sendDocument(chat_id, response);
    }
  }
  if (string.includes('roll tide')) {
    bot.sendMessage(chat_id, 'Roll Tide')
  }
  if (string.includes('go blue')) {
    bot.sendMessage(chat_id, 'Go Blue')
  }
  if (string.includes('sko buffs')) {
    bot.sendMessage(chat_id, 'Sko Buffs')
  }
  if (string.includes('csu')) {
    bot.sendMessage(chat_id, 'whoever went to CSU around here is better than everyone else. thank you')
  }
  if (string.includes('insult')) {
    let stringArray = string.split(' ')
    let insult_name_index = stringArray.indexOf('insult') + 1
    let insult_name = stringArray[insult_name_index]
    if (insult_name.toLowerCase() === 'asdfasdf') {
      bot.sendMessage(chat_id, "I'm sorry, I can't insult my bot father")
    } else {
      try {
        const response = await axios.get(INSULT_URL)
        let insultArray = response.data.insult.split(' ')
        if (response) {
          insultArray = insultArray.splice(2, insultArray.length)
          insultArray.unshift(`${ucfirst(insult_name)} is`)
          bot.sendMessage(chat_id, insultArray.join(' '))
        }
      } catch(e){
        console.log(e)
        bot.sendMessage(chat_id, "Not today I'm broken")
      }
    }
  }

  if (string.includes('!')){
    let symbol = await findString(string, '!')
    if (symbol) {
      symbol = symbol.toUpperCase()
      try{
        axios.interceptors.request.use(function (config) {
          config.headers['X-CoinAPI-Key'] = 'AA5DA641-E789-435E-8C32-CB033E2C6AF7'
          return config;
        });
        const exchangeURL = `${CRYPTO_URL}/v1/symbols/BINANCEFTS`
        const symbolsList = await axios.get(exchangeURL)
        if (symbolsList.data && symbolsList.data.length) {
          let filtered = symbolsList.data.filter(obj => {
            return obj.asset_id_base_exchange === symbol
          })
          if (filtered.length) {
            let price = filtered[filtered.length - 1].price
            bot.sendMessage(chat_id, `${symbol} last price was $${price}`)  
          }
        }
        } catch(e) {
          console.log(e)
        }
    }
  }

  const trigger = 'bot quote'
  if (string.includes(trigger)) {
  let quote = string.slice(string.indexOf(trigger) + trigger.length).trim();
  let arraySentence = quote.split(' ')
  let author = arraySentence[0]
  arraySentence.shift()
  quote = arraySentence.join(' ')
  if (author === 'this') {
    author = null
  } else if (author === 'me') {
    author = name
  }
  console.log({quote})
  console.log({author})
  try {
  const finalPhoto = await kylesAPI(quote, author)
  console.log(finalPhoto)
    bot.sendPhoto(chat_id, finalPhoto)
	//bot.sendMessage(chat_id, `'${author}' says '${quote}'... the pic thing  is under construction. check back l8r`);
  }catch(e) {
    console.error(e)
  }
  }
  
  if (string.includes('$')) {
    let symbol = await findString(string, '$')
    if (symbol) {
      if (symbol.length > 6) {
        bot.sendMessage(chat_id, `Don't abuse the bot ${ucfirst(name)}`)
        return
      } else {
        symbol = symbol.toUpperCase()
        try {
          const stockURL = `${STOCK_URL}quote?symbol=${symbol}&token=${process.env.STOCK_TOKEN}`
          const response = await axios.get(stockURL)
          if (response.data && response.data.c) {
            bot.sendMessage(chat_id, `${symbol} last price was $${response.data.c}`)
          }
        } catch(e) {
          bot.sendMessage(chat_id, `shits broken: ${e}`)
          console.log(e)
        }
      }
    }
  }
  
  if (string.includes('make zoom poll')){
    bot.sendMessage(chat_id, 'Beep Boop. Okay for what time?', { "reply_markup": {
        "inline_keyboard": [
          [
            {
              text: "Wednesday",
              callback_data: "wed",
            },
            {
              text: "Thursday",
              callback_data: "thursday",
            },
            {
              text: "Friday",
              callback_data: "friday",
            },
            {
              text: "Saturday",
              callback_data: "saturday",
            },
          ],
        ],
      }
    })
  }

  if (string.includes('fun fact')) {
    try {
      const response = await axios.get(FACT_URL)
      if (response.data && response.data.text) { 
        bot.sendMessage(chat_id, response.data.text)
      }
    } catch(e){
      bot.sendMessage(chat_id, "Not today I'm broken")
    }
  }
})

bot.on('callback_query', (callbackQuery) => {
  // console.log('callback query', callbackQuery)
  const msg = callbackQuery.message;
  bot.answerCallbackQuery(callbackQuery.id)
      .then(() => bot.sendMessage(msg.chat.id, "You clicked!"));
});

const app = express();

app.use(bodyParser.json());

app.listen(process.env.PORT);

app.post('/' + bot.token, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});
