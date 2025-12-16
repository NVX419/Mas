const mongoose = require('mongoose');

const securitySchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    antiDelete: {
        enabled: { type: Boolean, default: false },
        channels: { type: Boolean, default: false },
        roles: { type: Boolean, default: false },
        categories: { type: Boolean, default: false }
    },
    antiLinks: { type: Boolean, default: false },
    antiBan: { type: Boolean, default: false },
    antiKick: { type: Boolean, default: false },
    antiBots: { type: Boolean, default: false },
    whitelist: [String],
    actionLogs: { type: String, default: null },
    linkWarnings: [{
        userId: String,
        count: Number,
        lastWarning: Date
    }]
});

module.exports = mongoose.model('Security', securitySchema);
