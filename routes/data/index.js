var config = require('../../config');
var express = require('express');
var router = express.Router();
var calculateResults = require('../calculateResults');

module.exports = function(db, logger){
    
    router.post('/poll', function(req, res) {
        var data = req.body;
                
        var document = {};
        if (data.title) document.title = data.title;
        if (data.description) document.description = data.description;
        if (data.questions) document.questions = data.questions;
        else {
            res.status(400);
            return res.json({ error: "Missing parameter" });
        }
        if (data.expirationDate) document.expirationDate = data.expirationDate;
        if (data.private) document.private = data.private;
        if (data.resultsBeforeClosed) document.resultsBeforeClosed = data.resultsBeforeClosed;
        if (data.resultsAfterClosed) document.resultsAfterClosed = data.resultsAfterClosed;
        if (data.seeParticipants) document.seeParticipants = data.seeParticipants;
        
        if (!data.questions.length) {
            res.status(400);
            return res.json({ error: "No questions" });
        }
        
        document.createdDate = new Date();
        
        // Might need to fix this
        document.editId = Math.random().toString(36).slice(2);
        document.resultsId = Math.random().toString(36).slice(2);
        
        db.collection(config.db.collections.polls).insert(document, function(err) {
            if (err) {
                logger.error(err);
                res.status(500);
            }
            else {
                res.json({ success: true });
            }
        });
        
    });
    
    router.get('/poll/results/*', function(req, res) {
        var resultsId = req.path.slice(14);
        
        db.collection(config.db.collections.polls).findOne({ resultsId: resultsId }, function(err, poll) {
            if (err) {
                logger.error(err);
                res.status(500);
            }
            else if (!poll) {
                res.status(404);
            }
            else {
                db.collection(config.db.collections.votes).find({ pollId: poll._id }).toArray(function(err, votes) {
                    if (err) {
                        logger.error(err);
                        res.status(500);
                    }
                    else if (!voteIds) {
                        res.status(404);
                    }
                    else {
                        res.json(calculateResults(votes, poll.questions));
                    }
                });
            }
        });
    });
    
	return router;
};





/*function getUserData(db, req, callback) {
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
}*/