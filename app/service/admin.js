'use strict';

const Service = require('egg').Service;

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'party';

class AdminService extends Service {
  async login({ username, password }) {
    let client;
    let res;
    try {
      // Use connect method to connect to the Server
      client = await MongoClient.connect(url, { poolSize: 10 });

      const db = client.db(dbName);
      res = await db.collection('user').findOne({ username });
      if (res) {
        res = (res.password === password) ? 'ok' : '密码错误';
      } else {
        res = '用户不存在';
      }
    } catch (err) {
      console.log(err.stack);
      res = '数据库错误';
    }
    if (client) {
      client.close();
    }
    return res;
  }

  async query({ page, size }) {
    assert(page > 0, '参数page无效');
    assert(size > 0, '参数size无效');
    let client;
    let res;
    let total;
    try {
      // Use connect method to connect to the Server
      client = await MongoClient.connect(url, { poolSize: 10 });

      const db = client.db(dbName);
      total = await db.collection('register').count({ });
      console.log(total);
      res = await db.collection('register').find({ }).sort({ create_time: 1 })
        .skip((page - 1) * size)
        .limit(size)
        .toArray();
      console.log(res);

    } catch (err) {
      console.log(err.stack);
    }
    if (client) {
      client.close();
    }
    return { data: res, total };
  }
}

module.exports = AdminService;
