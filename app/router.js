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
};
