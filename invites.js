const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const InvitesSchema = require('../../Schemas/InvitesSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invites')
        .setDescription('إدارة نظام الدعوات في السيرفر')
        .addSubcommand(subcommand =>
            subcommand
                .setName('check')
                .setDescription('التحقق من دعوات العضو')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('العضو المراد التحقق من دعواته')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('إضافة دعوات لعضو')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('العضو المراد إضافة دعوات له')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('عدد الدعوات المراد إضافتها')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel')
                .setDescription('تعيين قناة سجلات الدعوات')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('القناة المخصصة لسجلات الدعوات')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove-channel')
                .setDescription('إزالة قناة سجلات الدعوات'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset-all')
                .setDescription('إعادة تعيين جميع دعوات السيرفر'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset-user')
                .setDescription('إعادة تعيين دعوات العضو')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('العضو المراد إعادة تعيين دعواته')
                        .setRequired(true))),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({ content: 'تحتاج إلى صلاحية إدارة السيرفر لاستخدام هذا الأمر!', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'check': {
                const user = interaction.options.getUser('user');
                const inviteData = await InvitesSchema.findOne({ 
                    guildId: interaction.guild.id,
                    userId: user.id 
                }) || { invites: { total: 0, joins: 0, left: 0, fake: 0 } };

                const embed = new EmbedBuilder()
                    .setColor('Blue')
                    .setTitle(`دعوات ${user.tag}`)
                    .addFields(
                        { name: 'إجمالي الدعوات', value: `${inviteData.invites.total}`, inline: true },
                        { name: 'الانضمامات', value: `${inviteData.invites.joins}`, inline: true },
                        { name: 'المغادرات', value: `${inviteData.invites.left}`, inline: true },
                        { name: 'الدعوات الوهمية', value: `${inviteData.invites.fake}`, inline: true }
                    );

                return interaction.reply({ embeds: [embed] });
            }

            case 'add': {
                const user = interaction.options.getUser('user');
                const amount = interaction.options.getInteger('amount');

                await InvitesSchema.findOneAndUpdate(
                    { guildId: interaction.guild.id, userId: user.id },
                    { 
                        $inc: { 
                            'invites.total': amount,
                            'invites.joins': amount
                        }
                    },
                    { upsert: true }
                );

                return interaction.reply(`تمت إضافة ${amount} دعوة لـ ${user.tag}`);
            }

            case 'channel': {
                const channel = interaction.options.getChannel('channel');
                
                await InvitesSchema.findOneAndUpdate(
                    { guildId: interaction.guild.id },
                    { inviteChannel: channel.id },
                    { upsert: true }
                );

                return interaction.reply(`تم تعيين قناة سجلات الدعوات إلى ${channel}`);
            }

            case 'remove-channel': {
                await InvitesSchema.updateMany(
                    { guildId: interaction.guild.id },
                    { inviteChannel: null }
                );

                return interaction.reply('تم إزالة قناة سجلات الدعوات');
            }

            case 'reset-all': {
                await InvitesSchema.updateMany(
                    { guildId: interaction.guild.id },
                    { 
                        invites: {
                            total: 0,
                            joins: 0,
                            left: 0,
                            fake: 0
                        }
                    }
                );

                return interaction.reply('تم إعادة تعيين جميع دعوات السيرفر');
            }

            case 'reset-user': {
                const user = interaction.options.getUser('user');
                
                await InvitesSchema.findOneAndUpdate(
                    { guildId: interaction.guild.id, userId: user.id },
                    { 
                        invites: {
                            total: 0,
                            joins: 0,
                            left: 0,
                            fake: 0
                        }
                    }
                );

                return interaction.reply(`تم إعادة تعيين دعوات ${user.tag}`);
            }
        }
    },
};
