/*jshint esnext:true*/

import Joi from 'joi';
import {Database} from '../../../lib/Database';

let TableMessages = Database.tables.messages;

export let get = {
  get: function () {
    return [{
      method: 'POST',
      path: '/chat/v1/get',
      handler: function (request, reply) {

        let unix = request.payload.timestamp;
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
              });
            });
      },
        config: {
          validate: {
            payload: {
              timestamp: Joi.string().min(1).max(1000)
            }
          }
        }
    }];
  }
};
