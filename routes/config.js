//jshint node:true

var config = require('../config');
var express = require('express');
var router = express.Router();

module.exports = function(){

	router.get('/', function(req, res) {
        // Literal code which is run on the web app to reconstruct the string representations of functions in the config
		res.send('config = JSON.parse(\'' + JSON.stringify(config.web).replace(/'/g, '\\\'').replace(/\\n/g, '') + '\', function (key, value) {if (value && (typeof value === "string") && value.indexOf("function") === 0) {var f = new Function("return " + value)();return f;}return value;});');
	});
    
	return router;
};
