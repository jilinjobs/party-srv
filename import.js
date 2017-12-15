'use strict';

const readline = require('readline');
const fs = require('fs');
const iconv = require('iconv-lite');
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

async function doWork() {
  console.log('正在读取数据...')
  const lines = await new Promise((resolve, reject) => {
    const res = [];
    const rl = readline.createInterface({
      input: fs.createReadStream('data.csv').pipe(iconv.decodeStream('GBK')),
      crlfDelay: Infinity,
    });

    rl.on('line', async line => {
      //console.log(line);
      res.push(line);
    });
    rl.on('close', () => {
      resolve(res);
    });
    rl.on('error', (err) => {
      reject(err);
    });
  });
  console.log(`共读取数据${rows.length}条!`);
  console.log(`正在保存数据...`);
  let client;
  // Use connect method to connect to the Server
  client = await MongoClient.connect(url, { poolSize: 10 });
  const db = client.db(dbName).collection('original');
  for (let i = 0; i < lines.length; i++) {
    const cols = line.split(',');
    const data = fields.reduce(
      (p, c, i) => ({
        ...p,
        [c]: cols[i],
      }), {});

    try {
      const entity = await db..findOne({ sfzh: data.sfzh });
      if (!entity) {
        await db..insertOne(data);
      }
    } catch (err) {
      console.log(`处理错误： ${line}`);
      console.error(err);
    }
  }
  if (client) {
    client.close();
  }
}

await doWork();