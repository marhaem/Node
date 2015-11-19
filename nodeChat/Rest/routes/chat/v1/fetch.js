/*jshint esnext:true*/

import {Database} from '../../../lib/Database';

let TableMessages = Database.tables.messages;

export let fetch = {
  get: function () {
    return [{
      method: 'GET',
      path: '/chat/v1/fetch',
      handler: function (request, reply) {
        TableMessages.findAll({
          order: [
            ['timestamp', 'ASC']
          ]
        }).then(
          function(messages){
            reply({
              'payload': messages
            });
          },
          function(error){
            console.log(error);
          }
      );
      }
    }];
  }
};
