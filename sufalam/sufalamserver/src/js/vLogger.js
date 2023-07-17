//==============================================================================================
// With this logger, functions with the same names as below can be called to 
// log different types of log messages.
// Also if log level is set in the logger, only messages having that or lesser
// level will be logged. (For example: If level is set 'warn' then only
// 'warning' and 'error' messages will be logged)
// Levels corresponding to each function 
	// error: 0, 
	// warn: 1, 
	// info: 2, 
	// verbose: 3, 
	// debug: 4, 
	// silly: 5 
//==============================================================================================

const path = require('path');
const { createLogger, format, transports } = require('winston');
const logform = require('logform');
const { combine, timestamp, label, printf } = logform.format;

const DailyRotateFile = require('winston-daily-rotate-file');

const LOG_PATH_RELATIVE_TO_VLOGGER_DIR = '../../logs';
const LOG_FILENAME_PREFIX = 'ServerAllMsgs';
// Log Level for all logs ('Console' as well as the 'File' in the logs directory )
const LOG_LEVEL_ALL = 'debug'; // Log all messages, 'debug' and upto 'error'. Exclude 'silly' level.
// Override Log Level for Console Log
const LOG_LEVEL_CONSOLE = 'error'; // Show only 'error' log on Console.
// Override Log Level for File Log
var LOG_LEVEL_FILE = 'silly'; // Write all logs in Server Log File.

// Set this to 'true' if you want to see performance logs in File Logs
const ENABLE_PERFORMANCE_LOGS = false;

const LOG_REQUEST_BODY = false;

// If Performance Log is enabled, override the Log Level for File Log so that bare 
// minimum 'info' and higher preference logs ('error' and 'warn') will be shown.
// Note that Performance Logs by default will be printed as 'info'.
if(ENABLE_PERFORMANCE_LOGS == true) {

	strArrRequiredLogLevelsForWritingPerfLogs = ['info', 'verbose', 'debug', 'silly'];
	if ( strArrRequiredLogLevelsForWritingPerfLogs.includes(LOG_LEVEL_FILE) == false ) {
		// Set FileLogLevel to bare minimum 'info' when the PerformanceLogs are enabled.
		LOG_LEVEL_FILE = 'info';
	}
}

var gObjLogger = null;

const logFormatting = combine(
	// format.colorize(), // Uncomment this if you want log message to have color
	timestamp(),
	printf( dataToBeLogged => `${dataToBeLogged.level} :: ${dataToBeLogged.timestamp} :: ${dataToBeLogged.message}` )
  );


