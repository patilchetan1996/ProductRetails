var db = require('./dbConnect');
var pool = db.getPool();
const bcrypt = require('bcryptjs');
var path = require("path");

var multer = require('multer');

var vLoggerModule = require('../vLogger');
const vLogger = vLoggerModule.getLogger();
const vMsgFormatter = vLoggerModule.formatMessage;
const {CVmhAdditionalLogInfo, startIndividualPerfParamCheck} = vLoggerModule;


var storage = multer.diskStorage({

    destination: function (req, file, cb) {
        let strProjectRootFullPath = path.join(__dirname, '../../../../'); 
        let strDeviceSoftwareDirFullPath = strProjectRootFullPath + "sufalamclient/src/Component/IMAGES";
        cb(null, strDeviceSoftwareDirFullPath)
        
    },

    filename: function (req, file, cb) {
        cb(null, new Date().getFullYear() +'' 
                        + (((new Date().getMonth()+1) < 10 ) ? 0 +'' +(new Date().getMonth()+1) : (new Date().getMonth()+1) ) +''
                        + ((new Date().getDate() < 10 ) ? 0 +'' +new Date().getDate() : new Date().getDate() ) +''
                        + ((new Date().getHours() < 10 ) ? 0 +'' +new Date().getHours() : new Date().getHours() ) +''
                        + ((new Date().getMinutes() < 10 ) ? 0 +'' +new Date().getMinutes() : new Date().getMinutes() ) +''
                        + ((new Date().getSeconds() < 10 ) ? 0 +'' +new Date().getSeconds() : new Date().getSeconds() ) +'_' 
                        + file.originalname)
    }
});

var upload = multer({ storage: storage }).single('ProductImage');

// const mathOperations = {
//     sum: function(a,b) {
//     return a + b;
// },

// module.exports =  


