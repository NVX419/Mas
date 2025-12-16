const mongoose = require('mongoose');

const countingSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    currentCount: { type: Number, default: 0 },
    lastUserId: { type: String, default: null },
    users: [{
        userId: String,
        count: Number,
        highestCount: Number,
        lastCount: Number
    }],
    emoji: { type: String, default: '✅' } // Emoji used for correct counts
});

module.exports = mongoose.model('Counting', countingSchema);
