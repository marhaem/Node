/*jshint esnext:true */

import $ from 'jquery';
import 'bootstrap';
import riot from 'riot';

riot.tag(
  'chat-form',
  '<div class="sendBox">' +
  '<div class="input-group">' +
  '<textarea class="form-control" rows="3" style="resize: none; height: 100px;" name="messageArea" id="messageArea" onkeypress="{ onkeypress }"></textarea>' +
  '<span class="input-group-btn">' +
  '<button class="btn btn-default" type="button" onclick="{ onClick }" style="height: 100px;">Send</button>' +
  '</span>' +
  '</div>' +
  '</div>',
  function (opts) {
    this.onClick = function onClick() {
      this.send();
    };
    this.onkeypress = function onkeypress(event) {
      if (event.keyCode === 13 && !event.shiftKey) {
        this.send();
        return false;
      }
      return true;
    };
    this.send = function send() {
      opts.master.send($(this.messageArea).val());
    };
  }
);
