const TelegramBot = require('node-telegram-bot-api');
const { Telegraf } = require('telegraf')
require('dotenv').config();
const axios = require("axios");
const FACT_URL = 'https://uselessfacts.jsph.pl/random.json?language=en'
const INSULT_URL = 'https://insult.mattbas.org/api/insult.json'
const GIF_URL =  `https://g.tenor.com/v1/search?key=${process.env.GIF_KEY}&locale=en_US`
const token = process.env.TOKEN;
const express = require('express')
const bodyParser = require('body-parser');
const getGif = require('./api')
const getRandomInt = require('./util')


let bot;
 
if (process.env.NODE_ENV === 'production') {
   bot = new TelegramBot(token);
   bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
   bot = new TelegramBot(token, { polling: true });
}

const roll_tide_value = ['roll tide', 'rtr', 'auburn sucks', 'lsu sucks']
const brock_bets = [' bet ', 'betting']
const gif_trigger = ['gme', 'amc', 'stonk', 'to the moon', 'wallstreetbets', 'wsb', 'yolo', 'diamond hand', 'autist', 'roll tide', 'rtr', 'go blue', 'sko buffs', 'denver lynx']
const insult_trigger = ['ohio state', 'csu', 'auburn', 'lsu']
const insult_search = ['turd', 'shit', 'sucks', 'ass', 'chump', 'loser', 'stupid']

bot.on('text', async (ctx) => {
  console.log(ctx)
  const chat_id = ctx.chat.id
  const string = ctx.text.toLocaleLowerCase()
  const isBot = ctx.from.is_bot
  const name = ctx.from.first_name.toLowerCase()

  if (name  === 'brock') {
    if (brock_bets.some(word => string.includes(word))) {
      bot.sendMessage(chat_id, "'Nahhhhh' -Lucas Brandl")
    }
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
        bot.sendMessage(chat_id, `${insult_name[0]} sucks`)
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
    let response = await getGif(searchWord[0])
    if (response.includes('.gif')) {
      bot.sendDocument(chat_id, response);
    }
  }
  if (string.includes('roll tide') && !isBot) {
    bot.sendMessage(chat_id, 'Roll Tide')
  }
  if (string.includes('go blue') && !isBot) {
    bot.sendMessage(chat_id, 'Go Blue')
  }
  if (string.includes('sko buffs') && !isBot) {
    bot.sendMessage(chat_id, 'Sko Buffs')
  }
  if (string.includes('csu') && !isBot) {
    bot.sendMessage(chat_id, 'I said it sucks to be a CSU Ram!')
  }
  if (string.includes('insult')) {
    const ucfirst = (str) => {
      let firstLetter = str.substr(0, 1);
      return firstLetter.toUpperCase() + str.substr(1);
    }
    let stringArray = string.split(' ')
    let insult_name_index = stringArray.indexOf('insult') + 1
    let insult_name = stringArray[insult_name_index]
    if (insult_name.toLowerCase() === 'anu') {
      bot.sendMessage(chat_id, "I'm sorry, I can't insult my bot father")
    } else {
      try {
        const response = await axios.get(INSULT_URL)
        let insultArray = response.data.insult.split(' ')
        if (response) {
          insultArray = insultArray.splice(2, insultArray.length)
          insultArray.unshift(`${ucfirst(insult_name)} is`)
          console.log(insultArray.join(' '))
          bot.sendMessage(chat_id, insultArray.join(' '))
        }
      } catch(e){
        console.log(e)
        bot.sendMessage(chat_id, "Not today I'm broken")
      }
    }
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

const app = express();

app.use(bodyParser.json());

app.listen(process.env.PORT);

app.post('/' + bot.token, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});