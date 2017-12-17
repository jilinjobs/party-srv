'use strict';

const tar = require('tar');

async function doWork() {
  await tar.c(
    {gzip: false, file: 'test.tar'},
    ['data.csv', 'data_err.csv']
  );
  console.log('tar完成！');
}


doWork();
