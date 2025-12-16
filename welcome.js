const { Events, ChannelType, EmbedBuilder } = require('discord.js');
const { Database } = require('st.db');

const db = new Database('/Database/System');

module.exports = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        const channelId = await db.get(`${member.guild.id}_welcomeChannel`);
        if (!channelId) return; 

        const channel = await member.guild.channels.fetch(channelId);
        if (!channel || channel.type !== ChannelType.GuildText) return; 

        const hasImage = await db.get(`${member.guild.id}_welcome_image`); 
        const memberAvatar = member.user.displayAvatarURL({ dynamic: true }); 
		const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
        
        const embed = new EmbedBuilder()
            .setColor(randomColor)
            .setThumbnail(memberAvatar) 
            .setDescription(`𝐇𝐞𝐥𝐥𝐨 ${member.user.username}\n\n\n\n𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎: __${member.guild.name}__ <a:ES_hearts1:1255976976938700841>\n\n\n\n𝐇𝐀𝐕𝐄 𝐀 𝐆𝐑𝐄𝐀𝐓 𝐓𝐈𝐌𝐄 𝐖𝐈𝐓𝐇 𝐔𝐒 𝐀𝐍𝐘 𝐓𝐇𝐈𝐍𝐆 𝐘𝐎𝐔 𝐖𝐀𝐍𝐓 𝐂𝐎𝐌𝐄 𝐓𝐎 𝐒𝐔𝐏𝐏𝐎𝐑𝐓\n\n\n\n𝐘𝐎𝐔 𝐀𝐑𝐄 𝐌𝐄𝐌𝐁𝐄𝐑: ${member.guild.memberCount}\n`)
            .setImage(hasImage) 
            .setFooter({
                text: `${member.user.tag} - ${new Date().toLocaleString()}`, 
                iconURL: memberAvatar 
            })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
    },
};
