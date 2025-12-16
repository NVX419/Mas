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
      try {
        if (!interaction.customId.endsWith('ticketsetup')) return;
        // Extracting data from the modal
        const ID = interaction.customId.split("_")[0].trim();
        let panal_message = interaction.fields.getTextInputValue("panal_message");
        let panal_message_type = interaction.fields.getTextInputValue("panal_message_type");
        let panal_welcome = interaction.fields.getTextInputValue("panal_welcome");
        let panal_welcome_type = interaction.fields.getTextInputValue("panal_welcome_type");

        // Fetch setup data from the database
        const data = db.get("ticketSetupData_" + ID) || null;
        if (!data) return interaction.reply({ content: 'No data found for this ticket setup.', ephemeral: true });

        // Destructure the necessary fields from the setup data
        let { panal_channelID, panal_categoryID, button_name, button_color, button_emoji, support_role } = data;

        // Delete the setup data after using it
        await db.delete("ticketSetupData_" + ID);

        // Attempt to delete the existing message from the channel
        let prosMsg = interaction.channel.messages.cache.get(ID);
        if (prosMsg) prosMsg.delete().catch();

        // Fetch the panel channel by its ID
        let panal_channel = interaction.guild.channels.cache.get(panal_channelID);
        if (!panal_channel) return interaction.reply({ content: 'The specified panel channel does not exist.', ephemeral: true });

        // Ensure proper message type for panel message
        if (!panal_message_type.toLowerCase().includes('embed') && !panal_message_type.toLowerCase().includes('message')) panal_message_type = 'embed';
        if (!panal_welcome_type.toLowerCase().includes('embed') && !panal_welcome_type.toLowerCase().includes('message')) panal_welcome_type = 'embed';

        // Create the embed for the panel message
        let embed = new EmbedBuilder()
          .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
          .setColor(interaction.guild.members.me.displayHexColor)
          .setTimestamp()
          .setDescription(panal_message)
          .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) });

        // Create the button for ticket creation
        const button = new ActionRowBuilder().addComponents([
          new ButtonBuilder()
            .setCustomId(support_role + "_" + panal_categoryID + "_1" + "_ticket")
            .setStyle(parseInt(button_color || 1))
            .setLabel(button_name)
        ]);
        
        // Set emoji if provided
        if (button_emoji) {
          button.components[0].setEmoji(button_emoji);
        }

        // Send the message either as embed or text
        if (panal_message_type.toLowerCase() === 'embed') {
          panal_channel.send({ embeds: [embed], components: [button] }).then(async (msg) => {
            // Save the panel data to the database
            db.set("ticketData_" + msg.id, {
              panal_channelID: panal_channelID,
              panel_message: panal_message,
              buttonsData: {
                button1: {
                  panal_categoryID: panal_categoryID,
                  button_name: button_name,
                  button_color: button_color,
                  button_emoji: button_emoji,
                  support_role: support_role,
                  modals: [],
                  welcome: {
                    message: panal_welcome,
                    type: panal_welcome_type
                  }
                }
              }
            });
            // Send success reply
            interaction.reply({ content: `Ticket panel setup complete in ${panal_channel}`, ephemeral: true });
          }).catch(async (error) => {
            console.log(error);
            // Send an error message if the message failed to send
            return interaction.reply({ content: 'An error occurred while setting up the ticket panel.', ephemeral: true });
          });
        } else {
          panal_channel.send({ content: panal_message, components: [button] }).then(async (msg) => {
            // Save the panel data to the database
            db.set("ticketData_" + msg.id, {
              panal_channelID: panal_channelID,
              panel_message: panal_message,
              buttonsData: {
                button1: {
                  panal_categoryID: panal_categoryID,
                  button_name: button_name,
                  button_color: button_color,
                  button_emoji: button_emoji,
                  support_role: support_role,
                  modals: [],
                  welcome: {
                    message: panal_welcome,
                    type: panal_welcome_type
                  }
                }
              }
            });
            // Send success reply
            interaction.reply({ content: `Ticket panel setup complete in ${panal_channel}`, ephemeral: true });
          }).catch(async (error) => {
            console.log(error);
            // Send an error message if the message failed to send
            return interaction.reply({ content: 'An error occurred while setting up the ticket panel.', ephemeral: true });
          });
        }
      } catch (error) {
        console.log(error);
        // Handle any unexpected errors
        return interaction.reply({ content: 'An error occurred. Please try again later.', ephemeral: true });
      }
    }
  }
};