const { Schema, model } = require('mongoose');

const emojiChannelSchema = new Schema({
    Guild: String, // Guild ID
    Channel: String, // Channel ID where emojis are monitored
});

module.exports = model('EmojiChannel', emojiChannelSchema);