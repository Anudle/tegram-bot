
const { Telegraf } = require('telegraf')
require('dotenv').config();


const bot = new Telegraf(process.env.TOKEN)

bot.on('text', (ctx) => {
  let name = ctx.update.message.from.first_name 
  const isBot = ctx.update.message.from.is_bot
  let string = ctx.update.message.text.toLowerCase()
  console.log(name)
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
})

bot.launch()

