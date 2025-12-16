const { Events, Interaction, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { Database } = require("st.db");

// Initialize the database instance
const db = new Database('/Database/Ticket');

module.exports = {
  name: Events.InteractionCreate,

  /**
   * Event handler for modal submissions
   * @param {Interaction} interaction
   */
  async execute(interaction, client) {
    // Check if the interaction is a modal submission
    if (interaction.isModalSubmit()) {
      if (!interaction.customId.endsWith('ticketmanage')) return;

      try {
        const ID = interaction.customId.split("_")[0].trim();
        const PanalID = interaction.customId.split("_")[1].trim();
        const manage_type = interaction.customId.split("_")[2].trim();

        let msg = [];
        let messages = await interaction.channel.messages.fetch();
        messages.filter((m) => {
          if (m.author.id == interaction.client.user.id && m.id == PanalID && m.components) {
            msg.push(m);
          }
        });

        if (!msg.length)
          return interaction.reply({ content: 'Message not found.', ephemeral: true });

        let panal = interaction.channel.messages.cache.get(msg[0].id);
        if (!panal) return interaction.reply({ content: 'Message not found.', ephemeral: true });

        if (manage_type == "addbutton") {
          let panal_welcome = interaction.fields.getTextInputValue("panal_welcome");
          let panal_welcome_type = interaction.fields.getTextInputValue("panal_welcome_type");

          let data = db.get("ticketManageData_" + ID) || null;
          if (!data) return interaction.reply({ content: 'No data found.', ephemeral: true });

          let ticketData = db.get("ticketData_" + PanalID);
          let { categoryID, button_name, button_color, button_emoji, support_role } = data;

          await db.delete("ticketManageData_" + ID);

          let prosMsg = interaction.channel.messages.cache.get(ID);
          if (prosMsg) prosMsg.delete().catch();

          let panalButton = panal.components[0].components;
          if (panalButton.length >= 5)
            return interaction.reply({ content: 'Maximum number of buttons reached (5).', ephemeral: true });

          if (!['embed', 'message'].includes(panal_welcome_type.toLowerCase())) panal_welcome_type = 'embed';

          ticketData.buttonsData[`button${panalButton.length + 1}`] = {
            panal_categoryID: categoryID,
            button_name: button_name,
            button_color: button_color,
            button_emoji: button_emoji,
            support_role: support_role,
            modals: [],
            welcome: {
              message: panal_welcome,
              type: panal_welcome_type
            }
          };

          let nbu = new ButtonBuilder()
            .setCustomId(support_role + "_" + categoryID + "_" + (panalButton.length + 1) + "_ticket")
            .setLabel(button_name)
            .setStyle(parseInt(button_color));
          if (button_emoji) nbu.setEmoji(button_emoji);

          panalButton.push(nbu);

          await panal.edit({ components: [new ActionRowBuilder().addComponents(panalButton)] }).then(() => {
            db.set("ticketData_" + PanalID, ticketData);
            interaction.reply({ content: 'Button added successfully.', ephemeral: true });
          });
        } else if (manage_type == "changemessage") {
          let panal_message = interaction.fields.getTextInputValue("panal_message");
          let panal_message_type = interaction.fields.getTextInputValue("panal_message_type");

          if (!['embed', 'message'].includes(panal_message_type.toLowerCase())) panal_message_type = 'embed';

          if (panal_message_type.toLowerCase() == "embed") {
            let embed = new EmbedBuilder()
              .setDescription(panal_message);
            if (panal.embeds[0]?.footer) {
              embed.setFooter(panal.embeds[0].footer);
            } else {
              embed.setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) });
            }
            embed.setColor(panal.embeds[0]?.color || interaction.guild.members.me.displayHexColor);
            embed.setAuthor(panal.embeds[0]?.author || { name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) });
            embed.setTimestamp(panal.embeds[0]?.timestamp || new Date());

            panal.edit({ content: '', embeds: [embed] }).then(() => {
              interaction.reply({ content: 'Message updated successfully.', ephemeral: true });
            });
          } else {
            panal.edit({ content: panal_message, embeds: [] }).then(() => {
              interaction.reply({ content: 'Message updated successfully.', ephemeral: true });
            });
          }
        } else if (manage_type == "addmodal") {
          let input_text = interaction.fields.getTextInputValue("text");
          let input_type = interaction.fields.getTextInputValue("type");
          const buttonID = interaction.customId.split("_")[3].trim();
          let ticketData = db.get("ticketData_" + PanalID);
          let buttonModals = ticketData.buttonsData[`button${buttonID}`].modals || [];

          if (buttonModals.length >= 5) {
            return interaction.reply({ content: 'Maximum number of modals reached (5).', ephemeral: true });
          }

          if (!['long', 'short'].includes(input_type.toLowerCase())) input_type = 'short';

          let inputType = (input_type.toLowerCase() === 'short') ? 1 : 2;

          ticketData.buttonsData[`button${buttonID}`].modals.push({
            label: input_text,
            type: inputType,
            place: null,
            max: null,
            min: null,
          });

          db.set("ticketData_" + PanalID, ticketData);
          interaction.reply({ content: `Modal added to button ${buttonID}.`, ephemeral: true });
        }

      } catch (error) {
        console.log(error);
        interaction.reply({ content: 'An error occurred. Please try again later.', ephemeral: true });
      }
    }
  }
};
