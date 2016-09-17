//jshint node:true

var nodemailer = require('nodemailer');
var config = require('./config');

var transporter = nodemailer.createTransport(config.app.email.transport);

module.exports = function(logger) {

    function mail(to, subject, message, isHtml, callback) {
        if (Array.isArray(to)) {
            var i = 0;
            var next = function() {
                if (i < to.length) {
                    mail(to[i], subject, message, isHtml, function() {
                        i++;
                        next();
                    });
                }
                else {
                    if (callback) {
                        callback();
                    }
                }
            };
            next();
        }
        else {
            var mailOptions = {
                    to: to,
                    subject: subject,
                    text: message,
            };
            if (isHtml) {
                mailOptions.html = message;
            }
            transporter.sendMail(mailOptions, function(error, info){
                var successful = true;
                if (error) {
                    logger.error(error);
                    logger.error('Failed to send: ' + to[i]);
                    successful = false;
                }
                else {
                    logger.info('Message sent: ' + info.response);
                }
                if (callback) {
                    callback(successful);
                }
            });
        }
    }
    
    return mail;
};