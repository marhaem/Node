/*jshint esnext:true*/

import Joi from 'joi';
import {Database} from '../../../lib/Database';

let TableMessages = Database.tables.messages;

export let send = {
  get: function () {
    return [{
      method: 'POST',
      path: '/chat/v1/send',
      handler: function (request, reply) {
        let messages = [request.payload];
        let unix = request.payload.timestamp;

          TableMessages.create({
            message: messages[0].message,
            from: messages[0].from
          }).then(function(message){
            var mes = TableMessages.findAll({
              where: {
                timestamp: {
                  $gte: unix
                }
              },
              order: [
                ['timestamp', 'DESC']
              ]
            }).then(function (mes) {
              reply({
                'payload': mes
              })
          });
        });
      },
        config: {
          validate: {
            payload: {
              from: Joi.string().min(1).max(10),
              message: Joi.string().min(1).max(1000),
              timestamp: Joi.string().min(1).max(1000)
            }
          }
        }
    }];
  }
};
