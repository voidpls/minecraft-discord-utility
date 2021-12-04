const { SERVER_IP, SERVER_PORT, IP_API_KEY, BOT_COLOR, HOSTNAME } = process.env
const { MessageEmbed } = require('discord.js')
const axios = require('axios')

module.exports.run = async (bot, msg, args) => {
  try {
    await bot.rcon.send('bukkit:version')
    setTimeout(async () => {
      const time = Date.now()
      let res = await Promise.all([
        axios.get(
          `https://api.ipgeolocation.io/ipgeo?apiKey=${IP_API_KEY}&ip=${SERVER_IP}`
        ),
        bot.rcon.send('minecraft:list'),
        bot.rcon.send('bukkit:version'),
        bot.rcon.send('spigot:tps'),
        // bot.rcon.send('uptime')
        // bot.rcon.send('tabtps:tickinfo'),
        // bot.rcon.send('memory'),
      ])
      res = res.map(r => (typeof r === 'string' ? r.replace(/§./gm, '') : r))
      const geoInfo = res[0].data
        ? `${res[0].data.state_prov}, ${res[0].data.country_code2}`
        : 'N/A'
      const playerNum = `${res[1].match(/are (\d+) of/m)[1]}/${
        res[1].match(/max of (\d+) players/m)[1]
      }`
      const version = res[2]
        .match(/running (.+) version .+ \(MC: ([\d\.]+)\)/m)
        .slice(1)
        .join(' ')
      const tps = res[3].match(/15m: (.+, .+, .+)/m)[1]
      // const uptime = res[4].replace(/\n/gm, '')

      const embed = new MessageEmbed()
        .setColor(BOT_COLOR)
        .setAuthor(
          bot.user.username,
          bot.user.avatarURL({ format: 'png', size: 128 })
        )
        .setDescription(
          `**\`Version\`** \n${version}\n` +
            `**\`Region\`** \n${geoInfo}\n` +
            `**\`Players\`** \n${playerNum}\n` +
            // `**\`Uptime\`** \n${uptime}\n` +
            //     `**\`Memory Used\`** \n${memoryUsed}\n` +
            `**\`Avg TPS (1m, 5m, 15m)\`** \n${tps}`
        )
        .setFooter(`IP: ${HOSTNAME}`)
      return msg.channel.send(embed)
    }, 500)
  } catch (e) {
    bot.cmdFailed(msg)
    console.log(e)
  }
}

module.exports.help = {
  name: 'status',
  aliases: ['info'],
  description: 'Posts detailed server info.',
  admin: false
}
