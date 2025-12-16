const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ChannelType } = require("discord.js");

module.exports = {
    name: "unlock-all",
    description: "to lock all channels in a guild",
    run: async (client, message, args) => {
		if (!message.member.permissions.has('MANAGE_CHANNELS')) {
			return message.reply('### You do not have permissions to use the command <a:emoji_1738646905585:1336206712310595672>');
		}
    
      


      
let c = 0;
        message.guild.channels.cache.forEach(ch => {
            ch.permissionOverwrites.edit(
                message.guild.id,{
                    SendMessages : true
                }
            )
             c++;
        });return message.channel.send(
            {
                embeds : [
                    new EmbedBuilder().setDescription(`### SuccessFully **Unlocked** ${c} Channels <a:emoji_1738646935142:1336206836566593627>`)
                ]
            }
        )
  
}
    }