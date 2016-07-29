import moment from 'moment';

export default {
  get: function get() {
    return [{
      method: 'POST',
      path: '/api/v1/request',
      handler: function(request, reply) {
        if (!request.payload || !request.payload.date) {
          return reply({
            error: 'date missing'
          })
          .code(400);
        }
        else {
          return reply({
            data: moment().diff(moment(request.payload.date), 'milliseconds', false)
          })
          .code(200);
        }
      }
    }];
  }
};
