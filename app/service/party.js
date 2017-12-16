'use strict';

const Service = require('egg').Service;

const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'party';

const fields = [
  'xh',
  'xm',
  'szdzb',
  'sfzh',
  'xb',
  'mz',
  'csrq',
  'xl',
  'rylb',
  'rdrq',
  'zzrq',
  'gzgw',
  'sjh',
  'gddh',
  'jtzz',
  'djzt',
  'sfsl',
  'slrq',
  'sfld',
  'wclx',
];
const fields2 = [ ...fields, 'qwdmc', 'qwdlxr', 'qwdlxdh' ];

class PartyService extends Service {
  async queryOriginal({ sfzh }) {
    let client;
    let res;
    try {
      // Use connect method to connect to the Server
      client = await MongoClient.connect(url, { poolSize: 10 });

      const db = client.db(dbName);
      sfzh = sfzh.toUpperCase();
      res = await db.collection('original').findOne({ sfzh });
      if (res) {
        const add = await db.collection('register').findOne({ id: res._id.toString() });
        console.log('add' + add);
        console.log(res._id.toString());
        if (add) {
          res = fields2.reduce(
            (p, c) => ({
              ...p,
              [c]: add[c],
            }), res);
        }
      }
    } catch (err) {
      console.log(err.stack);
    }
    if (client) {
      client.close();
    }
    return res;
  }

  async saveRegister(type, params) {
    const { _id } = params;
    const data = fields2.reduce(
      (p, c) => ({
        ...p,
        [c]: params[c],
      }), { id: _id, create_time: new Date(), type: type || 0 });

    let client;
    let res;
    try {
      // Use connect method to connect to the Server
      client = await MongoClient.connect(url, { poolSize: 10 });

      const db = client.db(dbName);
      res = await db.collection('register').findOneAndUpdate({ id: _id }, data, { returnOriginal: false, upsert: true });
      await db.collection('register_log').insert(data);
    } catch (err) {
      console.log(err.stack);
    }
    if (client) {
      client.close();
    }
    return res;
  }
}

module.exports = PartyService;
