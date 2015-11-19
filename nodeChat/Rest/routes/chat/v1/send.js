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
        let unix = request.payload.timestamp;
        let messages = [request.payload];
        console.log('Post message: ' + messages[0].message + ' get messages before: ' + moment(unix).format('LLL'));
        // check db for new entries since last checks
        // let Message = Database.tables.messages.index();

          TableMessages.create({
            message: messages[0].message,
            from: messages[0].from
          }).then(function(message){
            // @TODO SEARCH FOR NEW MESSAGES
            var mes = TableMessages.findAll({
              // where: {
              //   $and: {
              //     timestamp: {
              //       $gt: moment(request.payload.timestamp).subtract(17, 'minutes')
              //     },
              //     timestamp: {
              //       $lte: message.timestamp
              //     }
              //   }
              // },
              order: [
                ['timestamp', 'ASC']
              ],
              limit: 1
            }).then(function (mes) {
              // var len = mes.length;
              // var i = -1;
              // var obj;
              // while (++i < len) {
              //   obj = mes[i];
              //   //console.log("current element:  " + obj.message);
              //   messages.unshift({
              //     from: obj.from,
              //     message: obj.message,
              //     timestamp: obj.timestamp
              //   });
              // }
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
            }
          }
        }
    }];
  }
};
