const { EmbedBuilder, Events, ChannelType } = require('discord.js');
const { Database } = require('st.db');
const logsDB = new Database("./Database/logs.json");

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        // Helper function to get channel type name
        const getChannelTypeName = (type) => {
            const types = {
                [ChannelType.GuildText]: 'Text Channel',
                [ChannelType.GuildVoice]: 'Voice Channel',
                [ChannelType.GuildCategory]: 'Category',
                [ChannelType.GuildNews]: 'News Channel',
                [ChannelType.GuildStageVoice]: 'Stage Channel',
                [ChannelType.GuildForum]: 'Forum Channel',
                [ChannelType.GuildAnnouncement]: 'Announcement Channel'
            };
            return types[type] || 'Unknown Channel Type';
        };

        client.on(Events.ChannelDelete, async (channel) => {
            const logData = logsDB.get(`logs_${channel.guild.id}`);
            if (!logData?.roomLog) return;

            const logChannel = channel.guild.channels.cache.get(logData.roomLog);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('Channel Deleted')
                .setColor('Red')
                .addFields(
                    { name: 'Channel Name', value: channel.name },
                    { name: 'Channel Type', value: getChannelTypeName(channel.type) },
                    { name: 'Channel ID', value: channel.id }
                )
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        });

        client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
            const logData = logsDB.get(`logs_${newChannel.guild.id}`);
            if (!logData?.roomLog) return;

            const logChannel = newChannel.guild.channels.cache.get(logData.roomLog);
            if (!logChannel) return;

            const changes = [];
            
            if (oldChannel.name !== newChannel.name) {
                changes.push(`Name: ${oldChannel.name} → ${newChannel.name}`);
            }
            
            if (oldChannel.parent?.id !== newChannel.parent?.id) {
                changes.push(`Category: ${oldChannel.parent?.name || 'None'} → ${newChannel.parent?.name || 'None'}`);
            }

            if (changes.length > 0) {
                const embed = new EmbedBuilder()
                    .setTitle('Channel Updated')
                    .setColor('Blue')
                    .addFields(
                        { name: 'Channel', value: newChannel.toString() },
                        { name: 'Changes', value: changes.join('\n') }
                    )
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            }
        });
    }
};
