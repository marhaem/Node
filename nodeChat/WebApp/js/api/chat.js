/*jshint esnext:true */

import _ from 'lodash';
import moment from 'moment';

import {
  CacheUserlist
}
from '../api/cacheUserlist';

export let Chat = function Chat() {
  this.lastConnect = null;
  this.messages = [];
  this.cache = new CacheUserlist();
  this.myId = '2';
  this.cache.add([{
    id: '1',
    name: 'wagnera'
    }, {
    id: '2',
    name: 'neumaierm'
  }]);
};

/**
 * Flags messages coming from yourself by comparing the id in each message
 */
Chat.prototype.processMessages = function processMessages(messages) {
  var len = messages.length;
  var i = -1;
  let message;
  while (++i < len) {
    message = messages[i];
    //@TODO: get userid from userdata (current login)
    // flag my own messages
    if (message.from === this.myId) {
      message.mine = true;
    }

    // expand sender with full information
    message.from = this.cache.get(message.from);
  }

  return messages;
};

Chat.prototype.send = function send(text) {
  var url = "";
  // "DD/MM/YYYY";
  var unix = moment().unix();

  let messages = [{
    mine: true,
    message: text,
    from: '1',
    timestamp: unix
  }];

  //  messages.push({
  //    mine: true,
  //    message: text,
  //    from: '1',
  //    timestamp: unix
  //  });

  messages = this.processMessages(messages);
  console.info("processMessages");
  return messages;
};

Chat.prototype.fetch = function fetch() {
  let messages = [{
    from: '1',
    message: 'Hi',
    timestamp: moment().subtract(3, 'days').unix()
  }, {
    from: '1',
    message: 'Anyone there',
    timestamp: moment().subtract(2, 'days').unix()
  }, {
    from: '1',
    message: 'Hello-oh',
    timestamp: moment().subtract(1, 'days').unix()
  }, {
    from: '2',
    message: 'Yeah, yeah hi and such...',
    timestamp: moment().subtract(2, 'minutes').unix()
  }, {
    from: '1',
    message: 'Grumpy cat?',
    timestamp: moment().subtract(1, 'minutes').unix()
  }];

  // get all _unique_ ids form all messages
  let ids = _.uniq(_.pluck(this.messages, 'from'));

  // contains missing ids
  let missing = this.cache.getUnknown(ids);

  // @TODO: get data for missing ids

  // parse messages
  this.processMessages(messages);

  return messages;
};
