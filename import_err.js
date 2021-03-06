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
  console.log('正在读取数据...');
  const lines = await new Promise((resolve, reject) => {
    const res = [];
    const rl = readline.createInterface({
      input: fs.createReadStream('data.csv').pipe(iconv.decodeStream('GBK')),
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
  const writable = fs.createWriteStream('data_err.csv');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(',');
    const data = fields.reduce(
      (p, c, i) => ({
        ...p,
        [c]: cols[i],
      }), {});
    if (data.sfzh.startsWith('000000')) {
      writable.write(iconv.encode(line,"gbk"));
      writable.write('\n');
    }
  }
}

doWork();
