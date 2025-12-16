const { Events } = require('discord.js');
const SecuritySchema = require('../../Schemas/SecuritySchema');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        // Channel Delete Protection
        client.on('channelDelete', async (channel) => {
            const config = await SecuritySchema.findOne({ guildId: channel.guild.id });
            if (!config || !config.antiDelete.channels) return;

            const logs = await channel.guild.fetchAuditLogs({ limit: 1, type: 'CHANNEL_DELETE' });
            const log = logs.entries.first();
            if (!log) return;

            const { executor } = log;
            if (config.whitelist.includes(executor.id)) return;

            try {
                const newChannel = await channel.clone();
                await newChannel.setPosition(channel.position);
            } catch (error) {
                console.error('Error restoring channel:', error);
            }
        });

        // Role Delete Protection
        client.on('roleDelete', async (role) => {
            const config = await SecuritySchema.findOne({ guildId: role.guild.id });
            if (!config || !config.antiDelete.roles) return;

            const logs = await role.guild.fetchAuditLogs({ limit: 1, type: 'ROLE_DELETE' });
            const log = logs.entries.first();
            if (!log) return;

            const { executor } = log;
            if (config.whitelist.includes(executor.id)) return;

            try {
                await role.guild.roles.create({
                    name: role.name,
                    color: role.color,
                    hoist: role.hoist,
                    position: role.position,
                    permissions: role.permissions,
                    mentionable: role.mentionable
                });
            } catch (error) {
                console.error('Error restoring role:', error);
            }
        });

        // Anti Links
        client.on('messageCreate', async (message) => {
            if (message.author.bot) return;
            
            const config = await SecuritySchema.findOne({ guildId: message.guild.id });
            if (!config || !config.antiLinks) return;
            
            if (config.whitelist.includes(message.author.id)) return;

            // Updated regex to specifically match http://, https://, and discord.gg links
            const linkRegex = /(https?:\/\/|discord\.gg\/)[^\s]+/gi;
            
            if (linkRegex.test(message.content)) {
                await message.delete().catch(console.error);

                // Find or create warning entry
                let warning = config.linkWarnings.find(w => w.userId === message.author.id);
                if (!warning) {
                    warning = {
                        userId: message.author.id,
                        count: 0,
                        lastWarning: new Date()
                    };
                    config.linkWarnings.push(warning);
                }

                // Reset count if last warning was more than 1 hour ago
                if (Date.now() - warning.lastWarning > 3600000) {
                    warning.count = 0;
                }

                warning.count++;
                warning.lastWarning = new Date();
                await config.save();

                const embed = new EmbedBuilder()
                    .setColor('Yellow')
                    .setDescription(`${message.author}, HTTP/HTTPS/Discord links are not allowed! Warning ${warning.count}/3`)
                    .setTimestamp();

                if (warning.count >= 3) {
                    try {
                        await message.member.timeout(24 * 60 * 60 * 1000, 'Excessive link spam');
                        warning.count = 0;
                        await config.save();

                        embed.setColor('Red')
                            .setDescription(`${message.author} has been timed out for 24 hours due to excessive link spam.`);
                    } catch (error) {
                        console.error('Error handling link spam timeout:', error);
                    }
                }

                message.channel.send({ embeds: [embed] })
                    .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
            }
        });

        // Anti Ban
        client.on('guildBanAdd', async (ban) => {
            const config = await SecuritySchema.findOne({ guildId: ban.guild.id });
            if (!config || !config.antiBan) return;

            const logs = await ban.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_BAN_ADD' });
            const log = logs.entries.first();
            if (!log) return;

            const { executor } = log;
            if (config.whitelist.includes(executor.id)) return;

            try {
                await ban.guild.members.unban(ban.user);
            } catch (error) {
                console.error('Error reversing ban:', error);
            }
        });

        // Anti Kick
        client.on('guildMemberRemove', async (member) => {
            const config = await SecuritySchema.findOne({ guildId: member.guild.id });
            if (!config || !config.antiKick) return;

            const logs = await member.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_KICK' });
            const log = logs.entries.first();
            if (!log || log.createdTimestamp < (Date.now() - 5000)) return;

            const { executor } = log;
            if (config.whitelist.includes(executor.id)) return;

            try {
                await member.guild.members.ban(executor, { reason: 'Anti Kick Protection' });
            } catch (error) {
                console.error('Error handling kick protection:', error);
            }
        });

        // Anti Bot Protection
        client.on('guildMemberAdd', async (member) => {
            if (!member.user.bot) return;

            const config = await SecuritySchema.findOne({ guildId: member.guild.id });
            if (!config || !config.antiBots) return;

            const logs = await member.guild.fetchAuditLogs({
                limit: 1,
                type: 'BOT_ADD'
            });
            const log = logs.entries.first();
            if (!log) return;

            const { executor } = log;
            if (config.whitelist.includes(executor.id)) return;

            try {
                await member.kick('Anti Bot Protection');
                
                // Optional: Punish the user who added the bot
                const executorMember = await member.guild.members.fetch(executor.id);
                if (executorMember) {
                    await executorMember.timeout(60 * 60 * 1000, 'Attempted to add bot while anti-bot was enabled');
                }
            } catch (error) {
                console.error('Error handling anti-bot protection:', error);
            }
        });

        console.log('✅ Security events loaded');
    },
};
