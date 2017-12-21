'use strict';

const { sep } = require('path');
const fs = require('fs');
const jszip = require('jszip');
const MongoClient = require('mongodb').MongoClient;
const xlsx = require('xlsx');

// Connection URL
const url = 'mongodb://127.0.0.1:27017';

// Database Name
const dbName = 'party';

const fields = [
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

async function exportXlsx() {
  // Use connect method to connect to the Server
  const client = await MongoClient.connect(url, { poolSize: 10 });
  const db = client.db(dbName).collection('register');
  let rs = await db.find({}).toArray();
  if (client) {
    client.close();
  }
  rs = rs.map((r, i) => fields.reduce(
    (p, c) => ({
      ...p,
      [c[1]]: r[c[0]],
    }), { 编号: i + 1 }));

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(rs);
  xlsx.utils.book_append_sheet(wb, ws);
  xlsx.writeFile(wb, 'export/test.xlsx');
  console.log('导出完成！');
}


exportXlsx();
