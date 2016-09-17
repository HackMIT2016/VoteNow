//jshint node:true

var config = require('./config');
var bcrypt = require('bcryptjs');

module.exports = function(db, logger) {

	function getAccessToken(bearerToken, callback) {
		db.collection(config.db.collections.oauthAccessTokens).find({ accessToken: bearerToken }).toArray(function(error, results) {
			if (error) {
				logger.error(error);
				callback(error);
			}
			else if (!results.length) {
				logger.info('Access token not found');
				callback(null);
			}
			else {
				logger.info('Access token found');
				var token = results[0];
				callback(null, {
					accessToken: token.accessToken,
					clientId: token.clientId,
					expires: token.expires,
					userId: token.userId
				});
			}
		});
	}
	
	function getClient(clientId, clientSecret, callback) {
		// Always allow web client and skip to password authentication
		if (clientId === config.oauth.webClientId) {
			callback(null, { clientId: config.oauth.webClientId, clientSecret: '' });
		}
	}
	
	function grantTypeAllowed(clientId, grantType, callback) {
		if (grantType === 'password') {
			logger.info('Accepted ' + grantType + ' grant request from client ' + clientId);
			callback(false, true);
		}
		else {
			logger.info('Rejected ' + grantType + ' grant request from client ' + clientId);
			callback(false, false);
		}
	}
	
	function saveAccessToken(accessToken, clientId, expires, user, callback) {
		db.collection(config.db.collections.oauthAccessTokens).insert({ accessToken: accessToken, clientId: clientId, expires: expires, user: user }, function(error) {
			if (error) {
				logger.error(error);
			}
			else {
				logger.info('Access token saved');
			}
			callback(error);
		});
	}
	
	function getUser(username, password, callback) { // "/data/login" route performs own password and activation check prior to this function
		db.collection(config.db.collections.users).find({ username: username }).toArray(function(error, results) {
			if (error) {
				logger.error(error);
				callback(error);
			}
			else if (!results.length || !bcrypt.compareSync(password, results[0].password)) {
				callback(null, false);
			}
			else {
				var user = results[0];
				callback(null, {
					id: user.username
				});
			}
		});
	}
	
	return {
			getAccessToken: getAccessToken,
			getClient: getClient,
			grantTypeAllowed: grantTypeAllowed,
			saveAccessToken: saveAccessToken,
			getUser: getUser
	};
};