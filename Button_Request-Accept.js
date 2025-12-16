const { 
    Events, 
    Interaction, 
    ButtonBuilder, 
    ButtonStyle, 
    ActionRowBuilder, 
    EmbedBuilder, 
    PermissionFlagsBits 
} = require("discord.js");
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
            if (!interaction.customId.endsWith('request-accept')) return;

            try {
                const requester = interaction.customId.split("_")[0].trim();
                let claimer = db2.get(`${interaction.channel.id}_claimed`);

                if (claimer && interaction.user.id !== claimer && 
                    !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                    return interaction.reply({
                        content: "You do not have permission to accept this request.",
                        ephemeral: true,
                    });
                }

                await interaction.deferUpdate();

                const embed = new EmbedBuilder()
                    .setColor("Green")
                    .setDescription(interaction.message.embeds[0].description);

                const Requestbuttons = new ActionRowBuilder().addComponents([
                    new ButtonBuilder()
                        .setCustomId(`${requester}_request-accept`)
                        .setStyle(ButtonStyle.Success)
                        .setLabel("Accept")
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId(`${requester}_request-reject`)
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel("Reject")
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId(`${requester}_requester-remove`)
                        .setStyle(ButtonStyle.Danger)
                        .setLabel("Remove")
                        .setDisabled(false),
                ]);

                await interaction.message.edit({ embeds: [embed], components: [Requestbuttons] });

                await interaction.channel.permissionOverwrites.edit(requester, { SendMessages: true });

                const message = await interaction.channel.send({ content: `<@!${requester}>` });
                setTimeout(() => {
                    message.delete().catch(err => {});
                }, 1000);
                
            } catch (error) {
                console.log(error);
                return interaction.reply({
                    content: "An error occurred while processing your request.",
                    ephemeral: true,
                });
            }
        }
    }
};
