const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const Level = require('../../Schemas/LevelSchema');
const { Database } = require('st.db');
const levelDB = new Database("./Database/levels.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('أوامر الملف الشخصي')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('بروفايل المستوى')
                .addUserOption(option => option.setName('user').setDescription('اختر المستخدم')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('background')
                .setDescription('اضافة خلفية مخصصة للملف')
                .addStringOption(option => 
                    option.setName('url')
                        .setDescription('رابط صورة الخلفية')
                        .setRequired(true))),

    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'view': {
                const user = interaction.options.getUser('user') || interaction.user;
                const member = await interaction.guild.members.fetch(user.id);
                const userData = await Level.findOne({ guildId: interaction.guild.id, userId: user.id }) || 
                    new Level({ guildId: interaction.guild.id, userId: user.id });

                const canvas = createCanvas(800, 400);
                const ctx = canvas.getContext('2d');

                
                let banner;
                try {
                    const customBg = levelDB.get(`profile_bg_${interaction.guild.id}_${user.id}`);
                    if (customBg) {
                        banner = await loadImage(customBg);
                    } else {
                        const fetchedUser = await user.fetch();
                        banner = await loadImage(fetchedUser.bannerURL({ extension: 'png', size: 2048 }) || 
                            member.displayAvatarURL({ extension: 'png', size: 1024 }));
                    }
                } catch (error) {
                    banner = await loadImage(member.displayAvatarURL({ extension: 'png', size: 1024 }));
                }

                
                ctx.filter = 'blur(8px)';
                ctx.drawImage(banner, -20, -20, canvas.width + 40, canvas.height + 40);
                
               
                ctx.filter = 'none';
                ctx.fillStyle = 'rgba(47, 49, 54, 0.7)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                
                const flags = member.user.flags?.toArray() || [];
                const badgeSize = 40;
                const badgeSpacing = 10;
                const badgeStartX = canvas.width - 60;
                const badgeY = 20;
                let currentX = badgeStartX;

                
                for (const flag of flags.reverse()) {
                    let badgeUrl;
                    switch (flag) {
                        case 'Staff': badgeUrl = 'https://discord.com/assets/48d5bdcffe9e7848067c2e187f1ef951.svg'; break;
                        case 'Partner': badgeUrl = 'https://discord.com/assets/34306011e46e87f8ef25f3415d3b99ca.svg'; break;
                        case 'CertifiedModerator': badgeUrl = 'https://discord.com/assets/c981e58b5ea4b7fedd3a643cf0c60564.svg'; break;
                        case 'Hypesquad': badgeUrl = 'https://discord.com/assets/e666a84a7a5ea2abbbfa73adf22e627e.svg'; break;
                        case 'HypeSquadOnlineHouse1': badgeUrl = 'https://discord.com/assets/64ae1208b6aefc0a0c3681e6be36f0ff.svg'; break;
                        case 'HypeSquadOnlineHouse2': badgeUrl = 'https://discord.com/assets/48cf0556d93901c8cb16317be2436523.svg'; break;
                        case 'HypeSquadOnlineHouse3': badgeUrl = 'https://discord.com/assets/9fdc63ef8a3cc1617c7586286c34e4f1.svg'; break;
                        case 'BugHunterLevel1': badgeUrl = 'https://discord.com/assets/8353d89b529e13365c415ef73c730576.svg'; break;
                        case 'BugHunterLevel2': badgeUrl = 'https://discord.com/assets/f6d8b784cd7196d5f3db6f7035231e8b.svg'; break;
                        case 'ActiveDeveloper': badgeUrl = 'https://discord.com/assets/26c7a60fb1654315e0be26107bd47470.svg'; break;
                        case 'VerifiedDeveloper': badgeUrl = 'https://discord.com/assets/4441e07fe0f46b3cb41b79366236fca8.svg'; break;
                    }
                    if (badgeUrl) {
                        try {
                            const badge = await loadImage(badgeUrl);
                            ctx.drawImage(badge, currentX, badgeY, badgeSize, badgeSize);
                            currentX -= (badgeSize + badgeSpacing);
                        } catch (error) {
                            console.error(`Failed to load badge: ${flag}`);
                        }
                    }
                }

            
                const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));
                ctx.save();
                ctx.beginPath();
                ctx.arc(125, 125, 100, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(avatar, 25, 25, 200, 200);
                ctx.restore();

                
                ctx.font = '40px Arial';
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(user.username, 250, 100);

                ctx.font = '30px Arial';
                ctx.fillText(`المستوى الكتابي: ${userData.textLevel}`, 250, 200);
                ctx.fillText(`نقاط الكتابة: ${userData.textXP}`, 250, 250);
                ctx.fillText(`المستوى الصوتي: ${userData.voiceLevel}`, 250, 300);
                ctx.fillText(`نقاط الصوت: ${userData.voiceXP}`, 250, 350);

                const attachment = { attachment: canvas.toBuffer(), name: 'profile.png' };
                return interaction.reply({ files: [attachment] });
            }

            case 'background': {
                const url = interaction.options.getString('url');
                
                try {
                    await loadImage(url);
                    levelDB.set(`profile_bg_${interaction.guild.id}_${interaction.user.id}`, url);
                    interaction.reply({ content: '✅ تم تحديث خلفية الملف الشخصي!', ephemeral: true });
                } catch (error) {
                    interaction.reply({ content: '❌ رابط الصورة غير صالح! يرجى تقديم رابط مباشر صالح للصورة.', ephemeral: true });
                }
                break;
            }
        }
    },
};

