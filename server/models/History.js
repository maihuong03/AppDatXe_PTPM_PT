const mongoose = require('mongoose');

const HistorySchema = mongoose.Schema({
    startAt: {
        type: Date,
    },
    endAt: {
        type:Date
    },
    startLocation: {
        type: String,
    },
    endLocation: {
        type: String,
    },
    price: {
        type: Number
    },
    distance: {
        type: Number,
    },
    userId: {
        type: Number,
    },
    driverId: {
        type: Number,
    },
    status: {
        type: String,
    }
});

module.exports = mongoose.model('History', HistorySchema);