module.exports = {

	LOG_REQUEST_BODY: LOG_REQUEST_BODY,

	getLogger: function () {
      	if (gObjLogger != null) {
			return gObjLogger;
		}

		console.log("\nLogger does not exist. Creating the same.\n");
		gObjLogger = createLogger({

			level: LOG_LEVEL_ALL, // Log level for all logs (this can be overridden individually in each transport)
			exitOnError: false,
			format: logFormatting,

			transports: [
				new transports.Console({ level: LOG_LEVEL_CONSOLE, handleExceptions: true }),

				// Uncomment the below block and comment 'DailyRotateFile' if you dont want log file based on dates
				// new transports.File({ 
				// 	filename: path.join(__dirname, `${LOG_PATH_RELATIVE_TO_VLOGGER_DIR}/${LOG_FILENAME_PREFIX}.log`),
				//  level: LOG_LEVEL_FILE,
				// 	handleExceptions: true, // Unhandled exceptions in our code are logged here
				// }),
				// The below block is for log file created on a daily basis

				new DailyRotateFile({ 
					dirname: path.join(__dirname, LOG_PATH_RELATIVE_TO_VLOGGER_DIR),
					filename: `${LOG_FILENAME_PREFIX}_%DATE%.log`,
					datePattern: 'YYYYMMDD',
					utc: true,
					zippedArchive: true,
					maxSize: '20m',
					maxFiles: '365d',
					level: LOG_LEVEL_FILE,
					handleExceptions: true // Unhandled exceptions in our code are logged here
				})
			],
  
		});

		// Logger itself experiences an error. Log it to the console explicitly.
		gObjLogger.on('error', function (err) { console.log("Fatal Error: Logger experienced and Error. Please check.") });
		
		console.log("\nReturning new Logger\n");
		return gObjLogger;
	},

	/**
	 * Mask email address with asterisks to comply GDPR
	 * john.doe@example.com => j******e@e****e.com
	 * @param {string} emailAddress email address
	 * @returns {string} masked email address
	 */
	maskEmailAddress: function (emailAddress) {
		function mask(str) {
			var strLen = str.length;
			if (strLen > 4) {
				return str.substr(0, 1) + str.substr(1, strLen - 1).replace(/\w/g, '*') + str.substr(-1,1);
			} 
			return str.replace(/\w/g, '*');
		}
		return emailAddress.replace(/([\w.]+)@([\w.]+)(\.[\w.]+)/g, function (m, p1, p2, p3) {      
			return mask(p1) + '@' + mask(p2) + p3;
		});
		
		return emailAddress;
	},

	// Class to hold Additional Information for Logging like:
	// 1. The OriginalRequestObject (in case this object creation call happened as part of an API call)
	// 2. Any other additional attribute(s) can be added in future into this class
	CVmhAdditionalLogInfo: class {
		constructor (inobjAdditionalLogInfo) {

			// Will contain the Request Object in case the Log call happened as a result of API execution.
			this.OrgReqObj = ("OrgReqObj" in inobjAdditionalLogInfo) ? inobjAdditionalLogInfo.OrgReqObj : null;
	
			// The FunctionName Tag to identify the function where this object was instantiated.
			this.TagFunction = ("TagFunction" in inobjAdditionalLogInfo) ? inobjAdditionalLogInfo.TagFunction : 'NO_FUNC_NAME_SPECIFIED';
		}
	},

	// Class to hold Performance Info for Logging like:
	// 1. The AdditionalLogInfo from the function where this PerfInfo object was instantiated.
	// 2. PerfShortDecrpn - Short description of what this particular performance log is doing.
	// 3. Any other additional attribute(s) can be added in future into this class
	CVmhPerfInfo: class {
		constructor (inobjPerfInfo) {

			// Give a UniqueID to this Perf Object which can be used during logging.
			this.PerfID = module.exports.vmhGetUniqueID();
	
			// The short description which says what exactly this performance log is measuring.
			this.PerfShortDescrpn = ("PerfShortDescrpn" in inobjPerfInfo) ? inobjPerfInfo.PerfShortDescrpn : 'NA_PERF_SHORT_DESCRIPTION';
	
			// The AdditionalLogInfo from the function where this PerfInfo object was instantiated.
			// The AdditionalLogInfo will contain the RequestObject. The RequestObject will contain the UniqueID of the API,
			// the DateTime at which the API request was received by this NodeServer, the API URL etc.
			this.AdditionalLogInfoObj = ("AdditionalLogInfoObj" in inobjPerfInfo) ? inobjPerfInfo.AdditionalLogInfoObj : null;

			// The Stack Error object used for getting the FileName, LineNumber and ColumnNumber. This will not be filled here.
			// It will be filled while actually writing the Log, so that the correct FileName,Line,Col can be extracted.
			this.jsStackErrorObj = null;

			// The Start DateTime against which the End DateTime of performance logging will be compared.
			// This value will be instantiated the moment the Perf Object is created. We are filling this value
			// after all the members have been filled so that we get more accurate time difference (as the time
			// taken for the above member initialization should not considered).
			this.PerfStartDtTm = new Date();

		}

		// Calculate the time from the start of the PerfObject creation upto this instant and write to the logs.
		calcPerfTimeForParamAndWritePerfLog() {

			if(ENABLE_PERFORMANCE_LOGS == false) {
				// Do not print performance log if it is not enabled.
				return;
			}

			// Set the stack error object in this function (rather than FormatMessage function ) so that the correct line  
			// from the stack array can be taken while extracting the FileName, LineNum and ColNum. 
			// Note: The JS StackErrorObject is used only for extracting FileName, LineNumber and ColumnNumber. It does 
			// not contain any Error/Exception value.
			this.jsStackErrorObj = new Error();

			// Call the Formatter and Logger to write the Performance Log for the information present in this Log Object.
			module.exports.getLogger().info( module.exports.formatMessage(this) ); // The Perf Object contains all the information required for writing the log.

		}
	},

	// Starts the Performance monitoring for individual parameter.
	// This returns a performance object which can be used for tracking, calculating and 
	// printing the performance time (in milliseconds) for an individual performance parameter.
	// Takes a Javascript object containing the following:
	// 1. The AdditionalLogInfo from the function where this PerfInfo object was instantiated.
	// 2. PerfShortDecrpn - Short description of what this particular performance log is doing.
	// 3. Any other additional attribute(s) can be added in future into this class
	startIndividualPerfParamCheck: function(inobjPerfInfo) {
		return new module.exports.CVmhPerfInfo(inobjPerfInfo);
	},

	// Generates a unique id from current date-time-millis+5DigitRandomNumber
	vmhGetUniqueID: function () {

		// Get current date time.
		const d = new Date();

		const yyyy = String(d.getFullYear());
		const mm = String(d.getMonth() + 1).padStart(2, "0"); // month is zero-based
		const dd = String(d.getDate()).padStart(2, "0");
		const hh = String(d.getHours()).padStart(2, "0");
		const mi = String(d.getMinutes()).padStart(2, "0");
		const ss = String(d.getSeconds()).padStart(2, "0");
		const millis = String(d.getMilliseconds()).padStart(3, "0");

		// Generate five digit random number
		const nFiveDigitRandomNumber = Math.floor(Math.random() * (99999 - 11111) ) + 11111;

		// Combine the above to get a UniqueID
		const strUniqueID = yyyy+mm+dd+hh+mi+ss+"Z"+millis+"RND"+nFiveDigitRandomNumber;

		return strUniqueID;
	},

	// Converts DateTime to Timestamp(YYYY-MM-DD HH:MI:SS SSS)
	vmhConvertDttmToTimeStamp: function (inObjDtTmToCovert) {

		let strRetTimeStamp = "0000:00:00T00:00:00.000Z";

		const d = inObjDtTmToCovert;

		if(d != null && d instanceof Date) {

			const yyyy = String(d.getFullYear());
			const mm = String(d.getMonth() + 1).padStart(2, "0"); // month is zero-based
			const dd = String(d.getDate()).padStart(2, "0");
			const hh = String(d.getHours()).padStart(2, "0");
			const mi = String(d.getMinutes()).padStart(2, "0");
			const ss = String(d.getSeconds()).padStart(2, "0");
			const millis = String(d.getMilliseconds()).padStart(3, "0");
	
			// Combine the above to get a Timestamp
			strRetTimeStamp = yyyy + "-" + mm + "-" + dd + "T" + hh + ":" + mi + ":" + ss + "." + millis + "Z";
		}

		return strRetTimeStamp;
	},

	// // For adding the Module/Class Name and Function Name before the actual message
	// formatMessage: function (strModuleOrClassName, instrFuncName, instrMessage, inSqlErrObj) {
	
	//   let strFinalMessageString = (inSqlErrObj == null) ?
	// 			instrMessage :
	// 			instrMessage + 
	// 			`, SQLErrCode: [${inSqlErrObj.code}], SQLErrNo: [${inSqlErrObj.errno}], ` +
	// 			`, SQLErrState: [${inSqlErrObj.sqlState}], SQLErrMsg: [${inSqlErrObj.sqlMessage}], ` +
	// 			`, SQLQuery: [${inSqlErrObj.sql}].`;

	//   return `${strModuleOrClassName}:${instrFuncName} - ${module.exports.maskEmailAddress(strFinalMessageString)}`;
	// }

	// For adding the Module/Class/FileName/FunctionName/LineNumber/ColumnNumber before the actual message.
	// Also adds some of the Performance Info in the Log in case the PerfLog is enabled and either the API start 
	// information is present or a Perf object is present.
	formatMessage: function (inAdditionalLogInfoOrPerfInfoOrModuleOrClassName, instrFuncName, instrMessage, inSqlErrObj) {

		// Noting the current time is the first thing that should be done, so that we get the most accurate time difference.
		// Do all other things in the function after this.
		let dtCurrentDateTime = new Date();
		
		let strFuncName = (instrFuncName != null && instrFuncName.length > 0) ? instrFuncName : "NO_FUNCNAME_SPECIFIED";
		let strMessage = (instrMessage != null && instrMessage.length > 0) ? instrMessage : "NO_LOGMESSAGE_SPECIFIED";
		let strModuleOrClassOrFileName = "NO_MODULE_CLASS_OR_FILE_NAME_SPECIFIED";
		let strLineNumber = "NO_LINE_NUM_FOUND";
		let strColumnNumber = "NO_COL_NUM_FOUND";
		let strFullFilePath = "NO_FULL_FILE_PATH_FOUND";
		let strFileFolderPath = "NO_FILE_FOLDER_PATH_FOUND"; // Not used now but might be used in future.
		let strApiID = "NA_API_ID";
		let strPerfID = "NA_PERF_ID";
		let strApiName = "NA_API_NAME";
		let dtApiRecvdStDtTm = null;
		let dtPerfMeasStDtTm = null;
		let strApiRecvdStDtTmStmp = "API_STDTTM - NA";
		let strCurrentDtTmStmp = "CURR_DTTM - NA";
		let strPerfMeasStDtTmStmp = "PERF_MEAS_STDTTM - NA";
		let strApiExecTimeMillis = "EXECTM_FROM_API_START_MILLIS - NA";
		let strPerfMeasExecTimeMillis = "EXECTM_FROM_PERF_MEAS_START_MILLIS - NA";
		let AdditionalLogInfoObj = null;
		let PerfInfoObj = null;
		// Note: The JS StackErrorObject is used only for extracting FileName, LineNumber and ColumnNumber. It does 
		// not contain any Error/Exception value.
		let jsStackErrObj = null;

		if(inAdditionalLogInfoOrPerfInfoOrModuleOrClassName instanceof module.exports.CVmhAdditionalLogInfo) {
			AdditionalLogInfoObj = inAdditionalLogInfoOrPerfInfoOrModuleOrClassName;
		} else if(ENABLE_PERFORMANCE_LOGS == true && inAdditionalLogInfoOrPerfInfoOrModuleOrClassName instanceof module.exports.CVmhPerfInfo) {
			PerfInfoObj = inAdditionalLogInfoOrPerfInfoOrModuleOrClassName;
			AdditionalLogInfoObj = ("AdditionalLogInfoObj" in PerfInfoObj) ? PerfInfoObj.AdditionalLogInfoObj : null;
			// User Stack Error object from PerfInfo so that the correct line gets printed
			jsStackErrObj = ("jsStackErrorObj" in PerfInfoObj) ? PerfInfoObj.jsStackErrorObj : null;
		} else {
			// Note down the Module name (just in case there is an issue in extracting the value from StackObject.
			if( ( (typeof inAdditionalLogInfoOrPerfInfoOrModuleOrClassName) == 'string' || 
			      inAdditionalLogInfoOrPerfInfoOrModuleOrClassName instanceof String
				)
				&& inAdditionalLogInfoOrPerfInfoOrModuleOrClassName.length > 0
			) {
				strModuleOrClassOrFileName = inAdditionalLogInfoOrPerfInfoOrModuleOrClassName;
			}
		}

		// In case Stack Error object is null, generate the stack error object here so that the correct 
		// filename and line number gets printed.
		if(jsStackErrObj == null) {
			jsStackErrObj = new Error();
		}

		// Extract the applicable information from AdditionalLogInfoObj for Log printing
		if(AdditionalLogInfoObj != null) {

			// If FunctionName is present in AdditionalLogInfoObj, then use the same.
			if("TagFunction" in AdditionalLogInfoObj) { strFuncName = AdditionalLogInfoObj.TagFunction; }

			const OrgReqBody =  ("OrgReqObj" in AdditionalLogInfoObj && "body" in AdditionalLogInfoObj.OrgReqObj) ? 
									AdditionalLogInfoObj.OrgReqObj.body : null;

			if(OrgReqBody != null) {
				strApiID = ("ReqApiID" in OrgReqBody) ? `API${OrgReqBody.ReqApiID}` : strApiID;
				strApiName = ("ReqAPIName" in OrgReqBody) ? OrgReqBody.ReqAPIName : strApiName;
				dtApiRecvdStDtTm = ("ReqRecvdDtTm" in OrgReqBody && OrgReqBody.ReqRecvdDtTm instanceof Date) ? OrgReqBody.ReqRecvdDtTm : dtApiRecvdStDtTm;
			}

			// This block should be executed only in case "PerformanceTest" flag is true. This is to prevent
			// unnecessary computing when we dont want to print information related to Performance.
			// Also the below values don't need to be calculated in case we are printing for a Perf Object.
			if (ENABLE_PERFORMANCE_LOGS == true && PerfInfoObj == null) {
				if(dtApiRecvdStDtTm != null) {
					strApiRecvdStDtTmStmp = "API_STDTTM - " + module.exports.vmhConvertDttmToTimeStamp(dtApiRecvdStDtTm);
					strCurrentDtTmStmp = "CURR_DTTM - " + module.exports.vmhConvertDttmToTimeStamp(dtCurrentDateTime);
					strApiExecTimeMillis = "EXECTM_FROM_API_START_MILLIS - " + String(dtCurrentDateTime.getTime() - dtApiRecvdStDtTm.getTime());
				}
			}

		}

		// If Performance Logs are enabled, extract the applicable information from PerfInfoObj for Log printing.
		// To prevent unnecessary compute this block should not be executed when the PerformanceFlag is false.
		if(ENABLE_PERFORMANCE_LOGS == true && PerfInfoObj != null) {

			// Use the short description of Perf as the message part of the log.
			strMessage = ("PerfShortDescrpn" in PerfInfoObj && PerfInfoObj.PerfShortDescrpn.length > 0) ? 
							PerfInfoObj.PerfShortDescrpn : "NO_PERFDESCRIPTION_SPECIFIED";

			strPerfID = ("PerfID" in PerfInfoObj) ? `PERF${PerfInfoObj.PerfID}` : strPerfID;

			dtPerfMeasStDtTm = ("PerfStartDtTm" in PerfInfoObj && PerfInfoObj.PerfStartDtTm instanceof Date) ? 
									PerfInfoObj.PerfStartDtTm : dtPerfMeasStDtTm;

			if(dtPerfMeasStDtTm != null) {
				strPerfMeasStDtTmStmp = "PERF_MEAS_STDTTM - " + module.exports.vmhConvertDttmToTimeStamp(dtPerfMeasStDtTm);
				strCurrentDtTmStmp = "CURR_DTTM - " + module.exports.vmhConvertDttmToTimeStamp(dtCurrentDateTime);
				strPerfMeasExecTimeMillis = "EXECTM_FROM_PERF_MEAS_START_MILLIS - " + String(dtCurrentDateTime.getTime() - dtPerfMeasStDtTm.getTime());
			}
					
		}

		if(jsStackErrObj != null) {

			// If ErrorStackObject exists, then extract the FileName and LineNumber from it
			
			const arrAllCallsInStack = (jsStackErrObj.stack.includes("\n") == true) ? jsStackErrObj.stack.split("\n") : [];

			if(arrAllCallsInStack != null && arrAllCallsInStack.length >= 3) {

				// Matches stack lines which may or may not contain round brackets at the start and end
				const regex = /\s+.*\s+[\(]{0,1}(.*):(\d+):(\d+)[\)]{0,1}$/
				const match = regex.exec(arrAllCallsInStack[2]);

				if(match != null && match.length >= 4) {
					strFullFilePath = match[1];
					strLineNumber = match[2];
					strColumnNumber = match[3];
				} 
			}

			if(strFullFilePath != null && strFullFilePath.length > 0) {
				const regexPath = /^(.*[\\\/])(.*)$/;

				// Execute the match on the string strFullFilePath
				const pathMatch = regexPath.exec(strFullFilePath);
				if (pathMatch != null && pathMatch.length >= 3) {
					// We ignore the pathMatch[0] because it's the match for the whole path string.
					strFileFolderPath = pathMatch[1]; // Not used now but might be used in future.
					// FileName extracted from Full path.
					if(pathMatch[2] != null && pathMatch[2].length > 0) {
						strModuleOrClassOrFileName = pathMatch[2];
					}
				}
			}
		}

		let strFinalMessageString = (inSqlErrObj == null) ?
				strMessage :
				strMessage + 
					`, SQLErrCode: [${inSqlErrObj.code}], SQLErrNo: [${inSqlErrObj.errno}], ` +
					`, SQLErrState: [${inSqlErrObj.sqlState}], SQLErrMsg: [${inSqlErrObj.sqlMessage}], ` +
					`, SQLQuery: [${inSqlErrObj.sql}].`;

		// return `${strModuleOrClassOrFileName}:${instrFuncName}:${strLineNumber}:${strColumnNumber} - ${module.exports.maskEmailAddress(strFinalMessageString)}`;
		const strLogID = (PerfInfoObj != null) ? `${strApiID}(${strPerfID})` : strApiID;
		const strPerfStDtTm = (PerfInfoObj != null) ? strPerfMeasStDtTmStmp : strApiRecvdStDtTmStmp;
		const strPerfExecTimeMillis = (PerfInfoObj != null) ? strPerfMeasExecTimeMillis : strApiExecTimeMillis;
		return `${strLogID} :: ${strApiName} :: ${strModuleOrClassOrFileName}:${strFuncName}:${strLineNumber}:${strColumnNumber} :: ${strPerfStDtTm} :: ${strCurrentDtTmStmp} :: ${strPerfExecTimeMillis} :: - ${module.exports.maskEmailAddress(strFinalMessageString)}`;
	}

};