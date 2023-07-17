module.exports.SUPPORT_SRVR = "gmail";

// Please note: Port number to be specified only for development environment if 
// the web url is run on a differnet port. In poduction
module.exports.WEBSITE_PUBLIC_URL = "http://localhost:3000";
module.exports.NODE_LISTENING_PORT = 80;

module.exports.HTTP_STATUS_BAD_REQUEST = 400;
module.exports.HTTP_STATUS_REQUEST_TIMEOUT = 408;
module.exports.HTTP_STATUS_SERVER_ERROR = 500;

// The firmware binary download has to start after the clearance is provided.
// Given below is the max time before which the download has to start after
// clearance.
module.exports.MAX_ALLOWED_OTA_DOWNLOAD_START_TIME_AFTER_CLEARANCE = 30; // 30 Minutes

// Minimum gap time after which if device does not send data, then it will be
// considered as inactive.
module.exports.Active_Status_Minimum_Time = 300; // 300 seconds equals 5 min.

// Minimum gap time in which we are going to check whether important alert occured or not.
module.exports.Alert_Based_Param_Minimum_Time = 15; // 15 min.

// for appling maximum limit to retrieving alert log data.
module.exports.Maximum_Alert_Log_Records_To_Retrieve = 100;