var clientDBOp = require('../db/clientDBOperations');
var path = require('path');

exports.wUploadFWFile = function(req,res){
    clientDBOp.dbUploadFWFile(req,res);
};

exports.wInsertOrUpdateProductInfo = function(req,res){
    clientDBOp.dbInsertOrUpdateProductInfo(req,res);
};

exports.wGetLatestProductInfo = function(req,res){
    clientDBOp.dbGetLatestProductInfo(req,res);
};

