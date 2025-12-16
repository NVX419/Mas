const {
    Events,
    Interaction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
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
            if (!interaction.customId.endsWith('claimed')) return;

            const role = interaction.customId.split("_")[0].trim();
            const hasRole = interaction.member.roles.cache.some(r => r.id === role);
            
            if (!hasRole) {
                return interaction.reply({
                    content: `You must have the role <@&${role}> to unclaim this ticket.`,
                    ephemeral: true,
                });
            }

            let claimer = db2.get(`${interaction.channel.id}_claimed`);

            if (claimer && interaction.user.id !== claimer && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({
                    content: `This ticket is already claimed by <@!${claimer}>. Only an administrator can override this claim.`,
                    ephemeral: true,
                });
            }

            try {
                await interaction.deferUpdate();

                const embed = new EmbedBuilder()
                    .setColor(interaction.member.displayHexColor)
                    .setDescription(`${interaction.user} has unclaimed this ticket.`);

                const Ticketbuttons = new ActionRowBuilder().addComponents([
                    new ButtonBuilder()
                        .setCustomId("ticket_close")
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel("Close")
                        .setDisabled(false),
                    new ButtonBuilder()
                        .setCustomId(`${role}_claim`)
                        .setStyle(ButtonStyle.Success)
                        .setLabel("Claim")
                        .setDisabled(false),
                ]);

                await interaction.message.edit({ components: [Ticketbuttons] });
                await interaction.channel.permissionOverwrites.edit(claimer || interaction.member, { SendMessages: null });
                await interaction.channel.permissionOverwrites.edit(role, { SendMessages: true });

                await interaction.channel.send({ embeds: [embed] });
                db2.delete(`${interaction.channel.id}_claimed`);
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
