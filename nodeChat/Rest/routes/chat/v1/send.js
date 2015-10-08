/* global module */
/* global require */
var Joi = require('joi');
var Sequelize = require('./../../../lib/db');
var messageTable = require('./../../../lib/db/message');

(function () {
  'use strict';
  var sequelize = Sequelize.init();

  module.exports.get = function get() {
    return [{
      method: 'POST',
      path: '/chat/v1/send',
      handler: function (request, reply) {
        var unix = request.payload.timestamp;
        var messages = [request.payload];
        console.log('Post message: ' + messages[0].message);
        // check db for new entries since last check
        var Message = messageTable.define(sequelize);

        /*
          for reload :
        */
        Message.create({
          message: messages[0].message,
          from: messages[0].from,
          timestamp: unix
        }).then(function () {
          Message.findAll({
            attributes: [
              'from',
              'message',
              'timestamp'
            ],
            where: {
              timestamp: {
                $lte: unix
              }
            },
            order: 'timestamp ASC'
          }).then(function (mes) {
            var len = mes.length;
            var i = -1;
            var obj;
            while (++i < len) {
              obj = mes[i];
              //console.log("current element:  " + obj.message);
              var item = {
                from: obj.from,
                message: obj.message,
                timestamp: obj.timestamp
              };
              messages.push.apply(messages, [obj]);
            }
            reply({
              'payload': messages
            });
            //console.log(mes);
          }).catch(function (error) {
            console.log(error);
          });
        }).catch(function (error) {
          console.log(error);
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
