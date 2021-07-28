const fetch = require('node-fetch')
const FormData = require('form-data');
const config = require('../config')

const sendPost = (bannerUrl, caption, data) => new Promise((resolve, reject) => {
    const body = new FormData()
    body.append('photo', bannerUrl);
    body.append('caption', caption);
    body.append('reply_markup', JSON.stringify({
        'inline_keyboard': [
            [
                {
                    'text': data.status,
                    'url': `https://dappradar.com/hub/airdrops/${data.id}`
                }
            ],
            [
                {
                    'text': `Total Participant: ${data.totalParticipants}`,
                    'url': `https://dappradar.com/hub/airdrops/${data.id}`
                }
            ]
        ]
    }));
    
    fetch(`https://api.telegram.org/bot${config.botToken}/sendPhoto?chat_id=${config.channelId}&parse_mode=html&disable_web_page_preview=true`, { method: 'POST', body })
    .then((response) => response.json())
    .then((result) => resolve(result))
    .catch((err) => reject(err))
})

const updatePost = (msgId, data) => new Promise((resolve, reject) => {
    const body = new FormData()
    body.append('reply_markup', JSON.stringify({
        'inline_keyboard': [
            [
                {
                    'text': data.status,
                    'url': `https://dappradar.com/hub/airdrops/${data.id}`
                }
            ],
            [
                {
                    'text': `Total Participant: ${data.totalParticipants}`,
                    'url': `https://dappradar.com/hub/airdrops/${data.id}`
                }
            ]
        ]
    }));

    fetch(`https://api.telegram.org/bot${config.botToken}/editMessageReplyMarkup?chat_id=${config.channelId}&message_id=${msgId}`, { method: 'POST', body })
    .then((response) => response.json())
    .then((result) => resolve(result))
    .catch((err) => reject(err))
})

module.exports = {
    sendPost,
    updatePost
}