const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "unban-all",
    description: "to unban all user from a server",
run: async (client, message, args) => {
		if (!message.member.permissions.has('BAN_MEMBERS')) {
			return message.reply('### You do not have permissions to use the command <a:emoji_1738646905585:1336206712310595672>');
		}
      try {
        let banned = 0;
        message.guild.bans.fetch().then((bans) => {
            if (bans.size == 0) {
                const embed = new EmbedBuilder()
                  .setDescription(`### There are no banned users <a:emoji_1738646905585:1336206712310595672>`)
                  .setFooter({text: "Requested by "+ message.author.username, iconURL: message.author.displayAvatarURL()})
                  .setColor("#2f3136");
      message.reply({embeds: [embed]}
              );                
            } else {
      bans.forEach((ban) => {
                message.guild.members.unban(ban.user.id); 
        banned++;
        });
                
    const sai = new EmbedBuilder()
                  .setDescription(`### Unbaning ${banned} members <a:emoji_1738646935142:1336206836566593627>`)
                  .setColor("#2f3136");
        message.reply({embeds: [sai]});
            
            }
      });
    }catch(err){
    message.reply({embeds: [new EmbedBuilder().setColor("Red").setDescription(`${err}`)]});
}
    }
}