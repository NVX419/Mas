const { SlashCommandBuilder, EmbedBuilder , PermissionsBitField } = require("discord.js");
const { Database } = require("st.db")
const feedbackDB = new Database("./Database/feedback.json");
module.exports = {
    adminsOnly:true,
    data: new SlashCommandBuilder()
    .setName('feedback-room')
    .setDescription('تحديد روم الاراء')
    .addChannelOption(Option => 
        Option
        .setName('room')
        .setDescription('الروم')
        .setRequired(true)), 
async execute(interaction) {
    try{
    const room = interaction.options.getChannel(`room`)
    await feedbackDB.set(`feedback_room_${interaction.guild.id}` , room.id)
    return interaction.reply({content:`**تم تحديد الروم بنجاح**`})
} catch  {
    return;
}
}
}