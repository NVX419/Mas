const mongoose = require('mongoose');

const warningSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    warnings: [{
        moderator: String,
        reason: String,
        timestamp: Date,
        warningId: String
    }]
});

module.exports = mongoose.model('Warning', warningSchema);
