const { Events, Interaction } = require('discord.js');
const { Database } = require("st.db");
const db = new Database("/Database/Ticket");

module.exports = {
  name: Events.InteractionCreate,
  
  /**
   * @param {Interaction} interaction
   */
  async execute(interaction, client) {
    // Check if the interaction is a button click
    if (interaction.isButton()) {
      // Ensure the customId is 'close_cancel'
      if (interaction.customId !== 'close_cancel') return;

      try {
        // Defer the update and delete the current message
        await interaction.deferUpdate();
        interaction.message.delete().catch(err => console.log(err));
      } catch (error) {
        console.log(error);
        // Send an error message if something goes wrong
        return interaction.reply({ content: 'Something went wrong, please try again.', ephemeral: true });
      }
    }
  }
};
