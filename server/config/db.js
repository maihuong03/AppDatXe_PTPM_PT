const mongoose = require('mongoose');

async function ConnectDB(mongoUrl) {
    try {
        await mongoose.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('MogoDB connected');
    } catch (error) {
        console.log(error);
    }
}

module.exports = ConnectDB;
