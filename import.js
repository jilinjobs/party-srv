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

const rl = readline.createInterface({
  input: fs.createReadStream('data.csv').pipe(iconv.decodeStream('GBK')),
  crlfDelay: Infinity,
});

rl.on('line', async line => {
  console.log(line);
  const cols = line.split(',');
  const data = fields.reduce(
    (p, c, i) => ({
      ...p,
      [c]: cols[i],
    }), { });

  let client;
  try {
    // Use connect method to connect to the Server
    client = await MongoClient.connect(url, { poolSize: 10 });

    const db = client.db(dbName);
    await db.collection('original').insertOne(data);
  } catch (err) {
    console.log(err.stack);
  }
  if (client) {
    client.close();
  }
});
