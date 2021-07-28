require('dotenv').config()
module.exports = {
    auth: process.env.dappradarAuthorization,
    botToken: process.env.botToken,
    channelId: process.env.channelId
}