const {BOT_PREFIX} = process.env

function clean(text) {
    return text
        .replace(/§./gm, '')
        .replace(/(\~|\_|\`|\*)/gm, '\\$1')
        .trim()
}

module.exports.run = async (bot, msg, args) => {
    if (!args[0]) return msg.channel.send(`Usage: \`${BOT_PREFIX}command [command]\``)
    try {
        const res = await bot.rcon.send(args.join(' '))
        if (clean(res).length === 0) return msg.channel.send('` `')
        return msg.channel.send(clean(res))
    } catch (e) { bot.cmdFailed(msg) }
}

module.exports.help = {
    name: 'command',
    aliases: ['cmd'],
    description: 'Executes command in console.',
    admin: true
}
