/*jshint esnext:true */

import $ from 'jquery';
import 'bootstrap';
import riot from 'riot';

riot.tag(
  'chat-message',
  '<div each="{ item in opts.items }" class="col-lg-8 col-md-9 col-xs-10 chatMessage { item.active ? \'pull-right\' : \'pull-left\' }">' +
  '<div class="message"> { item.message } </div>' +
  '<div class="upperLine">{ item.sender } - { item.timestamp }</div>' +
  '</div>',
  function (opts) {
    //
  }
);
