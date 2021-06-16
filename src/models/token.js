let mongoose = require('mongoose');

let TokenSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    created_on: {
        type: Date,
        default: Date.now,
    },
    expiry: {
        type: Date,
        default: new Date(Date.now + 1800000) //expires in 30 mins
    }
});

let Token = mongoose.model('Token', TokenSchema);

exports.Token = Token;
