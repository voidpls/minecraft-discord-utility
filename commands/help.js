const { BOT_PREFIX, BOT_COLOR, BOT_OWNER } = process.env
const { MessageEmbed } = require('discord.js')

module.exports.run = async (bot, msg, args) => {
    const cmds = bot.commands.sort(c => c.help.name)
        .map(c => c.help)
    const admin = cmds.filter(c => c.admin)
        .map(c => `**\`${c.name}\`** ${c.description}`)
    const user = cmds.filter(c => !c.admin)
        .map(c => `**\`${c.name}\`** ${c.description}`)

    const owner = await bot.users.fetch(BOT_OWNER)
    const ownerAv = owner.avatarURL({format: 'png', size: 128, dynamic: true})
    const embed = new MessageEmbed()
        .setAuthor(bot.user.username, bot.user.avatarURL({format: 'png', size: 256}))
        .setColor(BOT_COLOR)
        .addField('Commands', user.join('\n'))
        .addField('Admin Commands', admin.join('\n'))
        .setFooter(`Made by ${owner.username}#${owner.discriminator}`, ownerAv)
    msg.channel.send(embed)
}

module.exports.help = {
    name: 'help',
    aliases: [],
    description: 'Sends this message.',
    admin: false
}
