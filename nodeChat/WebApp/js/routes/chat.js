/*jshint esnext:true, -W014 */

import i18n from 'i18next-client';
import riot from 'riot';
import $ from 'jquery';

import './chat/chat-input-submit';
import './chat/chat-message-container';
import './chat/chat-message-alert';

import {
  NotFound404
}
from './notFound404';

import {
  Chat as ChatApi
}
from '../api/chat';

riot.tag(
  'content-chat',
  '<div class="row messageIncome">' +
  '<div name="messagesCon" class="col-lg-8 col-lg-offset-2 messages"></div>' +
  '</div>' +
  '<div name="alert"></div>' +
  '<div class="chat-page">' +
  '<div name="form" class="col-lg-8 col-lg-offset-2 chat-page-form"></div>' +
  '</div>',
  function (opts) {
    let api = null;
    let messages;
    let scroll = true;
    let self = this;

    /**
     * fetch messages periodically
     */
    let tick = function tick() {};

    let addMessages = function addMessages(msgs) {
      // console.log(msgs);
      // let mes = [];
      // let len = msgs.length;
      // let i = -1;
      //
      // while (++i < len) {
      //   mes.unshift(msgs[i]);
      // }
      self.messageContainer.add(msgs);

      //this.messageContainer.update();

      // //@TODO if its my own message ignore it
      // if (scroll) {
      //   $(this.messages).scrollTop($(this.messages)[0].scrollHeight);
      // } else {
      //   $('#messageAlert').css('display', 'block');
      // }

    }

    $(this.messages).scroll(function () {
      if ($(this)[0].scrollHeight - $(this).scrollTop() == $(this).outerHeight()) {
        scroll = true;
        $('#messageAlert').css('display', 'none');
      } else {
        scroll = false;
      }
    });

    this.send = function send(text) {
      api.send(text).then(
        function onResolved(msgs) {
          addMessages(msgs);
        },
        function onRejected(error) {
          //alert(error);
        }
      );
    };

    // riot events
    this.on('mount', function () {
      api = new ChatApi();
      api.fetch().then(
        function onResolved(msgs) {console.log(msgs);
          //self.messages = msgs;
          self.messageContainer = riot.mount(self.messagesCon, 'chat-message-container', {
            master: self,
            items: msgs
          });
          console.log(self.messageContainer);
          self.messageContainer = self.messageContainer ? self.messageContainer[0] : null;

          self.inputSubmit = riot.mount(self.form, 'chat-input-submit', {
            master: self
          });
          self.inputSubmit = self.inputSubmit ? self.inputSubmit[0] : null;

          riot.mount(self.alert, 'chat-message-alert', {});
          $(self.messagesCon).scrollTop(1E10);
        },
        function onRejected(error) {
          console.log("There was an error fetching the messages: " + error);
        }
      );


      // this.messageContainer = riot.mount(this.messages, 'chat-message-container', {
      //   master: this,
      //   items: messages
      // });
      // this.messageContainer = this.messageContainer ? this.messageContainer[0] : null;
      //
      // this.inputSubmit = riot.mount(this.form, 'chat-input-submit', {
      //   master: this
      // });
      // this.inputSubmit = this.inputSubmit ? this.inputSubmit[0] : null;
      //
      // riot.mount(this.alert, 'chat-message-alert', {});
    });
  }
);

export let Chat = {
  tagName: 'content-chat'
};
