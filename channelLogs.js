const { Events, EmbedBuilder, ChannelType } = require('discord.js');
const { Database } = require('st.db');

const logsDB = new Database("./Database/logs.json");

module.exports = {
    name: Events.ClientReady,
    once: false,
    execute(client) {
        // Add helper function for channel type conversion
        function getChannelType(type) {
            const types = {
                [ChannelType.GuildText]: 'Text Channel',
                [ChannelType.GuildVoice]: 'Voice Channel',
                [ChannelType.GuildCategory]: 'Category',
                [ChannelType.GuildAnnouncement]: 'Announcement Channel',
                [ChannelType.GuildStageVoice]: 'Stage Channel',
                [ChannelType.GuildForum]: 'Forum Channel',
                [ChannelType.GuildDirectory]: 'Directory Channel',
                [ChannelType.PublicThread]: 'Public Thread',
                [ChannelType.PrivateThread]: 'Private Thread'
            };
            return types[type] || 'Unknown Channel Type';
        }

        client.on(Events.ChannelDelete, async channel => {
            if (!channel.guild) return;
            
            const logData = logsDB.get(`logs_${channel.guild.id}`);
            if (!logData?.roomLog) return;

            const logChannel = channel.guild.channels.cache.get(logData.roomLog);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('Channel Deleted')
                .setColor('Red')
                .addFields(
                    { name: 'Channel Name', value: channel.name },
                    { name: 'Channel Type', value: getChannelType(channel.type) },
                    { name: 'Category', value: channel.parent?.name || 'None' }
                )
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        });

        client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
            if (!oldChannel.guild) return;

            const logData = logsDB.get(`logs_${oldChannel.guild.id}`);
            if (!logData?.roomLog) return;

            const logChannel = oldChannel.guild.channels.cache.get(logData.roomLog);
            if (!logChannel) return;

            const changes = [];

            if (oldChannel.name !== newChannel.name) {
                changes.push(`**Name Changed:** ${oldChannel.name} ➔ ${newChannel.name}`);
            }

            if (oldChannel.parent?.id !== newChannel.parent?.id) {
                changes.push(`**Category Changed:** ${oldChannel.parent?.name || 'None'} ➔ ${newChannel.parent?.name || 'None'}`);
            }

            if (changes.length > 0) {
                const embed = new EmbedBuilder()
                    .setTitle('Channel Updated')
                    .setColor('Blue')
                    .setDescription(`Channel: <#${newChannel.id}>\n\n${changes.join('\n')}`)
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            }
        });
    }
};
