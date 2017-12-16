'use strict';

const Controller = require('egg').Controller;
const fs = require('fs');
const { sep } = require('path');

class HomeController extends Controller {
  async index() {
    this.ctx.body = 'hi, egg';
  }
  // POST
  async login() {
    const res = await this.service.admin.login(this.ctx.request.body);
    if (res === 'ok') {
      this.ctx.success('登录成功');
    } else {
      this.ctx.fail(403, res || '登录失败');
    }
  }
  // POST
  async query() {
    const res = await this.service.admin.query(this.ctx.request.body);
    if (res) {
      this.ctx.success(res);
    } else {
      this.ctx.fail(500, '查询数据失败');
    }
  }

  // GET
  async image() {
    const { ctx } = this;
    const { id, name } = ctx.params;
    ctx.set('content-type', 'image/jpeg');
    ctx.body = fs.createReadStream(`${ctx.app.baseDir}${sep}upload${sep}${id}${sep}${name}`);
  }
}

module.exports = HomeController;
