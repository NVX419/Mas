const { parseEmoji } = require('discord.js');

module.exports = {
    name: 'addemoji',
    description: 'اضافة ايموجيات من سيرفرات اخرى',
    run: async (client, message, args) => {
        try {

            if (!message.member.permissions.has('ADMINISTRATOR')) {
                return message.reply({ content: '### You do not have permissions to use the command <a:emoji_1738646905585:1336206712310595672>', ephemeral: true });
            }

            const emojisRaw = args.join(' ').split(' ').map(emoji => emoji.trim());

            if (!args) { return }
            
            const addedEmojis = [];
            const failedEmojis = [];

            // استخدام فحص بسيط للامتداد
            const isImage = (url) => {
                const extension = url.split('.').pop().toLowerCase();
                return ['png', 'jpg', 'jpeg', 'gif'].includes(extension);
            };

            for (const emojiRaw of emojisRaw) {
                let link;

                if (!isImage(emojiRaw)) {
                    const emoteMatch = emojiRaw.match(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/gi);
                    if (emoteMatch) {
                        const emote = emoteMatch[0];
                        const parsedEmoji = parseEmoji(emote);
                        link = `https://cdn.discordapp.com/emojis/${parsedEmoji.id}.${parsedEmoji.animated ? 'gif' : 'png'}`;
                    } else {
                        link = emojiRaw; // استخدام الرابط مباشرة
                    }
                } else {
                    link = emojiRaw; // استخدام الرابط إذا كان صورة
                }

                const emojiName = `emoji_${Date.now()}`; // اسم افتراضي يعتمد على الوقت الحالي

                try {
                    const emoji = await message.guild.emojis.create({ attachment: link, name: emojiName });
                    addedEmojis.push(emoji);
                } catch (error) {
                    console.error(error); // Log the error
                    failedEmojis.push(emojiRaw);
                }
            }

            const responseMessage = [];
            if (addedEmojis.length) {
                responseMessage.push(`${addedEmojis.length} ### Added Emojies: ${addedEmojis.join(', ')}`);
            }
            if (failedEmojis.length) {
                responseMessage.push(`### I couldn’t add this emoji : ${failedEmojis.join(', ')}`);
            }

            await message.reply({ content: responseMessage.join('\n') });
        } catch (error) {
            console.error(error); // Log the error
            await message.reply({ content: 'An error occurred while adding the emoji.' });
        }
    },
};
