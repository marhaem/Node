/*jshint esnext:true, -W069 , -W117*/

import _ from 'lodash';
import moment from 'moment';
import $ from 'jquery';

import {
  CacheUserlist
}
from './cacheUserlist';

export function Chat() {
  this.lastConnect = null;
  this.cache = new CacheUserlist();
  this.myId = 1; //TODO: get userid from userdata (current login)
  this.cache.add([{
    id: '1', //TODO change id into alphanumeric string
    name: 'wagnera'
    }, {
    id: '2',
    name: 'neumaierm'
  }]);
};

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue.timestamp + "; " + expires;
}

Chat.prototype.getCache = function getCache() {
  return this.cache;
}

/**
 * Flags messages coming from yourself by comparing the id in each message
 */
Chat.prototype.processMessages = function processMessages(messages) {
  var len = messages.length;
  var i = -1;
  let message;
  while (++i < len) {
    message = messages[i];

    if (message.from === this.myId) {
      message.mine = true;
    }

    let cache = this.getCache();
    message.from = cache.get(message.from);
    message.timestamp = moment(message.timestamp);
  }
  return messages;
};

Chat.prototype.send = function send(text) {
  var unix = getCookie('lastUpdate');

  let message = {
    from: this.myId,
    message: text,
    timestamp: unix
  };

  //send message to server (v1)
  let self = this;
  return new Promise(function (resolve, reject) {
    //@TODO: add authentification for api service
    $.ajax({
        method: "POST",
        url: "http://moritzs-macbook-pro.local:3000/chat/v1/send",
        data: message
      })
      .done(function (response) {
        //
      })
      .success(function (response) {

        let messages = self.processMessages(response['payload']);
        resolve(response['payload']);
      })
      .fail(function (response) {
        reject(response);
      });
  });
};

Chat.prototype.fetch = function fetch() {
  let self = this;
  let messages;
  return new Promise(function(resolve, reject){
    $.ajax({
        method: "GET",
        url: "http://moritzs-macbook-pro.local:3000/chat/v1/fetch",
      })
      .done(function (response) {
        //
      })
      .success(function (response) {

        messages = self.processMessages(response['payload']);
        let ids = _.uniq(_.pluck(messages, 'from'));

        var cache = self.getCache();
        let missing = cache.getUnknown(ids);

        // @TODO: get data for missing ids

        resolve(messages);
      })
      .fail(function (response) {
        reject(response);
      });
  });
}
