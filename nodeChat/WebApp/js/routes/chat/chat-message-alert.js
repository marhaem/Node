/*jshint esnext:true */

import $ from 'jquery';
import 'bootstrap';
import riot from 'riot';

riot.tag(
  'chat-message-alert',
  '<button type="button" class="btn btn-default btn-xs" id="messageAlert" name="messageAlert" onclick="{ onclick }">New message(s)</button>',
  function (opts) {
    this.onclick = function onclick() {
      //@TODO Scroll to bottom of message container
      $('#messages').scrollTop($('#messages')[0].scrollHeight);
      $('#messageAlert').css('display', 'none');
    };
  }
);
