var config = require('../../config');
var express = require('express');
var router = express.Router();

module.exports = function(db, logger){
    
    router.get('/session', function(req, res) { // Allows the app to test to see if it has valid credentials
        getUserData(db, req, function(err, result) {
            if (err) {
                logger.error(err);
                res.status(500);
                res.json(err);
            }
            else {
                res.json(result);
            }
        });
    });
	
	return router;
};

function getUserData(db, req, callback) {
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
                    callback(null, { accessToken: accessToken, username: result.user.id, firstName: user.firstName, lastName: user.lastName, admin: admin });
                }
            });
        }
    });
}