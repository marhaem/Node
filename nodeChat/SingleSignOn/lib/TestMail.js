/*global module, require, console */

(function () {
  'use strict';

  var xy = module.exports = function xy() {
  };

  var config = require('./globals').config.mail;
  var nodemailer = require('nodemailer');
  var mg = require('nodemailer-mailgun-transport');

  // This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
  var auth = {
    auth: config.auth
  };

  var nodemailerMailgun = nodemailer.createTransport(mg(auth));

  nodemailerMailgun.sendMail({
    from: 'myemail@example.com',
    to: 'andreas.wagner.mail@gmail.com', // An array if you have multiple recipients.
    subject: 'Test mail (nodemailer & mailgun)!',
    //You can use "html:" to send HTML email content. It's magic!
    html: '<b>Wow Big powerful letters</b>',
    //You can use "text:" to send plain-text content. It's oldschool!
    text: 'Mailgun rocks, pow pow!'
  }, function (error, info) {
    if (error) {
      console.error(error);
    }
    else {
      console.log('Sending Mail Response: ' + JSON.stringify(info));
    }
  });
})();