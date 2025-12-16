const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    textLevel: { type: Number, default: 1 },
    textXP: { type: Number, default: 0 },
    voiceLevel: { type: Number, default: 1 },
    voiceXP: { type: Number, default: 0 },
    messagesCount: { type: Number, default: 0 },
    lastMessage: { type: Date, default: Date.now }
});

// Create a compound index for faster queries
levelSchema.index({ guildId: 1, userId: 1 });

module.exports = mongoose.model('Level', levelSchema);
