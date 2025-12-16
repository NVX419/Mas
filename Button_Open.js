const { Events, Interaction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType, PermissionOverwrites } = require('discord.js');
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
      // Ensure the customId ends with 'ticket_open'
      if (interaction.customId !== 'ticket_open') return;

      try {
        // Defer the update and delete the current message
        await interaction.deferUpdate();
        interaction.message.delete().catch(err => console.log(err));

        // Manage permissions: open the ticket for users
        const permissionOverwrites = interaction.channel.permissionOverwrites.cache;
        permissionOverwrites.forEach((permission, id) => {
          if (permission instanceof PermissionOverwrites && permission.type === 0) {
            const role = interaction.guild.roles.cache.get(id);
            if (role.name === "@everyone") return; // Skip @everyone role
            interaction.channel.permissionOverwrites.edit(interaction.channel.topic, { ViewChannel: true, SendMessages: true });
            interaction.channel.permissionOverwrites.edit(role.id, { SendMessages: true });
          }
        });

        // Ensure that the ticket is hidden from the added user
        const addedUser = interaction.channel.topic; // Assuming the added user's ID is in the channel's topic
        if (addedUser) {
          const member = interaction.guild.members.cache.get(addedUser);
          if (member) {
            await interaction.channel.permissionOverwrites.edit(member.id, {
              ViewChannel: false,
              SendMessages: false,
            });
          }
        }

        // Create and send an embed message
        const embed = new EmbedBuilder()
          .setColor('Green')
          .setDescription(`Ticket has been reopened by ${interaction.user}`);

        await interaction.channel.send({ embeds: [embed] });
      } catch (error) {
        console.log(error);
        // Send an error message if something goes wrong
        return interaction.reply({ content: 'Something went wrong, please try again.', ephemeral: true });
      }
    }
  }
};
