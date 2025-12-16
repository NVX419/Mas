const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { Database } = require("st.db");
const autoReactDB = new Database("./Database/autoreact.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autoreact')
        .setDescription('إدارة نظام اوتو رياكشن')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setchannel')
                .setDescription('تعيين روم اوتو رياكشن')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('القناة')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('emoji')
                        .setDescription('الإيموجي')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('removechannel')
                .setDescription('إزالة روم من اوتو رياكشن')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('القناة')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('عرض قائمة رومات اوتو رياكشن')),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: '**تحتاج إلى صلاحيات المسؤول لاستخدام هذا الأمر!**',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();

        try {
            if (subcommand === 'setchannel') {
                const channel = interaction.options.getChannel('channel');
                const emoji = interaction.options.getString('emoji');

                
                try {
                    await interaction.channel.send(emoji).then(msg => msg.delete());
                } catch (error) {
                    return interaction.reply({
                        content: '**الرجاء تقديم إيموجي صالح!**',
                        ephemeral: true
                    });
                }

                autoReactDB.set(`autoreact_${interaction.guild.id}_${channel.id}`, emoji);

                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('تم تعيين روم')
                    .setDescription(` تم تعيين ${channel} كقناة اوتو رياكشن بنجاح!\n**الإيموجي:** ${emoji}`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            }
            else if (subcommand === 'removechannel') {
                const channel = interaction.options.getChannel('channel');
                
                const existing = autoReactDB.get(`autoreact_${interaction.guild.id}_${channel.id}`);
                if (!existing) {
                    return interaction.reply({
                        content: '**هذه القناة غير معدة للتفاعلات التلقائية!**',
                        ephemeral: true
                    });
                }

                autoReactDB.delete(`autoreact_${interaction.guild.id}_${channel.id}`);

                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('تم إزالة قناة التفاعل التلقائي')
                    .setDescription(` تم إزالة اوتو رياكشن من ${channel} بنجاح`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            }
            else if (subcommand === 'list') {
                const guildChannels = interaction.guild.channels.cache;
                const autoReactChannels = [];

                for (const [channelId, channel] of guildChannels) {
                    const emoji = autoReactDB.get(`autoreact_${interaction.guild.id}_${channelId}`);
                    if (emoji) {
                        autoReactChannels.push(`${channel} - Emoji: ${emoji}`);
                    }
                }

                if (autoReactChannels.length === 0) {
                    return interaction.reply({
                        content: '**لا توجد قنوات معدة للتفاعلات التلقائية!**',
                        ephemeral: true
                    });
                }

                const embed = new EmbedBuilder()
                    .setColor('Blue')
                    .setTitle('قنوات اوتو رياكشن')
                    .setDescription(autoReactChannels.join('\n'))
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '**حدث خطأ أثناء تنفيذ الأمر!**',
                ephemeral: true
            });
        }
    },
};