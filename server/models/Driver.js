const mongoose = require('mongoose');

const DriverSchema = mongoose.Schema({
    username: {
        type: String,
        require: true,
        default: '',
    },
    count: {
        type: Number,
        default: 0
    },
    money: {
        type: Number,
        default: 0
    },
    phonenumber: {
        type: String
    }
});

module.exports = mongoose.model('Driver', DriverSchema);
