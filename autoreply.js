const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const AutoReply = require('../../Schemas/AutoReply.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autoreply')
        .setDescription('إدارة الردود التلقائية')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('إضافة رد تلقائي')
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('الكلمة أو العبارة التي ستفعل الرد')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('reply')
                        .setDescription('رسالة الرد')
                        .setRequired(true)
                )
                .addBooleanOption(option =>
                    option.setName('search')
                        .setDescription('تفعيل البحث عن الكلمة/العبارة في جميع الرسائل')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('كيفية إرسال الرد (رد/إرسال)')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Reply', value: 'reply' },
                            { name: 'Send', value: 'send' },
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('إزالة رد تلقائي')
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('الكلمة أو العبارة المراد إزالتها')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('عرض قائمة الردود التلقائية')),

    async execute(interaction) {
        try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({ content: '❌ تحتاج إلى صلاحيات المسؤول لاستخدام هذا الأمر', ephemeral: true });
            }

            const subcommand = interaction.options.getSubcommand();

            if (subcommand === 'add') {
                const messageToSearch = interaction.options.getString('message');
                const replyMessage = interaction.options.getString('reply');
                const searchEnabled = interaction.options.getBoolean('search');
                const replyType = interaction.options.getString('type');

                
                const autoReply = new AutoReply({
                    Guild: interaction.guild.id,
                    Message: messageToSearch,
                    Reply: replyMessage,
                    Search: searchEnabled,
                    Type: replyType,
                });

                await autoReply.save();
                return await interaction.reply(` تم إضافة الرد التلقائي لـ: "${messageToSearch}"`);

            } else if (subcommand === 'remove') {
                const messageToRemove = interaction.options.getString('message');

                
                const result = await AutoReply.findOneAndDelete({
                    Guild: interaction.guild.id,
                    Message: messageToRemove,
                });

                if (result) {
                    return await interaction.reply(` تم إزالة الرد التلقائي لـ: "${messageToRemove}"`);
                } else {
                    return await interaction.reply(` لم يتم العثور على رد تلقائي لـ: "${messageToRemove}"`);
                }
            } else if (subcommand === 'list') {
                const autoReplies = await AutoReply.find({ Guild: interaction.guild.id });
                
                if (autoReplies.length === 0) {
                    return interaction.reply('لا توجد ردود تلقائية مضافة في هذا السيرفر');
                }

                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(' قائمة الردود التلقائية')
                    .setDescription('جميع الردود التلقائية المضافة في السيرفر');

                autoReplies.forEach((reply, index) => {
                    embed.addFields({
                        name: `${index + 1}. ${reply.Message}`,
                        value: `الرد: ${reply.Reply}\nنوع الرد: ${reply.Type === 'reply' ? 'رد' : 'إرسال'}\nالبحث: ${reply.Search ? '✅' : '❌'}`
                    });
                });

                return interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error(error);
            return await interaction.reply({ content: ' حدث خطأ أثناء إدارة الرد التلقائي', ephemeral: true });
        }
    },
};