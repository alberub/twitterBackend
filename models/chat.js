const { Schema, model } = require('mongoose');

const ChatSchema = Schema({
    members:[{
        type: Schema.Types.ObjectId,
        ref:'User'
    }],
    messages:[{
        type: Schema.Types.ObjectId,
        ref:'Message'
    }]
});

ChatSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();

    return object;
})

module.exports = model('Chat', ChatSchema);