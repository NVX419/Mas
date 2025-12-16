const { Events, Interaction, ModalBuilder, TextInputBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType } = require('discord.js');
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
      try {
        if (!interaction.customId.endsWith('ticket')) return;

        let roleid = interaction.customId.split("_")[0].trim();
        let categoryID = interaction.customId.split("_")[1].trim();
        let buttonID = interaction.customId.split("_")[2].trim();
        let data = db.get("ticketData_" + interaction.message.id) || null;
        if (!data) return interaction.deferUpdate();
        let ticketData = data.buttonsData["button" + buttonID];
        if (!ticketData) return interaction.deferUpdate();

        let ticketLimits = db.get(`ticketsLimit_${interaction.guild.id}`) || 50;
        let userTickets = 0;
        if (ticketLimits) {
          interaction.guild.channels.cache.forEach(channel => {
            try {
              if (!channel.topic) return;
              if (channel.type !== ChannelType.GuildText) return;
              if (!channel.viewable) return;
              let ticketCheck = db2.get(interaction.guild.id + "_" + channel.id) || null;
              if (!ticketCheck) return;
              if (channel.topic == interaction.user.id) ++userTickets;
            } catch (error) {
              console.log(error);
            }
          });
        }

        if (ticketLimits <= userTickets) {
          return interaction.reply({ content: "You have reached the ticket limit!", ephemeral: true });
        }

        let { panal_categoryID, welcome, modals } = ticketData;

        if (modals.length > 0) {
          const modal = new ModalBuilder()
            .setCustomId(roleid + "_" + buttonID + "_ticket")
            .setTitle("Please fill out the ticket details");

          modals.forEach((d, index) => {
            const input = new TextInputBuilder()
              .setCustomId('inp' + (index + 1))
              .setRequired(true)
              .setLabel(d.label)
              .setStyle(d.type);
            if (d.place) input.setPlaceholder(d.place);
            if (d.max) input.setMaxLength(d.max);
            if (d.min) input.setMinLength(d.min);
            const actionRow = new ActionRowBuilder().addComponents(input);
            modal.addComponents(actionRow);
          });

          await interaction.showModal(modal);
        } else {
          let welcome_type = welcome.type || "embed";
          let welcome_message = welcome.message || "...";

          await interaction.deferReply({ ephemeral: true })
          await interaction.editReply({
            content: "Your ticket is being created..."
          });

          const embed = new EmbedBuilder()
            .setColor(interaction.guild.members.me.displayHexColor)
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setDescription(welcome_message)
            .setTimestamp()
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true }) });

          const Ticketbuttons = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
              .setCustomId("ticket_close")
              .setStyle(ButtonStyle.Secondary)
              .setLabel("Close")
              .setDisabled(false),
            new ButtonBuilder()
              .setCustomId(roleid + "_claim")
              .setStyle(ButtonStyle.Success)
              .setLabel("Claim")
              .setDisabled(false),
          ]);

          const ticketNumber = db.get("ticketID_" + interaction.message.id + "_" + buttonID) || 1;
          const ticketnumber = String(ticketNumber).padStart(4, '0');
          db.set("ticketID_" + interaction.message.id + "_" + buttonID, ticketNumber + 1);

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
            ]
          });

          db2.set("ticketData_" + interaction.guild.id + "_" + channel.id, ticketData);

          // Send DMs to support team members
          const supportRole = interaction.guild.roles.cache.get(roleid);
          if (supportRole) {
              const membersWithRole = supportRole.members;
              for (const [, member] of membersWithRole) {
                  try {
                      await member.send({
                          content: `🎫 **New Ticket Created!**\n\n**Server:** ${interaction.guild.name}\n**Channel:** ${channel}\n**Created by:** ${interaction.user.tag}\n\nPlease check the ticket when you can.`
                      });
                  } catch (err) {
                      continue; // Skip if DM fails
                  }
              }
          }

          if (welcome_type == "embed") {
            channel.send({ content: "<@!" + interaction.member.id + ">" + "," + "<@&" + roleid + ">", embeds: [embed], components: [Ticketbuttons] });
          } else {
            channel.send({ content: "<@!" + interaction.member.id + ">" + "," + "<@&" + roleid + ">" + "\n" + welcome_message, components: [Ticketbuttons] });
          }

          await interaction.editReply({
            content: `Your ticket has been created: ${channel}`,
          });
        }
      } catch (error) {
        console.log(error);
        return;
      }
    }
  }
};
