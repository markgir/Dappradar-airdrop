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

module.exports = {
    between,
    rands
}