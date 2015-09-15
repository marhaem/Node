/*jshint esnext:true */

import _ from 'lodash';
import moment from 'moment';

import {
  CacheUserlist
}
from '../api/cacheUserlist';

export let Chat = function Chat() {
  this.lastConnect = null;
  this.cache = new CacheUserlist();
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
  messages[0].sender = 'neumaierm';
  return messages;
};

Chat.prototype.getDate = function getDate(unix, format) {
  return moment.unix(unix).format(format);
}

Chat.prototype.getTime = function getTime(unix) {
  var date = new Date(unix * 1000);
  var hours = date.getHours();
  var minutes = "0" + date.getMinutes();
  //var seconds = "0" + date.getSeconds();
  return hours + ':' + minutes.substr(-2); // + ':' + seconds.substr(-2);
}

Chat.prototype.send = function send(text) {
  var url = "";
  // "DD/MM/YYYY";
  var unix = moment().unix();

  let messages = [];
  messages.push({
    mine: true,
    message: text,
    sender: '1',
    timestamp: unix
  });

  messages = this.processMessages(messages);
  return messages;
};

Chat.prototype.compareDay = function compareDay(unixLast, unixNew) {
  var dLast = this.getDate(unixLast, "DD");
  var dNew = this.getDate(unixNew, "DD");
  if (dLast != dNew) {
    return false;
  }
  return true;
}

Chat.prototype.fetch = function fetch() {
  let messages = [{
    mine: false,
    message: 'Message -> True',
    sender: '1',
    timestamp: '1442233301'
      }, {
    mine: false,
    message: 'Message -> True',
    sender: '2',
    timestamp: '1442233301'
      }, {
    mine: false,
    message: 'Message -> True',
    sender: '1',
    timestamp: '1442319526'
      }];

  // get all _unique_ ids form all messages
  let ids = _.uniq(_.pluck(messages, 'sender'));

  // contains missing ids
  let missing = this.cache.getUnknown(ids);

  // @TODO: get data for missing ids

  // loop through messages and transform sender
  var len = messages.length;
  var i = -1;
  let last = "";
  while (++i < len) {
    var msg = messages[i];
    //@TODO: get userid from userdata (current login)
    // check if message is from me
    if (msg.sender === '2') {
      msg.mine = true;
    }
    // change sender name from id to name
    var usr = this.cache.get(msg.sender);
    msg.sender = usr.name;
    //compare last message with new one
    //if different days == false else true
    // @TODO: if false put in line
    if (!this.compareDay(last, msg.timestamp) && (last != "")) {
      console.log('diff');
    } else {
      console.log('no diff');
    }
    last = msg.timestamp;
    // change timestamp from unix to actual time
    msg.timestamp = this.getTime(msg.timestamp) + " - " + this.getDate(msg.timestamp, "DD/MM/YYYY");

  }

  return messages;
};
