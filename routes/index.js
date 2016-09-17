//jshint node:true

var config = require('../config');
var express = require('express');
var path = require('path');
var router = express.Router();

module.exports = function(){

    router.get('/', function(req, res) {
        res.sendFile(path.join(config.server.appDirectory, config.server.publicDirectory, config.server.index));
	});
    
	return router;
};