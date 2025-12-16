const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    roleId: { type: String, required: true },
    channelId: { type: String, required: true },
    categoryId: { type: String, required: true }
});

module.exports = mongoose.model('Blacklist', blacklistSchema);
