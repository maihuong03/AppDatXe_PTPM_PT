const {PORT, MONGO_URL} = process.env

module.exports = {
    PORT: PORT || 3000,
    MONGO_URL: MONGO_URL || "mongodb+srv://aaaa:aaaa@main.cdp6buy.mongodb.net/main?retryWrites=true&w=majority"
}