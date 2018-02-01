'use strict';

const Controller = require('egg').Controller;
const fs = require('fs');
const { sep } = require('path');
const moment = require('moment');

class HomeController extends Controller {
  async index() {
    this.ctx.body = 'hi, egg';
  }
  // POST
  async login() {
    const res = await this.service.admin.login(this.ctx.request.body);
    if (res === 'ok') {
      const groups = await this.service.admin.groups();
      this.ctx.success('登录成功', { groups });
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

  // GET
  async exportCsv() {
    const { ctx } = this;
    const res = await this.service.admin.exportCsv();
    if (res) {
      ctx.set('content-type', 'text/csv');
      ctx.set('content-disposition', 'attachment;filename=' + res.name);
      ctx.body = fs.createReadStream(`${res.path}${sep}${res.name}`);
    } else {
      this.ctx.fail(500, '导出数据失败');
    }
  }

  // GET
  async exportXlsx() {
    const { ctx } = this;
    const res = await this.service.admin.exportXlsx();
    if (res) {
      ctx.set('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      ctx.set('content-disposition', 'attachment;filename=' + res.name);
      ctx.body = fs.createReadStream(`${res.path}${sep}${res.name}`);
    } else {
      this.ctx.fail(500, '导出数据失败');
    }
  }

  // GET
  async exportImg() {
    const { ctx } = this;
    const name = moment().format('YYYYMMDDHHmmss') + '.zip';
    const res = await this.service.admin.exportImg(ctx.request.query);
    if (res) {
      ctx.set('content-type', 'text/csv');
      ctx.set('content-disposition', 'attachment;filename=' + name);
      ctx.body = res;
    } else {
      this.ctx.fail(500, '导出数据失败');
    }
  }

  // POST
  async group() {
    const res = await this.service.admin.saveGroup(this.ctx.request.body);
    if (res) {
      this.ctx.success(res);
    } else {
      this.ctx.fail(500, '设置分组失败');
    }
  }
}

module.exports = HomeController;
