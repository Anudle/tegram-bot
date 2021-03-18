
const { Telegraf } = require('telegraf')
require('dotenv').config();
const axios = require("axios");
const FACT_URL = 'https://uselessfacts.jsph.pl/random.json?language=en'
const INSULT_URL = 'https://insult.mattbas.org/api/insult.json'
const token = process.env.TOKEN;


let bot;
 
if (process.env.NODE_ENV === 'production') {
   bot = new Telegraf(token);
   bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
   bot = new Telegraf(token, { polling: true });
}


bot.on('text', async (ctx) => {
  let name = ctx.update.message.from.first_name 
  const isBot = ctx.update.message.from.is_bot
  let string = ctx.update.message.text.toLowerCase()
  if (name  === 'Brock') {
    if (string.includes(' bet ') || string.includes('betting')) {
      ctx.reply("'Nahhhhh' -Lucas Brandl")
    }
  }
  if (string.includes('roll tide') && !isBot) {
    ctx.reply('Roll Tide')
  }
  if (string.includes('go blue') && !isBot) {
    ctx.reply('Go Blue')
  }
  if (string.includes('sko buffs') && !isBot) {
    ctx.reply('Sko Buffs')
  }
  if (string.includes('csu') && !isBot) {
    ctx.reply('I said it sucks to be a CSU Ram!')
  }
  if (string.includes('fun fact')) {
    try {
      const response = await axios.get(FACT_URL)
      console.log(response)
      if (response.data && response.data.text) { 
        ctx.reply(response.data.text)
      }
    } catch(e){
      ctx.reply("Not today I'm broken")
    }
  }
})

bot.launch()

