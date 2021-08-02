/* eslint-disable require-unicode-regexp */
const between = (start, end, str) => {
    const regex = new RegExp(`${start}(.*?)${end}`);
    
    return regex.exec(str);
}

const rands = (length) => {
    let result = '';
    const characters = '012345678910abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

const msToTime = (ms) => {
    let seconds = (ms / 1000).toFixed(1);
    let minutes = (ms / (1000 * 60)).toFixed(1);
    let hours = (ms / (1000 * 60 * 60)).toFixed(1);
    let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
    if (seconds < 60) return `${seconds} Seconds`;
    else if (minutes < 60) return `${minutes} Minutes`;
    else if (hours < 24) return `${hours} Hours`;
    
    return `${days} Days`
}

module.exports = {
    between,
    rands,
    msToTime
}