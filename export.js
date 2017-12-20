'use strict';

const { sep } = require('path');
const fs = require('fs');
const jszip = require('jszip');
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://192.168.1.170:27017';

// Database Name
const dbName = 'party';

async function doWork() {
  // Use connect method to connect to the Server
  const client = await MongoClient.connect(url, { poolSize: 10 });
  const db = client.db(dbName).collection('register');
  const rs = await db.find({}).toArray();
  const files = rs.map((p, i) => ({ file: `upload${sep}${p.id}${sep}${p.image}`, name: `${(10001 + i).toString().substr(1)}.jpg` }));
  console.log(files);
  await zipFiles(files);
  if (client) {
    client.close();
  }
  console.log('导出完成！');
}

async function zipFiles(files) {
  const zip = new jszip();
  zip.file('Hello.txt', 'Hello World\n');
  files.forEach(p => {
    zip.file(p.name, fs.createReadStream(p.file));
  });
  return new Promise((resolve, reject) => {
    try {
      zip.generateNodeStream({ streamFiles: true })
        .pipe(fs.createWriteStream('out.zip'))
        .on('finish', function() {
        // JSZip generates a readable stream with a "end" event,
        // but is piped here in a writable stream which emits a "finish" event.
          console.log('out.zip written.');
          resolve('ok');
        });
    } catch (err) {
      reject(err);
    }
  });
}


doWork();
