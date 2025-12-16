const { Events, Interaction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
      if (!interaction.customId.endsWith('request')) return; 

      try {
        const role = interaction.customId.split("_")[0].trim();
        const hasRole = interaction.member.roles.cache.some(r => r.id === role);
        if (!hasRole) {
          return interaction.reply({
            content: `You must have the role <@&${role}> to make a request.`,
            ephemeral: true,
          });
        }

        let claimer = db2.get(`${interaction.channel.id}_claimed`);
        if (claimer && (interaction.user.id === claimer || 
            (interaction.channel.topic && interaction.channel.topic === interaction.user.id))) {
          return interaction.reply({
            content: 'You have already made a request or are the current claimer.',
            ephemeral: true,
          });
        }

        await interaction.deferUpdate();

        const embed = new EmbedBuilder()
          .setColor("DarkButNotBlack")
          .setDescription(`Request made by ${interaction.user}.`);

        const Requestbuttons = new ActionRowBuilder().addComponents([
          new ButtonBuilder()
            .setCustomId(`${interaction.user.id}_request-accept`)
            .setStyle(ButtonStyle.Success)
            .setLabel("Accept")
            .setDisabled(false),
          new ButtonBuilder()
            .setCustomId(`${interaction.user.id}_request-reject`)
            .setStyle(ButtonStyle.Danger)
            .setLabel("Reject")
            .setDisabled(false),
        ]);

        await interaction.channel.send({ embeds: [embed], components: [Requestbuttons] });
      } catch (error) {
        console.log(error);
        return interaction.reply({
          content: 'An error occurred while processing your request. Please try again later.',
          ephemeral: true,
        });
      }
    }
  }
};
