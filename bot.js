require('dotenv').config()
const start = process.hrtime()
const { BOT_TOKEN, BOT_PREFIX, SERVER_IP, RCON_PORT, RCON_PASS, ADMIN_IDS } = process.env
const { Client, MessageEmbed, Collection, Intents } = require('discord.js')
const { Rcon } = require('rcon-client')
const { readdir } = require('fs-extra')
const admins = ADMIN_IDS.split(',')

const bot = new Client({
   disableEveryone: true
})

bot.players = 0

bot.rcon = new Rcon({
    host: SERVER_IP, port: RCON_PORT, password: RCON_PASS
})

bot.commands = new Collection();
(async () => {
	  try {
	    const files = await readdir('./commands')
	    const jsfiles = files.filter(f => f.endsWith('js'))
	    jsfiles.forEach((f, i) => {
	      const props = require(`./commands/${f}`)
	      bot.commands.set(props.help.name.toLowerCase(), props)
	    })
	  } catch (e) {
	    return console.log(e)
	  }
	  const diff = (process.hrtime(start)[0] + process.hrtime(start)[1] / 1e9).toFixed(2)
	  console.log(`Loaded ${bot.commands.size} command(s) in ${diff}s.`)
})()

bot.once('ready', async () => {
    console.log(`DISCORD: Logged in as ${bot.user.username}.`)
    setInterval(async () => {
        livePlayerCount(bot)
    }, 5000)
})

bot.on('message', async msg => {
    if (msg.author.id === bot.user.id || msg.author.bot || msg.channel.type !== 'text') return
    if (!msg.content.startsWith(BOT_PREFIX)) return

    const args = msg.content
        .slice(BOT_PREFIX.length)
        .trim()
        .split(' ')
        .slice(1)
    const cmd = msg.content
        .slice(BOT_PREFIX.length)
        .trim()
        .split(' ')[0]
        .toLowerCase()
    const cmdFile = bot.commands.get(cmd)
    if (cmdFile) {
        if (cmdFile.help.admin && !admins.includes(msg.author.id)) return
        return cmdFile.run(bot, msg, args)
    }
    else {
        bot.commands.forEach(c => {
            if (c.help.aliases.includes(cmd)) {
                if (c.help.admin && !admins.includes(msg.author.id)) return
                return c.run(bot, msg, args)
            }
        })
    }
})

bot.on('error', console.error)

async function initDiscord() {
    bot.login(BOT_TOKEN).catch(e => console.log('Login failed:', e.message))
}

bot.cmdFailed = async function(msg) {
    msg.channel.send(`Command failed. Server offline?`)
}

async function initRcon() {
    bot.rcon.on('connect', () => {
        if (bot.rconReconnect) clearInterval(bot.rconReconnect)
        console.log(`RCON: Client initialized.`)
    })
    bot.rcon.on('authenticated', () => {
        console.log(`RCON: Client authenticated.`)
    })
    bot.rcon.on('error', err => {
        console.log('RCON: Socket error.')
    })
    bot.rcon.on('end', () => {
        console.log('RCON: Socket closed. Attempting reconnect.')
        bot.rconReconnect = setInterval(async () => {
            try {
                bot.rcon = new Rcon({
                    host: SERVER_IP, port: RCON_PORT, password: RCON_PASS
                })
                initRcon()
                await bot.rcon.connect()
            } catch (e) {
                console.log('RCON: Reconnect failed. Trying again in 10s.')
            }
        }, 10000)
    })
}

async function livePlayerCount(bot) {
    let players = 0
    try {
        const res = await bot.rcon.send('minecraft:list')
        players = parseInt(res.match(/are (\d+) of/m)[1])
    } catch (e) {}
    finally {
        if (bot.players === players) return
        bot.user.setPresence({
            activity: {
                name: `${players} online player(s)`,
                type: 'WATCHING'
            }
        })
        bot.players = players
    }
}

(async () => {
    initRcon()
    initDiscord()
    await bot.rcon.connect()
})()
