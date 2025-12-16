const { Events, EmbedBuilder } = require('discord.js');
const { Database } = require('st.db');

const db = new Database('/Database/Autoline');

module.exports = {
  name: Events.MessageCreate,
  
  /**
   * @param {MessageCreate} message
   */
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    // Autoline system
    const autolineChannels = db.get(`Autoline_${message.guild.id}`) || [];
    if (autolineChannels.includes(message.channel?.id)) {
      const line = db.get(`Line_${message.guild.id}`) || null;
      if (!line) {
        return message.reply({ content: 'No line has been set for this channel.', ephemeral: true });
      }

      const mode = db.get(`autolineMode_${message.guild.id}`) || 'file';

      if (mode === 'file') {
        message.channel.send({ files: [line] });
      } else if (mode === 'message') {
        message.channel.send(line);
      } else if (mode === 'embed') {
        const embed = new EmbedBuilder()
          .setColor(message.guild?.members?.me.displayHexColor || '#000000')
          .setImage(line);
        message.channel.send({ embeds: [embed] });
      }
    }
  }
};
