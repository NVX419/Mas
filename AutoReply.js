const { model, Schema } = require('mongoose');

const autoReplySchema = new Schema({
    Guild: { type: String, required: true }, // Guild ID where the auto-reply is configured
    Message: { type: String, required: true }, // Trigger word or phrase
    Reply: { type: String, required: true }, // Reply message
    Search: { type: Boolean, default: false }, // Whether to search for the word/phrase in all messages
    Type: { type: String, enum: ['reply', 'send'], default: 'reply' }, // Reply type (reply/send)
});

module.exports = model('AutoReply', autoReplySchema);