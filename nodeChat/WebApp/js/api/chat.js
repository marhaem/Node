/*jshint esnext:true */

export let Chat = function Chat() {
  this.lastConnect = null;
};

/**
 * Flags messages coming from yourself by comparing the id in each message
 */
Chat.prototype.processMessages = function processMessages(messages) {};

Chat.prototype.send = function send(text) {
  var url = "";
  // send
  // include lastTimestamp --> indirect fetch()
  // wait for response

  let messages = [];
  messages.push({
    active: true,
    message: text,
    sender: 'neumaierm',
    timestamp: '1234'
  });

  this.processMessages(messages);
  return messages;
};

Chat.prototype.fetch = function fetch() {
  let messages = [{
    active: false,
    message: 'Message -> True',
    sender: 'wagnera',
    timestamp: '1234'
      }, {
    active: true,
    message: 'Message -> false',
    sender: 'neumaierm',
    timestamp: '1234'
      }, {
    active: false,
    message: 'Message -> false',
    sender: 'wagnera',
    timestamp: '1234'
      }, {
    active: false,
    message: 'Message -> false',
    sender: 'wagnera',
    timestamp: '1234'
      }, {
    active: false,
    message: 'Message -> false',
    sender: 'wagnera',
    timestamp: '1234'
      }, {
    active: false,
    message: 'Message -> false',
    sender: 'wagnera',
    timestamp: '1234'
      }, {
    active: false,
    message: 'Message -> false',
    sender: 'wagnera',
    timestamp: '1234'
      }, {
    active: false,
    message: 'Message -> false',
    sender: 'wagnera',
    timestamp: '1234'
      }, {
    active: false,
    message: 'Message -> false',
    sender: 'wagnera',
    timestamp: '1234'
      }, {
    active: false,
    message: 'Message -> false',
    sender: 'wagnera',
    timestamp: '1234'
      }, {
    active: false,
    message: 'Message -> false',
    sender: 'wagnera',
    timestamp: '1234'
      }, {
    active: false,
    message: 'Message -> false',
    sender: 'wagnera',
    timestamp: '1234'
      }, {
    active: false,
    message: 'Message -> false',
    sender: 'wagnera',
    timestamp: '1234'
      }, {
    active: false,
    message: 'Message -> false',
    sender: 'wagnera',
    timestamp: '1234'
      }, {
    active: false,
    message: 'Message -> false',
    sender: 'wagnera',
    timestamp: '1234'
      }, {
    active: false,
    message: 'Message -> false',
    sender: 'wagnera',
    timestamp: '1234'
      }, {
    active: false,
    message: 'Message -> false',
    sender: 'wagnera',
    timestamp: '1234'
      }, {
    active: false,
    message: 'Message -> false',
    sender: 'wagnera',
    timestamp: '1234'
      }, {
    active: false,
    message: 'Message -> false',
    sender: 'wagnera',
    timestamp: '1234'
      }, {
    active: true,
    message: 'Message -> false',
    sender: 'wagnera',
    timestamp: '1234'
      }];

  return messages;
};
