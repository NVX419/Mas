const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "hide-all",
    description: "to hide all channels in a guild",
    run: async (client, message, args) => {
		if (!message.member.permissions.has('MANAGE_CHANNELS')) {
			return message.reply('### You do not have permissions to use the command <a:emoji_1738646905585:1336206712310595672>');
		}

        let c = 0;
        message.guild.channels.cache.forEach(ch => {
            ch.permissionOverwrites.edit(
                message.guild.id, {
                    ViewChannel: false
                }
            );
            c++;
        });

        return message.channel.send({
            embeds: [
                new EmbedBuilder().setDescription(`### Successfully **hide** ${c} channels <a:emoji_1738646935142:1336206836566593627>`)
            ]
        });
    }
}
