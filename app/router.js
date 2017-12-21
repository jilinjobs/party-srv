'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/api/query', controller.home.query);
  router.post('/api/submit', controller.home.submit);
  router.all('/api/upload', controller.files.upload);
  router.post('/admin/login', controller.admin.login);
  router.post('/admin/query', controller.admin.query);
  router.get('/admin/image/:id/:name', controller.admin.image);
  router.get('/admin/exportCsv', controller.admin.exportCsv);
  router.get('/admin/exportXlsx', controller.admin.exportXlsx);
  router.get('/admin/exportImg', controller.admin.exportImg);
};
