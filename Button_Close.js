const { Events, Interaction, ModalBuilder, TextInputBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType } = require('discord.js');
const { Database } = require("st.db");
const db = new Database("/Database/Ticket");
const db2 = new Database("/Database/TempTicket");

module.exports = {
  name: Events.InteractionCreate,
  
  /**
   * @param {Interaction} interaction
   */
  async execute(interaction, client) {
    // Check if the interaction is a button click
    if (interaction.isButton()) {
      // Ensure the customId ends with 'ticket_close'
      if (interaction.customId !== 'ticket_close') return;

      try {
        // Set up the buttons used in the message
        const Ticketbuttons = new ActionRowBuilder().addComponents([
          new ButtonBuilder()
            .setCustomId('ticket_hide')
            .setStyle(ButtonStyle.Danger)
            .setLabel('Close')
            .setDisabled(false),
          new ButtonBuilder()
            .setCustomId('close_cancel')
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Cancel')
            .setDisabled(false),
        ]);

        // Reply with a message containing the buttons
        return interaction.reply({ content: 'Do you want to close the ticket?', components: [Ticketbuttons] });
      } catch (error) {
        console.log(error);
        // In case of error, send an error message
        return interaction.reply({ content: 'Something went wrong, please try again.', ephemeral: true });
      }
    }
  }
};
