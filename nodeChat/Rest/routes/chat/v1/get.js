/* global module */
/* global require */
var Joi = require('joi');
var Sequelize = require('sequelize');

(function () {
  'use strict';

  module.exports.get = function get() {
    return [{
      method: 'GET',
      path: '/chat/v1/get',
      handler: function (request, reply) {
        var unix = request.payload.timestamp;
        var messages = [request.payload];
        console.log('Get messages: ' + messages[0].message);
        // check db for new entries since last check
        // save message to database
        reply({
          'payload': messages
        });
      },
      config: {
        validate: {
          payload: {
            from: Joi.string().min(1).max(10),
            message: Joi.string().min(1).max(1000),
            timestamp: Joi.number().integer()
          }
        }
      }
    }];
  };
})();
