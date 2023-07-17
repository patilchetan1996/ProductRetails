var bodyParser=require('body-parser');
var express = require("express");
var path = require('path');
var wroutes = require('./src/js/routes/wroutes');
// var mroutes = require('./src/js/routes/mroutes');
// var droutes = require('./src/js/routes/droutes');
var wfrontcontroller = require('./src/js/frontcontrollers/wfrontcontroller');
// var vLoggerModule = require('./src/js/vLogger');
const cors =require('cors');
const ServerConfigConst = require('./SrvrConfig');
// var mqttConnect = require('./src/js/db/mqttConnect');
// const mqtt = require('mqtt');

// const vLogger = vLoggerModule.getLogger();
// const vMsgFormatter = vLoggerModule.formatMessage;

const STR_TAG_MODULE_OR_CLASS = "server.js";
const STR_TAG_FUNC = "main";

// const NODE_LISTENING_PORT = 80;

const NODE_LISTENING_PORT = ServerConfigConst.NODE_LISTENING_PORT;

// const NODE_LISTENING_PORT = 3007;

var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// wfrontcontroller.winit(app, express);
// app.use('/mclient', mroutes);
// app.use('/vdevice', droutes);
app.use('/', wroutes);
// PRODUCTION ONLY: The React Application will be served through static 
// path on Production (on the same port as the Node Server).
// While in Development, the react application will be served (on Port 3000) 
// through 'Concurrently'

app.listen(NODE_LISTENING_PORT);

// const MQTT_URL_PORT = ServerConfigConst.MQTT_URL_PORT;
// const MQTT_USER_INFO = ServerConfigConst.MQTT_USER_INFO;

// mqttClient = mqtt.connect(MQTT_URL_PORT, MQTT_USER_INFO);
// mqttConnect.mqttSubscribe(mqttClient);

// vLogger.info( vMsgFormatter(STR_TAG_MODULE_OR_CLASS, STR_TAG_FUNC, `Server listening on Port [${NODE_LISTENING_PORT}].`) );
// vLogger.warn( vMsgFormatter(STR_TAG_MODULE_OR_CLASS, STR_TAG_FUNC, "Test Log Message 1.") );
// vLogger.error( vMsgFormatter(STR_TAG_MODULE_OR_CLASS, STR_TAG_FUNC, "Test Log Message 2.") );
