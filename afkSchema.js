const { model, Schema } = require('mongoose');

let afkSchema = new Schema({
    User: String,
    Guild: String,
    Message: String,
})

module.exports = model('afk', afkSchema);