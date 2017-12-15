'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    this.ctx.body = 'hi, egg';
  }
  // GET
  async query() {
    const res = await this.service.party.queryOriginal(this.ctx.query);
    if (res) {
      this.ctx.success({ data: res });
    } else {
      this.ctx.fail(404, '党员信息不存在，请确认身份证号是否有误。如还有问题，请联系工作人员进行处理。');
    }
  }
  // POST
  async submit() {
    const { type } = this.ctx.query;
    const res = await this.service.party.saveRegister(type, this.ctx.request.body);
    if (res) {
      this.ctx.success({ data: res });
    } else {
      this.ctx.fail(404, '保存党员信息失败。');
    }
  }
}

module.exports = HomeController;
