const { Events, Interaction, EmbedBuilder } = require('discord.js');
const { Database } = require('st.db');
const db2 = new Database('/Database/TempTicket');

module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    if (interaction.isButton()) {
      if (interaction.customId !== 'ticket_delete') return;

      try {
        // Defer the interaction update
        await interaction.deferUpdate();

        // Remove buttons from the message
        await interaction.message.edit({ components: [] });

        // Create a confirmation message
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setDescription('The ticket will be deleted within 5 seconds.');

        // Delete the ticket data from the database
        await db2.delete(`${interaction.guild.id}_${interaction.channel.id}`);
        await db2.delete(`ticketData_${interaction.guild.id}_${interaction.channel.id}`);
        await db2.delete(`${interaction.channel.id}_claimed`);

        // Send the confirmation message and delete the channel after 5 seconds
        await interaction.channel.send({ embeds: [embed] }).then(() => {
          setTimeout(() => {
            interaction.channel.delete().catch((err) => {
              console.log(err);
            });
          }, 5000);
        });
      } catch (error) {
        console.log(error);
        return interaction.reply({
          content: 'An error occurred while trying to delete the ticket.',
          ephemeral: true,
        });
      }
    }
  },
};