module.exports = {
    mathOperations: function(a,b) {
        return a + b;
    },

    dbUploadFWFile: function(req, res, err) {
        const STR_TAG_FUNC = "dbUploadFWFile";
        const objAdditionalLogInfo = new CVmhAdditionalLogInfo({OrgReqObj: req, TagFunction: STR_TAG_FUNC});

        upload(req,res,function(err) {
            if(err) {
                strMsg = `Error while uploading firmware binary file.`;
                res.send({code: 'UPLOAD_ERROR', failuremessage: strMsg});
                vLogger.error(vMsgFormatter(objAdditionalLogInfo, STR_TAG_FUNC, strMsg));
                return; // No further processing required
            } else {
                strMsg = `Success while uploading firmware binary file.`;
                res.send({code: 'SUCCESS', successmessage: strMsg, uploadedFile: req.file});
                vLogger.info( vMsgFormatter(objAdditionalLogInfo, STR_TAG_FUNC, strMsg) );
                return; // No further processing required
                
                // File uploaded to local disk successfully. Now transfer this file to S3 bucket.
                // module.exports.uploadFWFileIntoS3Bucket(req.file, req, res);
            }
        });
    },

    dbInsertOrUpdateProductInfo:function(req,res) {

        const STR_TAG_FUNC = "dbInsertOrUpdateProductInfo";
        const objAdditionalLogInfo = new CVmhAdditionalLogInfo({OrgReqObj: req, TagFunction: STR_TAG_FUNC});

        // let image = req.file.buffer.toString('base64');

        // console.log("image 7560 = ", image);

        let strMsg = '';
        let reqBody = req.body;
    
        if( reqBody == null ||
            ("ProductNameToSave" in reqBody) == false || 
            reqBody.ProductNameToSave == null || reqBody.ProductNameToSave.length <= 0  ||
            ("PricePerUnitToSave" in reqBody) == false || 
            reqBody.PricePerUnitToSave == null || reqBody.PricePerUnitToSave.length <= 0
        ) {
            strMsg = `Request JSON missing or Form does not contains Data.`;  
            res.send({code: 'REQ_PARAMS_MISSING', failuremessage: strMsg});
            vLogger.error( vMsgFormatter(objAdditionalLogInfo, STR_TAG_FUNC, strMsg) );
            return; // No further processing required
        }

        const ProdCode = reqBody.ProdCode;
        const ProductNameToSave = reqBody.ProductNameToSave;
        const PricePerUnitToSave = reqBody.PricePerUnitToSave;
        let FileName = reqBody["FileName"];
        let FilePath = reqBody["FilePath"];
    
        // let sqlQuery = 
        //     `Call vpInsertOrUpdateProductInfo(${ProdCode}, '${ProductLineToSave}', '${ProductNameCodeToSave}', '${ProductNameToSave}', '${ProductDescriptionToSave}', '${BasicUnitToSave}', ${PricePerUnitToSave}, ${TaxPrcntPerUnitToSave}, '${SequenceIDToSave}', '${UserID}')`;

        let sqlQuery = '';

        if(ProdCode == null){
            sqlQuery = `INSERT INTO sProducts(ProductName, ImageLocn, Image, PricePerUnitINR, LastModifiedTime)
                            VALUES('${ProductNameToSave}', '${FilePath}', '${FileName}', ${PricePerUnitToSave}, DATE_FORMAT(UTC_TIMESTAMP(), '%Y-%m-%d %H:%i:%S')
                        )`;
        } else {
            sqlQuery = `Update sProducts
                        SET ProductName = '${ProductNameToSave}',
                            ImageLocn = '${FilePath}',
                            Image = '${FileName}',
                            PricePerUnitINR = ${PricePerUnitToSave}, 
                            LastModifiedTime = DATE_FORMAT(UTC_TIMESTAMP(), '%Y-%m-%d %H:%i:%S')
                        where ProductCode = ${ProdCode}`;
        }

        pool.query(sqlQuery, function (err, result) {
            if (err) {
                strMsg = `Unable to Save Product Info in Database.`;
                res.send({code: 'SQL_ERROR', failuremessage: strMsg, sqlerrcode: err.code, errno: err.errno});
                vLogger.error( vMsgFormatter(objAdditionalLogInfo, STR_TAG_FUNC, strMsg, err) );
                return;

            } else {
                strMsg = 'Product Info Saved Successfully.';
                res.send({code: 'SUCCESS', successmessage: strMsg, SaveProductCreationData: result});
                vLogger.info( vMsgFormatter(objAdditionalLogInfo, STR_TAG_FUNC, strMsg) );
                return; // No further processing required
            }        
        });
    },

    dbGetLatestProductInfo: function (req, res) {

        const STR_TAG_FUNC = "dbGetLatestProductInfo";
        const objAdditionalLogInfo = new CVmhAdditionalLogInfo({OrgReqObj: req, TagFunction: STR_TAG_FUNC});

        let strMsg = " ";
        let reqBody = req.body;

        let selectQuery = '';

        let strWhereClauseStartDtTmAndEndDtTm = "";
        let strOrderBy = "";

        let StartDtTm = ("startDate" in reqBody) == true && reqBody["startDate"] != null && reqBody["startDate"].length > 0 ? "'" + reqBody["startDate"] + "'" : null;
        let EndDtTm = ("endDate" in reqBody) == true && reqBody["endDate"] != null && reqBody["endDate"].length > 0 ? "'" + reqBody["endDate"] + "'" : null;
        let productName = ("productName" in reqBody) == true && reqBody["productName"] != null && reqBody["productName"].length > 0 ? reqBody["productName"] : null;
        let check = ("check" in reqBody) == true && reqBody["check"] != null && reqBody["check"].length > 0 ? reqBody["check"] : null;

        if((StartDtTm != null && StartDtTm.length > 0) && (EndDtTm != null && EndDtTm.length > 0)) {
            strWhereClauseStartDtTmAndEndDtTm = ` where LastModifiedTime between DATE_FORMAT(${StartDtTm}, '%Y-%m-%d %H:%i:%S') and DATE_FORMAT(${EndDtTm}, '%Y-%m-%d %H:%i:%S') `;
        } else {
            strWhereClauseStartDtTmAndEndDtTm = "";
        }


        if((check != null && check == "asc")) {
            strOrderBy = ` order by ProdLastModifiedTime DESC`;
        } else {
            strOrderBy = ` order by ProdLastModifiedTime ASC`;
        }

        if(productName == null){
            selectQuery = `select ProductCode, ProductName, PricePerUnitINR, Image, DATE_FORMAT(LastModifiedTime, '%Y-%m-%d %H:%i:%S') as ProdLastModifiedTime
                        from sProducts
                        ${strWhereClauseStartDtTmAndEndDtTm}
                        ${strOrderBy}`;
        } else {
            selectQuery = `select ProductCode, ProductName, PricePerUnitINR, Image, DATE_FORMAT(LastModifiedTime, '%Y-%m-%d %H:%i:%S') as ProdLastModifiedTime
                        from sProducts
                        where ProductName Like  '%${productName}%'`;
        }
                                
        pool.query(selectQuery, function(err, result, fields) {
            if(err) {
                strMsg = `SQL Error while getting Product Table Details.`;
                res.send({code: 'SQL_ERROR', failuremessage: strMsg, sqlerrcode: err.code, errno: err.errno});
                vLogger.error(vMsgFormatter(objAdditionalLogInfo, STR_TAG_FUNC, strMsg, err));
                return; // No further processing required
            } else {
                strMsg = `Success while getting Product Table Details.`;
                res.send({code: 'SUCCESS', successmessage: strMsg, retrievedProductTableDetails: result});
                vLogger.info( vMsgFormatter(objAdditionalLogInfo, STR_TAG_FUNC, strMsg) );
                return; // No further processing required
            }
        })
    },

}