const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const ms = require('ms');


const activeGiveaways = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('g')
        .setDescription('إدارة الهدايا')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('ابدأ قيف اوي')
                .addStringOption(option =>
                    option.setName('duration')
                        .setDescription('مدة الهدية (e.g., 1h, 1d, 1w)')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('winners')
                        .setDescription('عدد الفائزين')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('prize')
                        .setDescription('الجائزة للفوز')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('emoji')
                        .setDescription('ايموجي مخصص للقيف اوي (افتراضي: 🎉)')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('image')
                        .setDescription('رابط الصورة')
                        .setRequired(false))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('روم القيف اوي')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reroll')
                .setDescription('Reroll a giveaway')
                .addStringOption(option =>
                    option.setName('message_id')
                        .setDescription('معرف الرسالة للهدية')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('end')
                .setDescription('End a giveaway early')
                .addStringOption(option =>
                    option.setName('message_id')
                        .setDescription('معرف الرسالة')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all active giveaways')),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({ content: 'ليس لديك الصلاحيات لاستخدام الامر', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'start': {
                const duration = ms(interaction.options.getString('duration'));
                const winners = interaction.options.getInteger('winners');
                const prize = interaction.options.getString('prize');
                const channel = interaction.options.getChannel('channel') || interaction.channel;
                const customEmoji = interaction.options.getString('emoji') || '🎉';
                const imageUrl = interaction.options.getString('image');

                if (!duration) {
                    return interaction.reply({ content: '❌ Please provide a valid duration!', ephemeral: true });
                }

                try {
                    const embed = new EmbedBuilder()
                        .setTitle(`${customEmoji} GIVEAWAY ${customEmoji}`)
                        .setDescription(`
                            Prize: **${prize}**
                            Winners: **${winners}**
                            Host: ${interaction.user}
                            Ends: <t:${Math.floor((Date.now() + duration) / 1000)}:R>
                            
                            React with ${customEmoji} to enter!`)
                        .setColor('#FF1493')
                        .setTimestamp(Date.now() + duration);

                    if (imageUrl) {
                        embed.setImage(imageUrl);
                    }

                    await interaction.deferReply({ ephemeral: true });

                    const message = await channel.send({ embeds: [embed] });
                    
                    let retries = 3;
                    while (retries > 0) {
                        try {
                            await message.react(customEmoji);
                            break;
                        } catch (err) {
                            retries--;
                            if (retries === 0) throw err;
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }

                    activeGiveaways.set(message.id, {
                        prize,
                        winners,
                        endTime: Date.now() + duration,
                        channelId: channel.id,
                        hostId: interaction.user.id,
                        ended: false,
                        emoji: customEmoji
                    });

                    await interaction.editReply({ content: `بدأ القيف اوي في ${channel}!` });

                    setTimeout(() => endGiveaway(message.id, channel), duration);
                } catch (error) {
                    console.error('Error starting giveaway:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ 
                            content: 'حدث خطأ أثناء بدء المسابقة. تأكد من صحة الرمز التعبيري وامتلاك البوت صلاحية إضافة ردود الفعل.',
                            ephemeral: true 
                        });
                    } else {
                        await interaction.editReply({ 
                            content: 'حدث خطأ أثناء بدء. تأكد من الرمز التعبيري وامتلاك البوت صلاحية إضافة ردود الفعل.'
                        });
                    }
                }
                break;
            }

            case 'reroll': {
                const messageId = interaction.options.getString('message_id');
                const giveaway = activeGiveaways.get(messageId);

                if (!giveaway || !giveaway.ended) {
                    return interaction.reply({ content: 'لم يتم العثور على القيف اوي منتهية بهذا المعرف!', ephemeral: true });
                }

                try {
                    await interaction.deferReply({ ephemeral: true });

                    const channel = interaction.guild.channels.cache.get(giveaway.channelId);
                    const message = await channel.messages.fetch(messageId);
                    const reaction = message.reactions.cache.get(giveaway.emoji);
                    const users = await reaction.users.fetch();
                    const validUsers = users.filter(user => !user.bot);

                    if (validUsers.size === 0) {
                        await interaction.editReply({ content: 'لم يتم العثور على اعضاء لإعادة التسجيل!' });
                        return;
                    }

                    const winner = validUsers.random();
                    channel.send(`🎉 New winner for **${giveaway.prize}**: ${winner}! Congratulations!`);
                    await interaction.editReply({ content: 'تمت إعادة القيف اوي !' });
                } catch (error) {
                    console.error(error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ 
                            content: 'حدث خطأ أثناء إعادة القيف اوي !',
                            ephemeral: true 
                        });
                    } else {
                        await interaction.editReply({ 
                            content: 'حدث خطأ أثناء إعادة القيف اوي !'
                        });
                    }
                }
                break;
            }

            case 'end': {
                const messageId = interaction.options.getString('message_id');
                const giveaway = activeGiveaways.get(messageId);

                if (!giveaway || giveaway.ended) {
                    return interaction.reply({ content: 'لم يتم العثور على أي قيف اوي نشطة بهذا المعرف!', ephemeral: true });
                }

                try {
                    await interaction.deferReply({ ephemeral: true });

                    const channel = interaction.guild.channels.cache.get(giveaway.channelId);
                    await endGiveaway(messageId, channel);
                    await interaction.editReply({ content: 'انتهى القيف اوي !' });
                } catch (error) {
                    console.error(error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ 
                            content: 'حدث خطأ أثناء إنهاء القيف اوي .',
                            ephemeral: true 
                        });
                    } else {
                        await interaction.editReply({ 
                            content: 'حدث خطأ أثناء إنهاء القيف اوي .'
                        });
                    }
                }
                break;
            }

            case 'list': {
                const activeGiveawaysList = [...activeGiveaways.entries()]
                    .filter(([, giveaway]) => !giveaway.ended)
                    .map(([id, giveaway]) => {
                        const channel = interaction.guild.channels.cache.get(giveaway.channelId);
                        return `📍 Prize: **${giveaway.prize}**\n📋 Channel: ${channel}\n⏰ Ends: <t:${Math.floor(giveaway.endTime / 1000)}:R>\n🔗 Message ID: \`${id}\`\n`;
                    });

                const embed = new EmbedBuilder()
                    .setTitle('🎉 Active Giveaways')
                    .setDescription(activeGiveawaysList.length ? activeGiveawaysList.join('\n\n') : 'No active giveaways!')
                    .setColor('#FF1493')
                    .setTimestamp();

                interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }
        }
    }
};

