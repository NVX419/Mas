const { EmbedBuilder, Events } = require('discord.js');
const { Database } = require('st.db');
const logsDB = new Database("./Database/logs.json");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        // Message Delete Log
        client.on(Events.MessageDelete, async (message) => {
            try {
                if (!message.guild) return;

                const logData = logsDB.get(`logs_${message.guild.id}`);
                if (!logData?.messageLog) return;

                const logChannel = message.guild.channels.cache.get(logData.messageLog);
                if (!logChannel) return;

                let content = message.content || "No content";
                let author = message.author ? `${message.author} (${message.author.id})` : "Unknown User";
                let channel = message.channel ? `${message.channel} (${message.channel.id})` : "Unknown Channel";
                let isBot = message.author?.bot ? "Yes" : "No";

                // Handle attachments
                let attachments = [];
                if (message.attachments && message.attachments.size > 0) {
                    attachments = Array.from(message.attachments.values()).map(a => a.url);
                }

                const embed = new EmbedBuilder()
                    .setTitle('Message Deleted')
                    .setColor('Red')
                    .addFields(
                        { name: 'Author', value: `${author}`, inline: true },
                        { name: 'Channel', value: `${channel}`, inline: true },
                        { name: 'Bot', value: isBot, inline: true },
                        { name: 'Content', value: content.length > 1024 ? content.slice(0, 1021) + '...' : content }
                    )
                    .setTimestamp();

                if (attachments.length > 0) {
                    embed.addFields({ 
                        name: 'Attachments', 
                        value: attachments.join('\n').slice(0, 1024) 
                    });
                }

                await logChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error('Error in message delete log:', error);
            }
        });

        // Message Edit Log
        client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
            try {
                if (!oldMessage.guild) return;
                if (oldMessage.content === newMessage.content) return;
                
                const logData = logsDB.get(`logs_${oldMessage.guild.id}`);
                if (!logData?.messageLog) return;

                const logChannel = oldMessage.guild.channels.cache.get(logData.messageLog);
                if (!logChannel) return;

                let author = oldMessage.author ? `${oldMessage.author.tag} (${oldMessage.author.id})` : "Unknown User";
                let isBot = oldMessage.author?.bot ? "Yes" : "No";

                const embed = new EmbedBuilder()
                    .setTitle('Message Edited')
                    .setColor('Yellow')
                    .addFields(
                        { name: 'Author', value: author, inline: true },
                        { name: 'Channel', value: `${oldMessage.channel}`, inline: true },
                        { name: 'Bot', value: isBot, inline: true },
                        { name: 'Before', value: oldMessage.content || "No content" },
                        { name: 'After', value: newMessage.content || "No content" }
                    )
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error('Error in message edit log:', error);
            }
        });

        // Member Join/Leave Log
        client.on(Events.GuildMemberAdd, async (member) => {
            const logData = logsDB.get(`logs_${member.guild.id}`);
            if (!logData?.memberLog) return;

            const logChannel = member.guild.channels.cache.get(logData.memberLog);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('Member Joined')
                .setColor('Green')
                .setDescription(`${member.user.tag} joined the server`)
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        });

        client.on(Events.GuildMemberRemove, async (member) => {
            const logData = logsDB.get(`logs_${member.guild.id}`);
            if (!logData?.memberLog) return;

            const logChannel = member.guild.channels.cache.get(logData.memberLog);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('Member Left')
                .setColor('Red')
                .setDescription(`${member.user.tag} left the server`)
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        });

        // Nickname Change Log
        client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
            if (oldMember.nickname === newMember.nickname) return;
            
            const logData = logsDB.get(`logs_${oldMember.guild.id}`);
            if (!logData?.nicknameLog) return;

            const logChannel = oldMember.guild.channels.cache.get(logData.nicknameLog);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('Nickname Changed')
                .setColor('Blue')
                .setDescription(`${oldMember.user.tag}'s nickname was changed\n**Before:** ${oldMember.nickname || 'None'}\n**After:** ${newMember.nickname || 'None'}`)
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        });

        // Voice State Update Log
        client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
            const logData = logsDB.get(`logs_${oldState.guild.id}`);
            if (!logData?.voiceLog) return;

            const logChannel = oldState.guild.channels.cache.get(logData.voiceLog);
            if (!logChannel) return;

            let embed = new EmbedBuilder().setTimestamp();

            if (!oldState.channel && newState.channel) {
                embed.setTitle('Member Joined Voice')
                    .setColor('Green')
                    .setDescription(`${newState.member.user.tag} joined ${newState.channel.name}`);
            } else if (oldState.channel && !newState.channel) {
                embed.setTitle('Member Left Voice')
                    .setColor('Red')
                    .setDescription(`${oldState.member.user.tag} left ${oldState.channel.name}`);
            } else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
                embed.setTitle('Member Moved Voice')
                    .setColor('Yellow')
                    .setDescription(`${oldState.member.user.tag} moved from ${oldState.channel.name} to ${newState.channel.name}`);
            } else {
                return;
            }

            await logChannel.send({ embeds: [embed] });
        });

        // Invite Create Log
        client.on(Events.InviteCreate, async (invite) => {
            const logData = logsDB.get(`logs_${invite.guild.id}`);
            if (!logData?.inviteLog) return;

            const logChannel = invite.guild.channels.cache.get(logData.inviteLog);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('Invite Created')
                .setColor('Green')
                .setDescription(`**Created By:** ${invite.inviter}\n**Channel:** ${invite.channel}\n**Code:** ${invite.code}\n**Max Uses:** ${invite.maxUses || 'Unlimited'}\n**Expires:** ${invite.maxAge ? `<t:${Math.floor((Date.now() + invite.maxAge * 1000) / 1000)}:R>` : 'Never'}`)
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        });
    },
};
