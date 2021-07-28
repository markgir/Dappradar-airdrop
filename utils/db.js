/* eslint-disable no-promise-executor-return */
const low = require('lowdb');
const path = require('path');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(path.join(__dirname, '../db/airdrop.json'));
const db = low(adapter);

db.defaults({ data: [] }).write();

const get = () => db.get('data').value();

const find = (obj) => db.get('data').find(obj).value();

const isExist = (obj) => db.get('data').some(obj).value();

const add = (obj) => new Promise((resolve, reject) => {
    const exist = isExist({ id: obj.id });
    if (exist) return reject('Already Exist');
    const insert = db.get('data').push(obj).write();
    if (!insert) return reject(insert);
    resolve(insert)
});

const update = (obj) => new Promise((resolve, reject) => {
    const exist = isExist({ id: obj.id });
    if (!exist) return reject('Data Not Found');
    const assign = db.get('data').find({ id: obj.id }).assign(obj).write();
    if (!assign) return reject(assign);
    resolve(assign)
});

const remove = (obj) => new Promise((resolve, reject) => {
    const exist = isExist({ id: obj.id });
    if (!exist) return reject('Data Not Found');
    const removes = db.get('data').remove(obj).write();
    if (!removes) return reject(removes);
    resolve(removes)
});

module.exports = {
    add,
    find,
    get,
    isExist,
    remove,
    update
};