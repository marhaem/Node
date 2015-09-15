/*jshint esnext:true */

import $ from 'jquery';
import 'bootstrap';
import riot from 'riot';

riot.tag(
  'chat-input-submit',
  '<div class="sendBox">' +
    '<div class="input-group">' +
      '<textarea class="form-control" rows="3" style="resize: none; height: 100px;" name="messageArea" onkeypress="{ onKeyPress }"></textarea>' +
      '<span class="input-group-btn">' +
        '<button class="btn btn-default" type="button" onclick="{ onClick }" style="height: 100px;">Send</button>' +
      '</span>' +
    '</div>' +
  '</div>',
  function (opts) {
    let send = function send() {
      let text = $(this.messageArea).val();
      if (/^\s*$/.test(text) === false) {
        opts.master.send(text.replace(/^\s+|\s+$/g, ''));
        $(this.messageArea).val('');
      }
    }.bind(this);

  // event handlers
    this.onClick = function onClick(event) {
      event.preventDefault();
      event.stopPropagation();

      send();

      return false;
    };

    this.onKeyPress = function onKeyPress(event) {
      if (event.keyCode === 13 && !event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();

        send();

        return false;
      }
      else {
        return true;
      }
    };
  }
);
