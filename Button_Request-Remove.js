const { Events, Interaction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { Database } = require("st.db");
const db = new Database("./Database/Ticket");
const db2 = new Database("./Database/TempTicket");

module.exports = {
  name: Events.InteractionCreate,

  /**
   * @param {Interaction} interaction
   */
  async execute(interaction, client) {
    if (interaction.isButton()) {
        if (!interaction.customId.endsWith('requester-remove')) return;
      const requester = interaction.customId.split("_")[0].trim();
      let claimer = db2.get(interaction.channel.id + "_claimed");

      if (claimer && interaction.user.id !== claimer && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: "You cannot do that!", ephemeral: true });
      }

      await interaction.deferUpdate();

      const embed = new EmbedBuilder()
        .setColor("Yellow")
        .setDescription(interaction.message.embeds[0].description);

      const requestButtons = new ActionRowBuilder().addComponents([
        new ButtonBuilder()
          .setCustomId(requester + "_request-accept")
          .setStyle(ButtonStyle.Success)
          .setLabel("Accept")
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(requester + "_request-reject")
          .setStyle(ButtonStyle.Secondary)
          .setLabel("Reject")
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(requester + "_requester-remove")
          .setStyle(ButtonStyle.Success)
          .setLabel("Remove")
          .setDisabled(true),
      ]);

      await interaction.message.edit({ embeds: [embed], components: [requestButtons] });
      await interaction.channel.permissionOverwrites.edit(requester, { SendMessages: null });
    }
  }
};
