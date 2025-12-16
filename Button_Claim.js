const { Events, Interaction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { Database } = require("st.db");
const db = new Database("/Database/Ticket");
const db2 = new Database("/Database/TempTicket");

module.exports = {
  name: Events.InteractionCreate,

  /**
   * @param {Interaction} interaction
   */
  async execute(interaction, client) {
    if (interaction.isButton()) {
      if (!interaction.customId.endsWith('claim')) return;

      try {
        const role = interaction.customId.split("_")[0].trim();
        const hasRole = interaction.member.roles.cache.has(role);
        
        // Check if the user has the required role
        if (!hasRole) {
          return interaction.reply({ 
            content: `You need the <@&${role}> role to claim this ticket.`, 
            ephemeral: true 
          });
        }

        // Check if the user is trying to claim their own ticket and is not an administrator
        if (interaction.user.id === interaction.channel.topic && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ 
            content: `You cannot claim your own ticket unless you're an administrator.`, 
            ephemeral: true 
          });
        }

        await interaction.deferUpdate();

        // Create a response embed
        const embed = new EmbedBuilder()
          .setColor(interaction.member.displayHexColor)
          .setDescription(`${interaction.user} has claimed this ticket.`);

        // Create buttons for managing the ticket
        const Ticketbuttons = new ActionRowBuilder().addComponents([
          new ButtonBuilder()
            .setCustomId("ticket_close")
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Close"),
          new ButtonBuilder()
            .setCustomId(`${role}_claimed`)
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Unclaim"),
          new ButtonBuilder()
            .setCustomId(`${role}_request`)
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Request"),
        ]);

        // Update the message with new buttons and permissions
        await interaction.message.edit({ components: [Ticketbuttons] });
        await interaction.channel.permissionOverwrites.edit(interaction.member, { SendMessages: true });
        await interaction.channel.permissionOverwrites.edit(role, { SendMessages: false });

        // Send the embed in the channel
        await interaction.channel.send({ embeds: [embed] });

        // Update the database to reflect the claim
        db2.set(`${interaction.channel.id}_claimed`, interaction.user.id);

      } catch (error) {
        console.log(error);
        return interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
      }
    }
  }
};
