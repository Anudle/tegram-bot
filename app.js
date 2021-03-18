const TelegramBot = require('node-telegram-bot-api');
const { Telegraf } = require('telegraf')
require('dotenv').config();
const axios = require("axios");
const FACT_URL = 'https://uselessfacts.jsph.pl/random.json?language=en'
const INSULT_URL = 'https://insult.mattbas.org/api/insult.json'
const token = process.env.TOKEN;
const express = require('express')
const bodyParser = require('body-parser');


let bot;
 
if (process.env.NODE_ENV === 'production') {
   bot = new TelegramBot(token);
   bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
   bot = new TelegramBot(token, { polling: true });
}


bot.on('text', async (ctx) => {
  console.log(ctx)
  const chat_id = ctx.chat.id
  const string = ctx.text.toLocaleLowerCase()
  const isBot = ctx.from.is_bot
  const name = ctx.from.first_name.toLowerCase()

  if (name  === 'brock') {
    if (string.includes(' bet ' || 'betting')) {
      bot.sendMessage(chat_id, "'Nahhhhh' -Lucas Brandl")
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

// bot.launch()

const app = express();

app.use(bodyParser.json());

app.listen(process.env.PORT);

app.post('/' + bot.token, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});