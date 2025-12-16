const { Events, EmbedBuilder } = require('discord.js');
const { Database } = require('st.db');

const db = new Database('/Database/Suggestion');

module.exports = {
  name: Events.MessageCreate,

  /**
   * @param {MessageCreate} message
   */
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    if (db.get(`Suggestion_${message.guild.id}`)?.includes(message.channel.id)) {
      if (message.content.startsWith("https://")) {
        message.delete();
        return;
      }

      const embed = new EmbedBuilder()
        .setThumbnail(message.author.avatarURL({ dynamic: true }))
        .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL({ dynamic: true }) })
        .setColor("Random")
        .setDescription(`> ### ${message.content}`)
        .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) });

      const attachment = message.attachments.first();
      if (attachment) {
        embed.setImage(attachment.proxyURL);
      }

      message.delete();

      message.channel.send({ embeds: [embed] }).then(async (msg) => {

        msg.react('☑️').catch(err => {});
        await msg.react('❌').catch(err => {});

        const line = db.get(`SuggestionLine_${message.guild.id}`);
        if (line) {
          message.channel.send({ files: [line] });
        }
      });
    }
  }
};
