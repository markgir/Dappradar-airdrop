const api = require('./utils/api');
const db = require('./utils/db');
const telegram = require('./utils/telegram');
const caption = require('./utils/caption')
const moment = require('moment-timezone')
const config = require('./config')

const isStarted = (startDate) => moment(startDate) < moment();
const isEnded = (endDate) => moment(endDate) < moment();
const isWinnerPicked = (winnersListingDate) => moment(winnersListingDate) < moment();

(async () => {
    console.log('[>] Get Airdrop data...')
    const airdropList = await api.getAirdrop(config.auth)
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
            console.log('[>] Processing participants data...')
            let genCaption = caption(drop)
            let dropParticipants = await api.getTotalAirdropParticipants(config.auth, drop.id)
            let eventStatus = isStarted(data.startDate) ? isEnded(data.endDate) ? isWinnerPicked(data.winnersListingDate) ? 'Event has ended, check winners list' : 'Event has ended, picking winner...' : 'Join now!' : 'Be patient, event not yet started!'
            const inlineData = {
                id: drop.id,
                status: eventStatus,
                totalParticipants: dropParticipants
            }
            console.log('[>] Processing airdrop data...')
            if (!data.posted && !isStarted(data.startDate) && !isEnded(data.endDate)) {
                const launchDay = moment(data.startDate).format('D') == moment().format('D');
                if (launchDay) { // post new airdrop on launch day
                    telegram.sendPost(data.featuredImgUrl, genCaption, inlineData)
                    .then(async (result) => {
                        result.ok ? console.log(`[POST] ${drop.id}. ${drop.title} | ${drop.tokenAmount / drop.winnersCount} ${drop.tokenName} For ${drop.winnersCount} Winner | ${eventStatus} | Participants: ${dropParticipants}`) : console.log(result.description);
                        drop.posted = true
                        drop.msgId = result.result.message_id
                        await db.update(drop)
                    }).catch((err) => console.error(err));
                }
            }

            if (data.posted && isStarted(data.startDate)) {
                if (!data.noUpdate) {
                    if (!isEnded(data.endDate)) {
                        telegram.updatePost(data.msgId, inlineData)
                            .then((result) => result.ok ? console.log(`[UPDATE] ${drop.id}. ${drop.title} | ${drop.tokenAmount / drop.winnersCount} ${drop.tokenName} For ${drop.winnersCount} Winner | ${eventStatus} | Participants: ${dropParticipants}`) : console.log(result.description))
                            .catch((err) => console.error(err));
                        drop.posted = true
                        drop.started = true
                        await db.update(drop)
                    } else if (isEnded(data.endDate) && isWinnerPicked(data.winnersListingDate) && data.msgId) {
                        telegram.updatePost(data.msgId, inlineData)
                            .then((result) => result.ok ? console.log(`[Last] ${drop.id}. ${drop.title} | ${drop.tokenAmount / drop.winnersCount} ${drop.tokenName} For ${drop.winnersCount} Winner | ${eventStatus} | Participants: ${dropParticipants}`) : console.log(result.description))
                            .catch((err) => console.error(err));
                        drop.ended = true
                        drop.winnerPicked = true
                        drop.noUpdate = true
                        await db.update(drop)
                    }
                }
            }
        } else {
            drop.started = isStarted(drop.startDate)
            drop.ended = isEnded(drop.endDate)
            drop.winnerPicked = isWinnerPicked(drop.winnersListingDate)
            drop.posted = false
            drop.noUpdate = false
            await db.add(drop)

            if (isEnded(drop.endDate)) {
                console.log(`[OLD] ${drop.id}. ${drop.title} | ${drop.tokenAmount / drop.winnersCount} ${drop.tokenName} For ${drop.winnersCount} Winner`)
            } else {
                console.log(`[NEW] ${drop.id}. ${drop.title} | ${drop.tokenAmount / drop.winnersCount} ${drop.tokenName} For ${drop.winnersCount} Winner`)
            }

            if (isStarted(drop.startDate)) {
                if (!isEnded(drop.endDate)) {
                    let genCaption = caption(drop)
                    const inlineData = {
                        id: drop.id,
                        status: isStarted(drop.startDate) ? isEnded(drop.endDate) ? isWinnerPicked(drop.winnersListingDate) ? 'Event has ended, check winners list' : 'Event has ended, picking winner...' : 'Join now!' : 'Be patient, event not yet started!',
                        totalParticipants: await api.getTotalAirdropParticipants(config.auth, drop.id)
                    }
                    
                    telegram.sendPost(drop.featuredImgUrl, genCaption, inlineData)
                    .then(async (result) => {
                        result.ok ? console.log(`[POST] ${drop.id}. ${drop.title} | ${drop.tokenAmount / drop.winnersCount} ${drop.tokenName} For ${drop.winnersCount} Winner`) : console.log(result.description)
                        drop.posted = true
                        drop.msgId = result.result.message_id
                        await db.update(drop)
                    })
                    .catch((err) => console.error(err));
                } else {
                    drop.noUpdate = true
                    await db.add(drop)
                }
            }
        }
    }
})()