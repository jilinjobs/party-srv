'use strict';

const Controller = require('egg').Controller;
const moment = require('moment');
const { sep, extname } = require('path');
const fs = require('fs');
const awaitWriteStream = require('await-stream-ready').write;
const sendToWormhole = require('stream-wormhole');

class FilesController extends Controller {

  async upload() {
    const { ctx, app } = this;
    const { id } = ctx.query;
    const stream = await ctx.getFileStream();
    ctx.logger.debug(stream);

    if (!id) {
      console.log('id无效');
      await sendToWormhole(stream);
      ctx.fail(400, '请求参数无效');
      return;
    }

    const rootPath = `${app.config.cdn.repos_root_path}${sep}${id}`;
    const saved = await this.saveFile(rootPath, stream);
    // const res = { status: 'success', url, fileName: file.originalFilename, uid: saved.uid };
    ctx.success({ id: saved.fileName });
  }

  async saveFile(rootPath, stream) {
    const ctx = this.ctx;
    const ext = extname(stream.filename).toLowerCase();
    const name = moment().format('YYYYMMDDHHmmss');
    // TODO: 检查根路径是否存在，不存在则创建
    ctx.logger.debug('rootPath: ', rootPath);
    if (!fs.existsSync(rootPath)) {
      ctx.logger.debug('create dir: ', rootPath);
      fs.mkdirSync(rootPath);
    }
    const filePath = `${rootPath}${sep}`;
    const fileName = `${name}${ext}`;
    const writeStream = fs.createWriteStream(filePath + fileName);
    try {
      await awaitWriteStream(stream.pipe(writeStream));
    } catch (err) {
      await sendToWormhole(stream);
      throw err;
    }

    return { filePath, fileName };
  }

}

module.exports = FilesController;
