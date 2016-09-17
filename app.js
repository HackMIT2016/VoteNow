var config = require('./config');
var express = require('express');
var path = require('path');
var bcrypt = require('bcryptjs');
//var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var oauthServer = require('oauth2-server');
var fs = require('fs');

function create(db) {

	var app = express();

	// Configure logging
	var winston = require('winston');
	var morgan = require('morgan');
	var logDirectory = path.join('./', config.server.logDirectory);
	fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
	var logger = new winston.Logger({
	    transports: [
            new winston.transports.File({
                level: 'info',
                filename: logDirectory + '/all-logs.log',
                handleExceptions: true,
                json: true,
                maxsize: 5242880, //5MB
                maxFiles: 5,
                colorize: false
            }),
            new winston.transports.Console({
                level: 'debug',
                handleExceptions: true,
                json: false,
                colorize: true
            })
        ],
        exitOnError: false
	});
	logger.stream = {
        write: function(message){
            logger.info(message);
        }
	};
	app.use(morgan('dev', { stream: logger.stream }));

	// Uncomment after placing your favicon in /public
	//app.use(favicon(path.join(__dirname, 'public/images/favicon.ico')));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(busboy());
	app.use(cookieParser());
    
	// Setup oauth model
	app.oauth = oauthServer({
		model: require('./oauth-model')(db, logger),
		grants: [ 'password' ],
        accessTokenLifetime: config.oauth.accessTokenLifetime,
		debug: false
	});

	// Handle token grant requests
	app.all('/data/login', function(req, res, next) {
        var username = req.body.username;
        var password = req.body.password;
		db.collection(config.db.collections.users).find({ username: username }).toArray(function(err, results) { // Perform own password and activation check before passing to OAuth
			if (err) {
                logger.error(err);
                res.status(500);
                res.json(err);
			}
			else if (!results.length || !bcrypt.compareSync(password, results[0].password)) {
                res.status(401);
                res.json({ error: 'User not found or incorrect password' });
			}
            else if (!results[0].activated) {
                res.status(403);
                res.json({ error: 'User not activated' });
            }
			else {
                app.oauth.grant()(req, res, next);
			}
		});
    });
    
    function adminCheck(req, res, next) {
        getUserData(req, function(err, result) {
            if (err) {
                logger.error(err);
                res.status(500);
                res.json(err);
            }
            else if (result.admin) {
                next();
            }
            else {
                res.status(403);
                res.json({ error: 'User is not an admin' });
            }
        });
    }
    
    
    function getUserData(req, callback) {
        var accessToken = req.headers.authorization.replace('Bearer ', '');
        db.collection(config.db.collections.oauthAccessTokens).findOne({ accessToken: accessToken }, function(err, result) {
            if (err) {
                callback(err, null);
            }
            else if (!result) {
                callback({ error: 'Token not found' }, null);
            }
            else {
                var username = result.user.id;
                db.collection(config.db.collections.users).findOne({ username: username }, function(err, user) {
                    if (err) {
                        callback(err, null);
                    }
                    else if (!user) {
                        callback({ error: 'User not found' }, null);
                    }
                    else {
                        var admin = false;
                        for (var i = 0; i < config.app.admins.length; i++) {
                            if (username === config.app.admins[i]) {
                                admin = true;
                                break;
                            }
                        }
                        callback(null, { accessToken: accessToken, username: result.user.id, usesRemaining: user.usesRemaining, admin: admin });
                    }
                });
            }
        });
    }
    
	// Configure paths
	app.use('/', require(path.join(__dirname, config.server.routesDirectory, 'index'))(db, logger));
	/*app.use('/login', require(path.join(__dirname, config.server.routesDirectory, 'login'))(db, logger));
	app.use('/register', require(path.join(__dirname, config.server.routesDirectory, 'register'))(db, logger));
	app.use('/registerSuccess', require(path.join(__dirname, config.server.routesDirectory, 'registerSuccess'))(db, logger));
    app.use('/activate', require('./routes/data/activate')(db, logger));
	app.use('/activationSuccess', require(path.join(__dirname, config.server.routesDirectory, 'activationSuccess'))(db, logger));
	app.use('/activationFailure', require(path.join(__dirname, config.server.routesDirectory, 'activationFailure'))(db, logger));
	app.use('/admin', require(path.join(__dirname, config.server.routesDirectory, 'admin'))(db, logger));
	app.use('/changePassword', require(path.join(__dirname, config.server.routesDirectory, 'changePassword'))(db, logger));
    app.use('/data/register', require('./routes/data/register')(db, logger));
    app.use('/data/admin', app.oauth.authorise(), adminCheck, require('./routes/data/admin')(db, logger));
    app.use('/data/changePassword', app.oauth.authorise(), require('./routes/data/changePassword')(db, logger));
    app.use('/data', app.oauth.authorise(), require('./routes/data/index')(db, logger));*/
    app.use('/config', require('./routes/config')(db, logger));
	
	app.use(express.static(path.join(__dirname, config.server.publicDirectory)));
    
	// How to require authentication
	app.get('/secret', app.oauth.authorise(), function (req, res) {
		// Will require a valid access token
		res.send('Secret area');
	});
	
	// Does not require authentication
	app.get('/public', function (req, res) {
		// Does not require an access token
		res.send('Public area');
	});
	
		
	// Catch 404 and forward to error handler
	app.use(function(req, res, next) {
	  var err = new Error('Not Found');
	  err.status = 404;
	  next(err);
	});

    app.use(function(err, req, res) {
        var response = {};
    	response.status = err.status || err.code || 500;
        response.name = err.name || null;
        response.error = err.message;
        res.status(response.status);
        res.send(response);
    	if (response.status === 500) {
    		//logger.error(err);
    		throw err;
    	}
    });
    
	return [app, logger];

}

module.exports = create;
