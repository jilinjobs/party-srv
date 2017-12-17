'use strict';

const Service = require('egg').Service;

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const { sep } = require('path');
const moment = require('moment');
const jszip = require('jszip');
const iconv = require('iconv-lite');
const fs = require('fs');

moment.locale('zh-cn');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'party';

const fields = [
  [ 'bh', '编号' ],
  [ 'xh', '序号' ],
  [ 'xm', '姓名' ],
  [ 'szdzb', '所在党支部' ],
  [ 'sfzh', '公民身份证号' ],
  [ 'xb', '性别' ],
  [ 'mz', '民族' ],
  [ 'csrq', '出生日期' ],
  [ 'xl', '学历' ],
  [ 'rylb', '人员类别' ],
  [ 'rdrq', '加入党组织日期' ],
  [ 'zzrq', '转为正式党员日期' ],
  [ 'gzgw', '工作岗位' ],
  [ 'sjh', '手机号' ],
  [ 'gddh', '固定电话' ],
  [ 'jtzz', '家庭住址' ],
  [ 'djzt', '党籍状态' ],
  [ 'sfld', '是否为流动党员' ],
  [ 'wclx', '外出流向' ],
  [ 'type', '是否迁走' ],
  [ 'qwdmc', '迁往地党组织名称' ],
  [ 'qwdlxr', '迁往地联系人' ],
  [ 'qwdlxdh', '迁往地联系电话' ],
  [ 'create_time', '登记时间' ],
];

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
      // console.log(res);

    } catch (err) {
      console.log(err.stack);
    }
    if (client) {
      client.close();
    }
    return { data: res, total };
  }

  async exportCsv() {
    const { app } = this;
    let client;
    let rs;
    const name = moment().format('YYYYMMDDHHmmss') + '.csv';
    const path = `${app.baseDir}${sep}export${sep}`;

    try {
      // Use connect method to connect to the Server
      client = await MongoClient.connect(url, { poolSize: 10 });

      const db = client.db(dbName);
      rs = await db.collection('register').find({}).sort({ create_time: 1 })
        .toArray();
      // console.log(rs);

    } catch (err) {
      console.log(err.stack);
      return null;
    }
    if (client) {
      client.close();
    }

    return new Promise((resolve, reject) => {
      const writable = fs.createWriteStream(path + name);
      const line = fields.map(p => p[1]).join(',');
      writable.write(iconv.encode(line, 'gbk'));
      writable.write('\n');
      for (let i = 0; i < rs.length; i++) {
        const row = rs[i];
        row.create_time = moment(row.create_time).format('lll');
        row.bh = (10001 + i).toString().substr(1);
        const line = fields.map(p => row[p[0]]).join(',');
        // console.log(line);
        writable.write(iconv.encode(line, 'gbk'));
        writable.write('\n');
      }
      writable.end();
      writable.on('close', () => {
        resolve({ path, name });
      });
      writable.on('error', err => {
        reject(err);
      });
    });

  }

  async exportImg({ page, size }) {
    let client;
    let rs;
    let offset = 0;
    if (page && size) offset = (page - 1) * size;

    console.log(`${page} ${size} ${offset}`);

    try {
      // Use connect method to connect to the Server
      client = await MongoClient.connect(url, { poolSize: 10 });

      const db = client.db(dbName);
      if (page && size) {
        rs = await db.collection('register').find({ }).sort({ create_time: 1 })
          .skip(offset)
          .limit(Number(size))
          .toArray();
      } else {
        rs = await db.collection('register').find({}).sort({ create_time: 1 })
          .toArray();
      }
      console.log(rs.length);

    } catch (err) {
      console.log(err.stack);
      return null;
    }
    if (client) {
      client.close();
    }

    const files = rs.map((p, i) => ({ file: `upload${sep}${p.id}${sep}${p.image}`, name: `${(10001 + offset + i).toString().substr(1)}.jpg` }));
    const zip = new jszip();
    files.forEach(p => {
      zip.file(p.name, fs.createReadStream(p.file));
    });
    return zip.generateNodeStream({ streamFiles: true });
  }
}

module.exports = AdminService;
