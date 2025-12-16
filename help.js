const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const { prefix } = require('../../config.json');

module.exports = {
    name: 'help',
    description: 'Show bot commands',
    async run(client, message, args) {  
        const mainEmbed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('نظام المساعدة')
            .setDescription('اختر من القائمة أدناه لعرض الأوامر المتاحة')
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() });

        const menu = new StringSelectMenuBuilder()
            .setCustomId('help_menu')
            .setPlaceholder('اختر قائمة الأوامر')
            .addOptions([
                { label: 'اوامر الاونر', description: 'عرض اوامر صاحب السيرفر', value: 'owner_commands', emoji: '👑' },
                { label: 'اوامر الادارة', description: 'عرض اوامر الادارة', value: 'admin_commands', emoji: '⚡' },
                { label: 'الاوامر العامة', description: 'عرض الاوامر العامة', value: 'public_commands', emoji: '🌐' },
                { label: 'اوامر القيف اوي', description: 'عرض اوامر القيف اوي', value: 'giveaway_commands', emoji: '🎉' },
                { label: 'اوامر التكت', description: 'عرض اوامر نظام التكت', value: 'ticket_commands', emoji: '🎫' },
                { label: 'اوامر الدعوات', description: 'عرض اوامر نظام الدعوات', value: 'invites_commands', emoji: '📨' },
                { label: 'اوامر الكلمات السيئة', description: 'عرض اوامر الكلمات السيئة', value: 'bad_commands', emoji: '🚫' },
                { label: 'اوامر الايموجي', description: 'عرض اوامر نظام الايموجي', value: 'emoji_commands', emoji: '😄' },
                { label: 'اوامر الردود التلقائية', description: 'عرض اوامر الردود التلقائية', value: 'reply_commands', emoji: '💬' },
                { label: 'اوامر التفاعلات', description: 'عرض اوامر نظام التفاعلات', value: 'react_commands', emoji: '🎭' },
                { label: 'اوامر الاقتراحات', description: 'عرض اوامر نظام الاقتراحات', value: 'feedback_commands', emoji: '📝' },
                { label: 'اوامر الرومات المؤقتة', description: 'عرض اوامر الرومات المؤقتة', value: 'temp_commands', emoji: '🎙️' },
                { label: 'اوامر الترحيب', description: 'عرض اوامر نظام الترحيب', value: 'welcome_commands', emoji: '👋' },
                { label: 'اوامر الويب هوك', description: 'عرض اوامر نظام الويب هوك', value: 'webhook_commands', emoji: '🔗' },
                { label: 'اوامر العد', description: 'عرض اوامر نظام العد', value: 'count_commands', emoji: '🔢' },
                { label: 'اوامر الحماية', description: 'عرض اوامر نظام الحماية', value: 'security_commands', emoji: '🛡️' },
                { label: 'اوامر السجلات', description: 'عرض اوامر نظام السجلات', value: 'logs_commands', emoji: '📜' },
                { label: 'اوامر القائمة السوداء', description: 'عرض اوامر القائمة السوداء', value: 'black_commands', emoji: '⚫' },
                { label: 'اوامر المستويات', description: 'عرض اوامر نظام المستويات', value: 'level_commands', emoji: '📊' },
                { label: 'اوامر الرتب', description: 'عرض اوامر نظام الرتب', value: 'roles_commands', emoji: '🏷️' }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        const msg = await message.reply({
            embeds: [mainEmbed],
            components: [row]
        });

        const collector = msg.createMessageComponentCollector({
            time: 120000
        });

        collector.on('end', () => {
            row.components[0].setDisabled(true);
            msg.edit({ components: [row] });
        });
    }
};