async function handleProfileCommand(message, args) {
    const user = message.mentions.users.first() || message.author;
    const member = await message.guild.members.fetch(user.id);
    const userData = await Level.findOne({ guildId: message.guild.id, userId: user.id }) || 
        new Level({ guildId: message.guild.id, userId: user.id });

    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');

    
    let banner;
    try {
        const customBg = levelDB.get(`profile_bg_${message.guild.id}_${user.id}`);
        if (customBg) {
            banner = await loadImage(customBg);
        } else {
            const fetchedUser = await user.fetch();
            banner = await loadImage(fetchedUser.bannerURL({ extension: 'png', size: 2048 }) || 
                member.displayAvatarURL({ extension: 'png', size: 1024 }));
        }
    } catch (error) {
        banner = await loadImage(member.displayAvatarURL({ extension: 'png', size: 1024 }));
    }

    
    ctx.filter = 'blur(8px)';
    ctx.drawImage(banner, -20, -20, canvas.width + 40, canvas.height + 40);
    
    
    ctx.filter = 'none';
    ctx.fillStyle = 'rgba(47, 49, 54, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    
    const flags = member.user.flags?.toArray() || [];
    const badgeSize = 40;
    const badgeSpacing = 10;
    const badgeStartX = canvas.width - 60;
    const badgeY = 20;
    let currentX = badgeStartX;

    
    for (const flag of flags.reverse()) {
        let badgeUrl;
        switch (flag) {
            case 'Staff': badgeUrl = 'https://discord.com/assets/48d5bdcffe9e7848067c2e187f1ef951.svg'; break;
            case 'Partner': badgeUrl = 'https://discord.com/assets/34306011e46e87f8ef25f3415d3b99ca.svg'; break;
            case 'CertifiedModerator': badgeUrl = 'https://discord.com/assets/c981e58b5ea4b7fedd3a643cf0c60564.svg'; break;
            case 'Hypesquad': badgeUrl = 'https://discord.com/assets/e666a84a7a5ea2abbbfa73adf22e627e.svg'; break;
            case 'HypeSquadOnlineHouse1': badgeUrl = 'https://discord.com/assets/64ae1208b6aefc0a0c3681e6be36f0ff.svg'; break;
            case 'HypeSquadOnlineHouse2': badgeUrl = 'https://discord.com/assets/48cf0556d93901c8cb16317be2436523.svg'; break;
            case 'HypeSquadOnlineHouse3': badgeUrl = 'https://discord.com/assets/9fdc63ef8a3cc1617c7586286c34e4f1.svg'; break;
            case 'BugHunterLevel1': badgeUrl = 'https://discord.com/assets/8353d89b529e13365c415ef73c730576.svg'; break;
            case 'BugHunterLevel2': badgeUrl = 'https://discord.com/assets/f6d8b784cd7196d5f3db6f7035231e8b.svg'; break;
            case 'ActiveDeveloper': badgeUrl = 'https://discord.com/assets/26c7a60fb1654315e0be26107bd47470.svg'; break;
            case 'VerifiedDeveloper': badgeUrl = 'https://discord.com/assets/4441e07fe0f46b3cb41b79366236fca8.svg'; break;
        }
        if (badgeUrl) {
            try {
                const badge = await loadImage(badgeUrl);
                ctx.drawImage(badge, currentX, badgeY, badgeSize, badgeSize);
                currentX -= (badgeSize + badgeSpacing);
            } catch (error) {
                console.error(`Failed to load badge: ${flag}`);
            }
        }
    }

    
    const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(125, 125, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 25, 25, 200, 200);
    ctx.restore();

    
    ctx.font = '40px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(user.username, 250, 100);

    ctx.font = '30px Arial';
    ctx.fillText(`المستوى الكتابي: ${userData.textLevel}`, 250, 200);
    ctx.fillText(`نقاط الكتابة: ${userData.textXP}`, 250, 250);
    ctx.fillText(`المستوى الصوتي: ${userData.voiceLevel}`, 250, 300);
    ctx.fillText(`نقاط الصوت: ${userData.voiceXP}`, 250, 350);

    const attachment = { attachment: canvas.toBuffer(), name: 'profile.png' };
    return message.reply({ files: [attachment] });
}

module.exports.handleProfileCommand = handleProfileCommand;
