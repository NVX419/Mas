const { Events } = require('discord.js');
const { Database } = require('st.db');

const db = new Database('/Database/Tax');

module.exports = {
  name: Events.MessageCreate,

  /**
   * @param {MessageCreate} message
   */
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    // Check if the channel is listed for tax calculation
    if (db.get(`Tax_${message.guild.id}`)?.includes(message.channel?.id)) {
        let args = message.content.split(" ").slice(0).join(" ");

        // Convert the string number with suffixes to its numeric value
        if (args.endsWith("m") || args.endsWith("M")) {
            args = args.replace(/m|M/gi, "") * 1000000;
        } else if (args.endsWith("k") || args.endsWith("K")) {
            args = args.replace(/k|K/gi, "") * 1000;
        } else if (args.endsWith("b") || args.endsWith("B")) {
            args = args.replace(/b|B/gi, "") * 1000000000;
        } else if (args.endsWith("t") || args.endsWith("T")) {
            args = args.replace(/t|T/gi, "") * 1000000000000;
        }

        // Parse the number and ensure it's valid
        let args2 = parseInt(args, 10);

        if (isNaN(args2)) {
            return;
        } else {
            // Calculate the tax
            let tax = Math.floor(args2 * 20 / 19 + 1);

            // Reply with the calculated tax
            message.reply({ content: `${tax}` });
        }
    }
  }
};