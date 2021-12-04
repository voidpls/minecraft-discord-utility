module.exports.run = async (bot, msg, args) => {
    try {
        const time = Date.now()
        const res = await bot.rcon.send(`help`)
        return msg.channel.send(`Server is alive, ping took \`${Date.now() - time}ms\`.`)
    } catch (e) { bot.cmdFailed(msg) }
}

module.exports.help = {
    name: 'ping',
    aliases: [],
    description: 'Pings the server.',
    admin: false
}