async function endGiveaway(messageId, channel) {
    try {
        const giveaway = activeGiveaways.get(messageId);
        if (!giveaway || giveaway.ended) return;

        const message = await channel.messages.fetch(messageId).catch(() => null);
        if (!message) {
            console.error('لم يتم العثور على الرسالة');
            return;
        }

        const allValidUsers = new Set();
        
        for (const reaction of message.reactions.cache.values()) {
            const users = await reaction.users.fetch();
            users.forEach(user => {
                if (!user.bot) allValidUsers.add(user);
            });
        }

        if (allValidUsers.size === 0) {
            const endEmbed = new EmbedBuilder()
                .setTitle(`${giveaway.emoji} GIVEAWAY ENDED ${giveaway.emoji}`)
                .setDescription(`
                    Prize: **${giveaway.prize}**
                    Winner(s): No valid participants
                    Host: <@${giveaway.hostId}>
                    Status: Ended (No valid entries)`)
                .setColor('#FF1493')
                .setTimestamp();

            await message.edit({ embeds: [endEmbed] });
            await channel.send('⚠️ Giveaway ended with no valid entries!');
            giveaway.ended = true;
            activeGiveaways.set(messageId, giveaway);
            return;
        }

        const validUsersArray = Array.from(allValidUsers);
        const winners = validUsersArray.length > 0 
            ? validUsersArray.sort(() => Math.random() - 0.5).slice(0, Math.min(giveaway.winners, validUsersArray.length))
            : [];
        const winnersText = winners.length > 0 ? winners.join(', ') : 'No valid participants';

        if (winners.length > 0) {
           
            const dmEmbed = new EmbedBuilder()
                .setColor('#FF1493')
                .setTitle('🎉 You Won!')
                .setDescription(`Congratulations! You won a giveaway in ${channel.guild.name}!`)
                .addFields(
                    { name: 'Prize', value: giveaway.prize },
                    { name: 'Server', value: channel.guild.name },
                    { name: 'Channel', value: `<#${channel.id}>` }
                )
                .setTimestamp();

            
            for (const winner of winners) {
                try {
                    await winner.send({ embeds: [dmEmbed] });
                } catch (error) {
                    console.error(`Failed to send DM to ${winner.tag}:`, error);
                }
            }
        }

        const endEmbed = new EmbedBuilder()
            .setTitle('🎉 GIVEAWAY ENDED 🎉')
            .setDescription(`
                Prize: **${giveaway.prize}**
                Winner(s): ${winnersText}
                Host: <@${giveaway.hostId}>`)
            .setColor('#FF1493')
            .setTimestamp();

        await message.edit({ embeds: [endEmbed] });
        // Only send one announcement message
        await channel.send(winners.length > 0 
            ? `🎉 Congratulations ${winnersText}! You won **${giveaway.prize}**!`
            : `⚠️ No winners for **${giveaway.prize}** - No valid entries found!`
        );

        giveaway.ended = true;
        activeGiveaways.set(messageId, giveaway);
    } catch (error) {
        console.error('Error in endGiveaway:', error);
        channel.send('⚠️ An error occurred while ending the giveaway. Please check the message and reactions.').catch(() => {});
    }
}
