const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const feedbackDB = new Database("./Database/feedback.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('remove-feedback')
        .setDescription('إزالة روم الاراء'),
        
    async execute(interaction) {
        try {
            await feedbackDB.delete(`feedback_room_${interaction.guild.id}`);
            return interaction.reply({content: '**تم إزالة روم الاراء بنجاح**'});
        } catch {
            return interaction.reply({content: '**حدث خطأ اثناء إزالة روم الاراء**', ephemeral: true});
        }
    }
}
