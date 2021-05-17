const api = require('./utils/api');
const db = require('./utils/db');
const telegram = require('./utils/telegram');
const caption = require('./utils/caption')
const moment = require('moment-timezone')
const env = require('./config')

const isStarted = (startDate) => moment(startDate) < moment();
const isEnded = (endDate) => moment(endDate) < moment();
const isWinnerPicked = (winnersListingDate) => moment(winnersListingDate) < moment();

(async () => {
    const airdropList = await api.getAirdrop(env.auth)
    if (!Array.isArray(airdropList)) return console.log('failed fetch airdrop list!')
    airdropList.sort((a, b) => b.winnersListingDate - a.winnersListingDate)
    for (let i = 0; i < airdropList.length; i++) {
        const drop = airdropList[i];
        delete drop.participants
        const exist = await db.isExist({ id: drop.id })
        if (exist) {
            const data = await db.find({ id: drop.id })
            drop.started = isStarted(data.startDate)
            drop.ended = isEnded(data.endDate)
            drop.winnerPicked = isWinnerPicked(data.winnersListingDate)
            await db.update(drop)

            let genCaption = caption(drop)
            let dropParticipations = await api.getAirdropParticipants(env.auth, drop.id)
            let eventStatus = isStarted(data.startDate) ? isEnded(data.endDate) ? isWinnerPicked(data.winnersListingDate) ? 'Event has ended, check winners list' : 'Event has ended, picking winner...' : 'Join now!' : 'Be patient, event not yet started!'
            const inlineData = {
                id: drop.id,
                status: eventStatus,
                totalParticipants: dropParticipations
            }

            if (!data.posted && !isStarted(data.startDate) && !isEnded(data.endDate)) {
                const launchDay = moment(data.startDate).format('D') == moment().format('D');
                if (launchDay) { // post new airdrop on launch day
                    const sendnews = await telegram.sendPost(data.featuredImgUrl, genCaption, inlineData)
                        (sendnews.ok) ? console.log(`[POST] ${drop.id}. ${drop.title} | ${drop.tokenAmount / drop.winnersCount} ${drop.tokenName} For ${drop.winnersCount} Winner | ${eventStatus}`) : console.log(sendnews.description);
                    drop.posted = true
                    drop.msgId = sendnews.result.message_id
                    await db.update(drop)
                }
            }

            if (!drop.noUpdate && data.posted && isStarted(data.startDate)) {
                if (!isEnded(data.endDate)) {
                    const updateNews = await telegram.updatePost(data.msgId, inlineData)
                        (updateNews.ok) ? console.log(`[UPDATE] ${drop.id}. ${drop.title} | ${drop.tokenAmount / drop.winnersCount} ${drop.tokenName} For ${drop.winnersCount} Winner | ${eventStatus}`) : console.log(updateNews.description);
                    drop.posted = true
                    drop.started = true
                    await db.update(drop)
                } 
                
                if (isEnded(data.endDate) && isWinnerPicked(data.winnersListingDate) && data.msgId) {
                    const updateLast = await telegram.updatePost(data.msgId, inlineData)
                        (updateLast.ok) ? console.log(`[Last] ${drop.id}. ${drop.title} | ${drop.tokenAmount / drop.winnersCount} ${drop.tokenName} For ${drop.winnersCount} Winner | ${eventStatus}`) : console.log(updateLast.description);
                    drop.ended = true
                    drop.winnerPicked = true
                    drop.noUpdate = true
                    await db.update(drop)
                }
            }
        } else {
            drop.started = isStarted(drop.startDate)
            drop.ended = isEnded(drop.endDate)
            drop.winnerPicked = isWinnerPicked(drop.winnersListingDate)
            drop.posted = false
            drop.noUpdate = false
            await db.add(drop)

            (isEnded(drop.endDate)) ? console.log(`[OLD] ${drop.id}. ${drop.title} | ${drop.tokenAmount / drop.winnersCount} ${drop.tokenName} For ${drop.winnersCount} Winner`): console.log(`[NEW] ${drop.id}. ${drop.title} | ${drop.tokenAmount / drop.winnersCount} ${drop.tokenName} For ${drop.winnersCount} Winner`)

            if (isStarted(drop.startDate)) {
                if (!isEnded(drop.endDate)) {
                    let genCaption = caption(drop)
                    const inlineData = {
                        id: drop.id,
                        status: isStarted(drop.startDate) ? isEnded(drop.endDate) ? isWinnerPicked(drop.winnersListingDate) ? 'Event has ended, check winners list' : 'Event has ended, picking winner...' : 'Join now!' : 'Be patient, event not yet started!',
                        totalParticipants: await api.getAirdropParticipants(env.auth, drop.id)
                    }
                    const sendnews = await telegram.sendPost(drop.featuredImgUrl, genCaption, inlineData)
                    if (!sendnews) return console.log(sendnews);
                    drop.posted = true
                    drop.msgId = sendnews.result.message_id
                    await db.update(drop)
                    console.log(`[POST] ${drop.id}. ${drop.title} | ${drop.tokenAmount / drop.winnersCount} ${drop.tokenName} For ${drop.winnersCount} Winner`)
                } else {
                    drop.noUpdate = true
                    await db.add(drop)
                }
            }
        }
    }
})()