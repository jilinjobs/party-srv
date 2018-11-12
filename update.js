'use strict';

const readline = require('readline');
const fs = require('fs');
const iconv = require('iconv-lite');
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://192.168.1.170:27017';

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

async function doWork() {
  const args = process.argv.splice(2);
  if (args.length === 0) {
    console.log('请指定要导入的文件名:\n node update.js xxxx.csv');
    return;
  }

  console.log(`正在读取${args[0]}数据...`);
  const lines = await new Promise((resolve, reject) => {
    const res = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(args[0]).pipe(iconv.decodeStream('GBK')),
      crlfDelay: Infinity,
    });

    rl.on('line', async line => {
      // console.log(line);
      res.push(line);
    });
    rl.on('close', () => {
      resolve(res);
    });
    rl.on('error', err => {
      reject(err);
    });
  });
  console.log(`共读取数据${lines.length}条!`);
  console.log('正在保存数据...');
  // Use connect method to connect to the Server
  const client = await MongoClient.connect(url, { poolSize: 10 });
  const db1 = client.db(dbName).collection('original');
  const db2 = client.db(dbName).collection('register');
  const create_time = new Date();
  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(',');
    const data = fields.reduce(
      (p, c, i) => ({
        ...p,
        [c]: cols[i],
      }), { create_time });

    try {
      console.log(data.xh, '-', data.sfzh);
      data.sfzh = data.sfzh.toUpperCase();
      await db1.update({ sfzh: data.sfzh, xm: data.xm }, { $set: { xh: data.xh } });
      await db2.update({ sfzh: data.sfzh, xm: data.xm }, { $set: { xh: data.xh } });
      count++;
    } catch (err) {
      console.log(`处理错误： ${line}`);
      console.error(err);
    }
  }
  if (client) {
    await client.close();
  }
  console.log(`导入完成，共导入${count}条数据！`);
}

doWork();
