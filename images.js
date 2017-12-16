'use strict';

const readline = require('readline');
const fs = require('fs');
const iconv = require('iconv-lite');
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'party';

async function doWork() {
  // Use connect method to connect to the Server
  const client = await MongoClient.connect(url, { poolSize: 10 });
  const db = client.db(dbName).collection('register');
  const rs = await db.find({ image: undefined }).toArray();
  for (let i = 0; i < rs.length; i++) {
    const image = imageName(rs[i].id);
    await db.findOneAndUpdate({ id: rs[i].id }, {$set: { image }});
    console.log(`${rs[i].id}/${image}`);
  }
  if (client) {
    client.close();
  }
  console.log('导入完成！');
}

function imageName(id) {
  let files = fs.readdirSync(`upload/${id}/`);
  files = files.sort((a, b) => {
    if (a > b) { return -1; } else if (a < b) { return 1; }
    return 0;
  });
  return files[0];
}

doWork();
