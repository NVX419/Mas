const { Events, Interaction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { Database } = require("st.db");

// Initialize the database instance
const db = new Database('/Database/Ticket');
const db2 = new Database('./Database/TempTicket');

module.exports = {
  name: Events.InteractionCreate,

  /**
   * Event handler for modal submissions
   * @param {Interaction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    // Check if the interaction is a modal submission
    if (interaction.isModalSubmit()) {
      // Proceed if the modal is related to ticket creation
      if (!interaction.customId.endsWith('ticket')) return;

      try {
        const roleid = interaction.customId.split("_")[0].trim();
        const buttonID = interaction.customId.split("_")[1].trim();

        // Retrieve ticket data from the database
        let data = db.get("ticketData_" + interaction.message.id) || null;
        if (!data) return interaction.deferUpdate();
        let ticketData = data.buttonsData["button" + buttonID];
        if (!ticketData) return interaction.deferUpdate();

        let { panal_categoryID, welcome, modals } = ticketData;
        let fieldsNum = interaction.fields.components.length;
        let info = [];

        // Collect inputs from the modal fields
        let filed1 = interaction.fields.getTextInputValue("inp1");
        info.push({ name: modals[0].label, value: filed1 });

        if (fieldsNum >= 2) {
          let filed2 = interaction.fields.getTextInputValue("inp2");
          info.push({ name: modals[1].label, value: filed2 });
        }
        if (fieldsNum >= 3) {
          let filed3 = interaction.fields.getTextInputValue("inp3");
          info.push({ name: modals[2].label, value: filed3 });
        }
        if (fieldsNum >= 4) {
          let filed4 = interaction.fields.getTextInputValue("inp4");
          info.push({ name: modals[3].label, value: filed4 });
        }
        if (fieldsNum == 5) {
          let filed5 = interaction.fields.getTextInputValue("inp5");
          info.push({ name: modals[4].label, value: filed5 });
        }

        let welcome_type = welcome.type || "embed";
        let welcome_message = welcome.message || "...";

        // Send confirmation to the user
        await interaction.deferReply({ ephemeral: true })
        interaction.editReply({
          content: "Your ticket is being created...",
          ephemeral: true,
        });

        // Create embed for the ticket
        const embed = new EmbedBuilder()
          .setColor(interaction.guild.members.me.displayHexColor)
          .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
          .setDescription(welcome_message)
          .setTimestamp()
          .setFooter({ text: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true }) })
          .addFields(...info);

        // Create buttons for the ticket
        const Ticketbuttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("ticket_close")
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Close")
            .setDisabled(false),
          new ButtonBuilder()
            .setCustomId(roleid + "_claim")
            .setStyle(ButtonStyle.Success)
            .setLabel("Claim")
            .setDisabled(false)
        );

        const ticketNumber = db.get("ticketID_" + interaction.message.id + "_" + buttonID) || 1;
        const ticketnumber = String(ticketNumber).padStart(4, '0');
        db.set("ticketID_" + interaction.message.id + "_" + buttonID, ticketNumber + 1);

        // Create the ticket channel
        const channel = await interaction.guild.channels.create({
          name: `ticket-${ticketnumber}`,
          type: ChannelType.GuildText,
          parent: panal_categoryID,
          topic: interaction.user.id,
          permissionOverwrites: [
            {
              id: interaction.guild.roles.everyone.id,
              deny: ["ViewChannel"],
            },
            {
              id: interaction.user.id,
              allow: ["ViewChannel", "SendMessages"],
            },
            {
              id: roleid,
              allow: ["ViewChannel", "SendMessages"],
            },
          ],
        });

        db2.set("ticketData_" + interaction.guild.id + "_" + channel.id, ticketData);

        if (welcome_type == "embed") {
          channel.send({ content: `<@!${interaction.member.id}> , <@&${roleid}>`, embeds: [embed], components: [Ticketbuttons] });
        } else {
          let wel = `<@!${interaction.member.id}> , <@&${roleid}>\n${welcome_message}\n`;
          info.forEach(qes => {
            wel += `\n**${qes.name}**\n${qes.value}`;
          });
          channel.send({ content: wel, components: [Ticketbuttons] });
        }

        await interaction.editReply({
          content: `Your ticket has been created: ${channel}`,
          ephemeral: true,
        });
      } catch (error) {
        console.log(error);
        return interaction.reply({ content: 'An error occurred while creating the ticket.', ephemeral: true });
      }
    }
  },
};