const { Events, Interaction, ModalBuilder, TextInputBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType, PermissionOverwrites } = require('discord.js');
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
      // Ensure the customId ends with 'ticket_hide'
      if (interaction.customId !== 'ticket_hide') return;

      try {
        // Defer the update and delete the current message
        await interaction.deferUpdate();
        interaction.message.delete().catch(err => console.log(err));

        // Manage permissions: hide the ticket from users
        const permissionOverwrites = interaction.channel.permissionOverwrites.cache;
        permissionOverwrites.forEach((permission, id) => {
          if (permission instanceof PermissionOverwrites && permission.type === 0) {
            const role = interaction.guild.roles.cache.get(id);
            if (role.name === "@everyone") return; // Skip @everyone role
            interaction.channel.permissionOverwrites.edit(interaction.channel.topic, { ViewChannel: false });
            interaction.channel.permissionOverwrites.edit(role.id, { SendMessages: false });
          }
        });

        // Hide the ticket from the newly added user
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

        // Create buttons for the next actions
        const Ticketbuttons = new ActionRowBuilder().addComponents([
          new ButtonBuilder()
            .setCustomId('ticket_delete')
            .setStyle(ButtonStyle.Danger)
            .setLabel('Delete')
            .setDisabled(false),
          new ButtonBuilder()
            .setCustomId('ticket_open')
            .setStyle(ButtonStyle.Success)
            .setLabel('Open')
            .setDisabled(false),
          new ButtonBuilder()
            .setCustomId('ticket_transcript')
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Transcript')
            .setDisabled(false),
        ]);

        // Create and send embed messages
        const embed1 = new EmbedBuilder()
          .setColor('Yellow')
          .setDescription(`Ticket has been closed by ${interaction.user}`);
          
        const embed2 = new EmbedBuilder()
          .setColor('DarkButNotBlack')
          .setDescription('The ticket is now hidden from users.');

        await interaction.channel.send({ embeds: [embed1, embed2], components: [Ticketbuttons] });
      } catch (error) {
        console.log(error);
        // Send an error message if something goes wrong
        return interaction.reply({ content: 'Something went wrong, please try again.', ephemeral: true });
      }
    }
  }
};
