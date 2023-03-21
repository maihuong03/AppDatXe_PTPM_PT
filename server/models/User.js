const mongoose = require('mongoose');

const UsersSchema = mongoose.Schema({
    username: {
        type: String,
        require: true,
        default: '',
    },
   password: {
        type: String,
        require: true,
    },
    money: {
        type: Number,
        default: 0
    },
    phonenumber: {
        type: String
    },
    userType: {
        type: String, 
        default: "Customer",
    },
    count: {
        type: String, 
        default: 0
    }
});

module.exports = mongoose.model('User', UsersSchema);
