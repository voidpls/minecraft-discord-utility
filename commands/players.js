module.exports.run = async (bot, msg, args) => {
    try {
        const time = Date.now()
        const res = await bot.rcon.send(`minecraft:list`)
        const playerNum = parseInt(res.match(/are (\d+) of/m)[1])
        const playerMsg = playerNum <= 0 ? 'No players online.' :
            `\`${playerNum}\` player(s) online: \n${res.match(/online: (.+)/m)[1].replace(/(\~|\_|\`|\*)/gm, '\\$1')}`
        return msg.channel.send(playerMsg)
    } catch (e) { bot.cmdFailed(msg) }
}

module.exports.help = {
    name: 'players',
    aliases: ['online', 'list'],
    description: 'Fetch online players.',
    admin: false
}
