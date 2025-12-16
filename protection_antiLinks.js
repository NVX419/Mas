const { PermissionsBitField, Events } = require('discord.js');
const { Database } = require('st.db');

const db = new Database('/Database/AntiLiks_Protection');

module.exports = {
    name: Events.MessageCreate,
    execute: async (message) => {
        if (message.author.bot || !message.guild) return;

        const data = await db.get(`${message.guild.id}`);
        if (!data) return;

        const bypassPermissions = data.Perms;

        if (message.member.permissions.has(PermissionsBitField.Flags[bypassPermissions])) return;

        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}(\/[^\s]*)?)/;
        if (urlRegex.test(message.content)) {
            await message.delete();

            const warningMessage = await message.channel.send({
                content: `${message.author}, links are not allowed here!`
            });

            setTimeout(() => {
                warningMessage.delete();
            }, 5000);
        }
    }
};
