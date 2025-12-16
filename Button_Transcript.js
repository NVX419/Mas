const { Events, Interaction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Database } = require("st.db");
const discordTranscripts = require('discord-html-transcripts');

const db = new Database("/Database/Ticket");
const db2 = new Database("/Database/TempTicket");

module.exports = {
  name: Events.InteractionCreate,

  /**
   * @param {Interaction} interaction
   */
  async execute(interaction, client) {
    if (interaction.isButton()) {
      if (interaction.customId !== 'ticket_transcript') return;

      try {
        // Defer the interaction update
        await interaction.deferUpdate();

        // Fetch transcript channel ID from the database
        const TranChannelID = db.get(`tranScript_${interaction.guild.id}`);
        if (!TranChannelID) {
          return interaction.reply({ content: 'Transcript channel not set.', ephemeral: true });
        }

        // Fetch the transcript channel
        const TranChannel = interaction.guild.channels.cache.get(TranChannelID) || await interaction.guild.channels.fetch(TranChannelID).catch();
        if (!TranChannel) {
          return interaction.reply({ content: 'Transcript channel not found.', ephemeral: true });
        }

        // Send initial embed message
        const embedStart = new EmbedBuilder().setColor("Yellow").setDescription('Generating transcript...');
        const sentMessage = await interaction.channel.send({ embeds: [embedStart] });

        // Get the member information
        const member = interaction.guild.members.cache.get(interaction.channel.topic)?.user || { username: interaction.guild.name, avatarURL: interaction.guild.iconURL() };

        // Create the transcript
        const attachment = await discordTranscripts.createTranscript(interaction.channel, {
          returnType: 'attachment',
          filename: `${interaction.channel.name}.html`,
          saveImages: true,
        });

        // Extract closer information
        const userIdMatch = /<@(\d+)>/.exec(interaction.message.embeds[0]?.description);
        const closer = userIdMatch ? userIdMatch[1] : "unknown";

        // Send transcript to the transcript channel
        const tarMSG = await TranChannel.send({ files: [attachment] });

        // Prepare the final embed
        const embedComplete = new EmbedBuilder()
          .setAuthor({ name: member.username, iconURL: member.avatarURL() })
          .setColor(interaction.guild.members.me.displayHexColor)
          .addFields(
            { name: 'User', value: member.username, inline: true },
            { name: 'Ticket', value: interaction.channel.name, inline: true },
            { name: 'Closer', value: `<@${closer}>`, inline: true },
            { name: 'Transcript', value: `[Click here to view](https://mahto.id/chat-exporter?url=${tarMSG.attachments.first()?.url})`, inline: true }
          )
          .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
          .setTimestamp();

        // Prepare the button to view the transcript
        const actionRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL(`https://mahto.id/chat-exporter?url=${tarMSG.attachments.first()?.url}`)
            .setLabel('View Transcript')
        );

        // Send the final embed with button to the transcript channel
        await TranChannel.send({ embeds: [embedComplete], components: [actionRow] });

        // Update the original message with success message
        const embedSuccess = new EmbedBuilder().setColor("Green").setDescription('Transcript generated successfully.');
        await sentMessage.edit({ embeds: [embedSuccess] });

        // Optionally send the transcript to the user
        await member.send({ embeds: [embedComplete], components: [actionRow] }).catch(() => {
          console.log('Failed to send transcript to the user.');
        });

      } catch (error) {
        console.error(error);
        return interaction.reply({ content: 'An error occurred while generating the transcript.', ephemeral: true });
      }
    }
  }
};
