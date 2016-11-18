/*global console*/
import moment from 'moment';

let log = function log(info) {
  console.log(info);
};

export default {
  method: 'POST',
  config: {auth: false},
  path: '/api/v1/ping',
  handler: function(request, reply) {
    if(!request.payload || !request.payload.date) {
      log('request failed: date missing');
      return reply({
        error: 'date missing'
      })
      .code(400);
    }
    else {
      log('succesfully answered user ping request');
      return reply({
        data: moment().diff(moment(request.payload.date), 'milliseconds', false)
      })
      .code(200);
    }
  }
};
