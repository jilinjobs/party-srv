'use strict';

const { sep } = require('path');
const root_url = '';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1513267952829_8870';

  // add your config here
  config.middleware = [];

  // 安全配置
  config.security = {
    csrf: {
      // ignoreJSON: true, // 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
      enable: false,
    },
  };

  config.cdn = {
    repos_root_path: `${appInfo.baseDir}${sep}upload`,
    repos_root_url: `${root_url}/upload`,
  };

  return config;
};
