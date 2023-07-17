const wroutes = require('express').Router();
const wfrontcontroller = require('../frontcontrollers/wfrontcontroller');
const path = require('path');


wroutes.post('/wclient/uploadFWFile', wfrontcontroller.wUploadFWFile);

wroutes.post('/wclient/insertOrUpdateProductInfo',wfrontcontroller.wInsertOrUpdateProductInfo);

wroutes.post('/wclient/getLatestProductInfo',wfrontcontroller.wGetLatestProductInfo);


module.exports = wroutes;