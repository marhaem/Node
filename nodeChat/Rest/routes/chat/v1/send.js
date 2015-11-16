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
        console.log('Post message: ' + messages[0].message);
        // check db for new entries since last checks
        // let Message = Database.tables.messages.index();

          TableMessages.create({
            message: messages[0].message,
            from: messages[0].from
          }).then(function(){
            // @TODO SEARCH FOR NEW MESSAGES
            var mes = TableMessages.findAll({
              limit: 10
            });
            reply({
              payload: mes
            })
          });/*.then(function(){
            Message.findAll({
              attributes: [
                'from',
                'message',
                'timestamp'
              ],
              where: [
                timestamp: {
                  $and: {
                    $lte: ,
                    $gte: messages[0].timestamp
                  }
                }
              ]
            })
          });*/

        /*.then(function () {
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
        });*/

      },
      config: {
        validate: {
          payload: {
            from: Joi.string().min(1).max(10),
            message: Joi.string().min(1).max(1000),
            timestamp: Joi.date(),
          }
        }
      }
    }];
  }
};
