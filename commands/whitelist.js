const {BOT_PREFIX} = process.env

module.exports.run = async (bot, msg, args) => {
    if (!args[0]) return msg.channel.send(`Usage: \`${BOT_PREFIX}command [command]\``)
    try {
        const res = await bot.rcon.send(`whitelist add ${args[0]}`)
        return msg.channel.send(res)
    } catch (e) { bot.cmdFailed(msg) }
}

module.exports.help = {
    name: 'whitelist',
    aliases: [],
    description: 'Whitelist a player.',
    admin: true
}
