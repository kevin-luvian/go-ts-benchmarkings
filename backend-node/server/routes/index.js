var express = require('express');
const { success } = require('../../internal/app/response');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('index');
});

router.get('/ping', function(req, res, next) {
  success(res, Date.now(), 'noice');
});

module.exports = router;