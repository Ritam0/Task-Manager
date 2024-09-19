const mongoose = require('mongoose');

const userModel = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    tasks: [
        {
            title: { type: String, required: true },
            description: { type: String, required: true },
            startDateTime: { type: Date, required: true },
            endDateTime: { type: Date, required: true },
            imgurl: { type: String, required: true },
        }
    ]
});

module.exports = mongoose.model('User', userModel);
