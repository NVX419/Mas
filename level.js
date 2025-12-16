const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const Level = require('../../Schemas/LevelSchema');
const { Database } = require('st.db');
const levelDB = new Database("./Database/levels.json");

const DEFAULT_LEVEL_REQUIREMENTS = {
    1: 100,     
    2: 250,     
    3: 500,
    4: 800,
    5: 1200,    
    6: 1700,
    7: 2300,
    8: 3000,
    9: 3800,
    10: 4700,   
    11: 5700,
    12: 6800,
    13: 8000,
    14: 9300,
    15: 10700,  
    16: 12200,
    17: 13800,
    18: 15500,
    19: 17300,
    20: 19200,  
    21: 21200,
    22: 23300,
    23: 25500,
    24: 27800,
    25: 30200,  
    26: 32700,
    27: 35300,
    28: 38000,
    29: 40800,
    30: 43700  
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('أوامر نظام المستويات')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('إضافة مستويات لعضو')
                .addUserOption(option => option.setName('user').setDescription('اختر العضو').setRequired(true))
                .addStringOption(option => 
                    option.setName('type')
                        .setDescription('نوع المستوى')
                        .setRequired(true)
                        .addChoices(
                            { name: 'كتابي', value: 'text' },
                            { name: 'صوتي', value: 'voice' }
                        ))
                .addIntegerOption(option => option.setName('amount').setDescription('عدد المستويات').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('إزالة مستويات من عضو')
                .addUserOption(option => option.setName('user').setDescription('اختر العضو').setRequired(true))
                .addStringOption(option => 
                    option.setName('type')
                        .setDescription('نوع المستوى')
                        .setRequired(true)
                        .addChoices(
                            { name: 'كتابي', value: 'text' },
                            { name: 'صوتي', value: 'voice' }
                        ))
                .addIntegerOption(option => option.setName('amount').setDescription('عدد المستويات').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('إعادة تعيين مستويات العضو')
                .addUserOption(option => option.setName('user').setDescription('اختر العضو').setRequired(true))
                .addStringOption(option => 
                    option.setName('type')
                        .setDescription('نوع المستوى')
                        .setRequired(true)
                        .addChoices(
                            { name: 'كتابي', value: 'text' },
                            { name: 'صوتي', value: 'voice' },
                            { name: 'الكل', value: 'all' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel')
                .setDescription('تعيين روم المستويات')
                .addChannelOption(option => option.setName('channel').setDescription('اختر القناة').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('تعيين متطلبات الرسائل للمستويات')
                .addIntegerOption(option => 
                    option.setName('level')
                        .setDescription('المستوى لتعيين المتطلبات له (1-30)')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(30))
                .addIntegerOption(option => 
                    option.setName('messages')
                        .setDescription('عدد الرسائل المطلوبة')
                        .setRequired(true)
                        .setMinValue(1)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('requirements')
                .setDescription('عرض جميع متطلبات المستويات')),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild) && interaction.options.getSubcommand() !== 'profile') {
            return interaction.reply({ content: '❌ تحتاج إلى صلاحية إدارة السيرفر لاستخدام هذا الأمر!', ephemeral: true });
        }

        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'add': {
                const user = interaction.options.getUser('user');
                const type = interaction.options.getString('type');
                const amount = interaction.options.getInteger('amount');

                let userData = await Level.findOne({ guildId: interaction.guild.id, userId: user.id });
                if (!userData) {
                    userData = new Level({ guildId: interaction.guild.id, userId: user.id });
                }

                if (type === 'text') {
                    userData.textLevel += amount;
                } else {
                    userData.voiceLevel += amount;
                }

                await userData.save();

                interaction.reply({ content: ` تمت إضافة ${amount} مستوى ${type === 'text' ? 'كتابي' : 'صوتي'} إلى ${user.tag}`, ephemeral: true });
                break;
            }

            case 'remove': {
                const user = interaction.options.getUser('user');
                const type = interaction.options.getString('type');
                const amount = interaction.options.getInteger('amount');

                let userData = await Level.findOne({ guildId: interaction.guild.id, userId: user.id });
                if (!userData) {
                    return interaction.reply({ content: '❌ لا يوجد بيانات مستوى لهذا العضو!', ephemeral: true });
                }

                if (type === 'text') {
                    userData.textLevel = Math.max(0, userData.textLevel - amount);
                } else {
                    userData.voiceLevel = Math.max(0, userData.voiceLevel - amount);
                }

                await userData.save();

                interaction.reply({ content: ` تمت إزالة ${amount} مستوى ${type === 'text' ? 'كتابي' : 'صوتي'} من ${user.tag}`, ephemeral: true });
                break;
            }

            case 'reset': {
                const user = interaction.options.getUser('user');
                const type = interaction.options.getString('type');

                let userData = await Level.findOne({ guildId: interaction.guild.id, userId: user.id });
                if (!userData) {
                    return interaction.reply({ content: '❌ لا يوجد بيانات مستوى لهذا العضو!', ephemeral: true });
                }

                if (type === 'all') {
                    userData.textLevel = 0;
                    userData.textXP = 0;
                    userData.voiceLevel = 0;
                    userData.voiceXP = 0;
                } else if (type === 'text') {
                    userData.textLevel = 0;
                    userData.textXP = 0;
                } else {
                    userData.voiceLevel = 0;
                    userData.voiceXP = 0;
                }

                await userData.save();

                interaction.reply({ content: ` تم إعادة تعيين مستويات ${type === 'all' ? 'جميع' : type === 'text' ? 'الكتابة' : 'الصوت'} للعضو ${user.tag}`, ephemeral: true });
                break;
            }

            case 'channel': {
                const channel = interaction.options.getChannel('channel');
                levelDB.set(`levelchannel_${interaction.guild.id}`, channel.id);
                interaction.reply({ content: ` تم تعيين قناة المستويات إلى ${channel}`, ephemeral: true });
                break;
            }

            case 'setup': {
                const level = interaction.options.getInteger('level');
                const messages = interaction.options.getInteger('messages');

                levelDB.set(`level_req_${interaction.guild.id}_${level}`, messages);

                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('تم تعيين متطلبات المستوى')
                    .setDescription(`المستوى ${level} يتطلب الآن ${messages} رسالة`)
                    .addFields(
                        { name: 'المستوى', value: level.toString(), inline: true },
                        { name: 'الرسائل المطلوبة', value: messages.toString(), inline: true },
                        { name: 'المتطلب الافتراضي', value: DEFAULT_LEVEL_REQUIREMENTS[level].toString(), inline: true }
                    )
                    .setFooter({ text: 'استخدم /level requirements لعرض جميع المستويات' });

                interaction.reply({ embeds: [embed] });
                break;
            }

            case 'requirements': {
                const fields = [];
                for (let i = 1; i <= 30; i += 5) {
                    const levelRange = [];
                    for (let j = i; j < i + 5 && j <= 30; j++) {
                        const customReq = levelDB.get(`level_req_${interaction.guild.id}_${j}`);
                        levelRange.push(`المستوى ${j}: ${customReq || DEFAULT_LEVEL_REQUIREMENTS[j]} رسالة${customReq ? ' (مخصص)' : ''}`);
                    }
                    fields.push({ name: `المستويات ${i}-${Math.min(i+4, 30)}`, value: levelRange.join('\n'), inline: false });
                }

                const embed = new EmbedBuilder()
                    .setColor('Blue')
                    .setTitle('متطلبات المستويات')
                    .setDescription('هذه هي متطلبات الرسائل لكل مستوى:')
                    .addFields(fields)
                    .setTimestamp();

                interaction.reply({ embeds: [embed] });
                break;
            }
        }
    },
};
