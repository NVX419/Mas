const mongoose = require('mongoose');

const invitesSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    invites: {
        total: { type: Number, default: 0 },
        joins: { type: Number, default: 0 }, // Changed from regular to joins
        left: { type: Number, default: 0 },
        fake: { type: Number, default: 0 }
    },
    inviteChannel: { type: String, default: null }
});

module.exports = mongoose.model('Invites', invitesSchema);
