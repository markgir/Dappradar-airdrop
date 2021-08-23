/* eslint-disable no-param-reassign */
const fetch = require('node-fetch');
const rfetch = require('node-fetch-retry');
const { between } = require('./string')

let defaultOptions = (method, auth = null, data = null) => ({
    retry: 5,
    pause: 500,
    method,
    headers: {
        accept: 'application/json, */*',
        authority: 'auth.dappradar.com',
        authorization: auth,
        'cache-control': 'no-cache',
        'Content-Type': 'application/json',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36 Edg/91.0.864.37',
        origin: 'https://auth.dappradar.com',
        referer: 'https://auth.dappradar.com/'
    },
    body: data
})

const mailGeneratorOptions = (email) => ({
    retry: 5,
    pause: 1500,
    headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'accept-encoding': 'gzip, deflate, br',
        cookie: `embx=[${email}]; surl=${email.split('@')[1]}/${email.split('@')[0]}`,
        'upgrade-insecure-requests': 1,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36 Edg/91.0.864.37'
    }
})

const getAirdrop = (authorization) => rfetch('https://backoffice.dappradar.com/airdrops?page=1&itemsPerPage=100', defaultOptions('GET', `Bearer ${authorization}`))
    .then((response) => response.json())
    .then((result) => result['hydra:member'])
    .catch((err) => err)

const joinAirdrop = (authorization, id, wallet, email) => fetch('https://backoffice.dappradar.com/participants', defaultOptions('POST', `Bearer ${authorization}`, JSON.stringify({ 'airdrop': `/airdrops/${id}`, wallet, email })))
    .then((response) => response.json())
    .then((result) => result)
    .catch((err) => err);

const getTotalAirdropParticipants = (authorization, id) => fetch(`https://backoffice.dappradar.com/airdrops/${id}/participants`, defaultOptions('GET', `Bearer ${authorization}`))
    .then((response) => response.json())
    .then((result) => result['hydra:totalItems'])
    .catch((err) => err)

const getAirdropParticipants = (authorization, id, page = 1, itemsPerPage = 10000) => rfetch(`https://backoffice.dappradar.com/airdrops/${id}/participants?page=${page}&itemsPerPage=${itemsPerPage}`, defaultOptions('GET', `Bearer ${authorization}`))
    .then((response) => response.json())
    .then((result) => result)
    .catch((err) => err);

const getAirdropWinner = (authorization, id) => fetch(`https://backoffice.dappradar.com/airdrops/${id}/winners`, defaultOptions('GET', `Bearer ${authorization}`))
    .then((response) => response.json())
    .then((result) => result)
    .catch((err) => err)

const getIdentity = (authorization) => fetch('https://auth.dappradar.com/apiv4/users/identify', defaultOptions('GET', `Bearer ${authorization}`))
    .then((response) => response.json())
    .then((result) => result)
    .catch((err) => err)

const getConfirmToken = (link) => fetch(link, { redirect: 'follow' })
    .then((response) => response.url)
    .catch((err) => err);

const confirmTaC = (token) => fetch('https://auth.dappradar.com/apiv4/users/tac', defaultOptions('POST', `Bearer ${token}`, JSON.stringify({ 'tac': true, 'newsletters': true, 'offers': true })))
    .then((response) => response.json())
    .then((result) => result)
    .catch((err) => err)

const getNonce = (address, token) => fetch(`https://auth.dappradar.com/apiv4/users/nonce/${address}`, defaultOptions('GET', `Bearer ${token}`))
    .then((response) => response.json())
    .then((result) => result)
    .catch((err) => err)

const signAddress = (address, sign, nonce, token) => fetch(`https://auth.dappradar.com/apiv4/users/sign_metamask/${address}`, defaultOptions('POST', `Bearer ${token}`, JSON.stringify({ 'signature': sign, 'message': `I am signing my one-time nonce: ${nonce}` })))
    .then((response) => response.json())
    .then((result) => result)
    .catch((err) => err)

const names = () => fetch('https://api.namefake.com/indonesian-indonesia/')
    .then((response) => response.json())
    .then((result) => {
        const name = result.name.split(' ') // split first name and last name 

        return `${name[0]} ${name[1]}` // return just first and last name
    })
    .catch((err) => err)
    
const register = (email, password) => fetch('https://auth.dappradar.com/apiv4/users/register', defaultOptions('POST', '', JSON.stringify({ email, password })))
    .then((response) => response.json())
    .then((result) => result)
    .catch((err) => err) 

const getEmails = (email, retry) => rfetch('https://generator.email/inbox1/', mailGeneratorOptions(email))
        .then((res) => res.text())
        .then((text) => {
            const data = between('<a href="', '" style="display: block; text-align: center;', text);
            console.log(`${retry === 1 ? `${retry}st` : retry === 2 ? `${retry}nd` : retry === 3 ? `${retry}rd` : `${retry}th`} try to get confirmation link...`)
            if (retry) retry += 1
            if (retry >= 10) return false
            if (!Array.isArray(data)) return getEmails(email, retry)

            return data[1];
        })
        .catch((err) => err);


module.exports = {
    getAirdrop,
    joinAirdrop,
    getAirdropParticipants,
    getTotalAirdropParticipants,
    getAirdropWinner,
    getIdentity,
    getConfirmToken,
    confirmTaC,
    getNonce,
    signAddress,
    names,
    register,
    getEmails
};