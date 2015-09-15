/*jshint esnext:true */

import $ from 'jquery';
import 'bootstrap';
import riot from 'riot';
import moment from 'moment';

/**
 * timestamp is in seconds
 */
function splitByDate(items) {
  let lists = [];
  let i = items.length;
  let currentIndex = --i;
  let currentDay = moment.unix(items[currentIndex].timestamp).startOf('day').unix();
  console.log(currentDay);

  while (--i >= 0) {
    if (currentDay - items[i].timestamp > 86400) {
      console.log(items[i].timestamp, currentDay - items[i].timestamp);
      lists.push({
        timestamp: currentDay,
        items: items.slice(i + 2, currentIndex + 1)
      });

      if (lists.length >= 3) {
        lists.push({
          timestamp: currentDay,
          items: items.slice(0, i)
        });
      } else {
        currentIndex = i;
        currentDay = moment.unix(items[currentIndex].timestamp).startOf('day').unix();
      }
    }
  }

  return lists;
}

riot.tag(
  'chat-message-container',
  '<div each="{ item in opts.items }" class="col-lg-8 col-md-9 col-xs-10 chatMessage { item.mine ? \'pull-right\' : \'pull-left\' }">' +
  '<div class="message">{ item.message }</div>' +
  '<div class="upperLine">{ item.sender } - { item.timestamp }</div>' +
  '</div>',
  function (opts) {
    //let this.lists = splitByDate(opts.items);
    this.lists = splitByDate([{
      timestamp: moment('01/01/2000').unix(),
      c: 1
    }, {
      timestamp: moment('01/04/2000').unix() - 1,
      c: 2
    }, {
      timestamp: moment('01/04/2000').unix(),
      c: 3
    }, {
      timestamp: moment('01/04/2000').unix() + 1,
      c: 4
    }, {
      timestamp: moment('01/05/2000').unix(),
      c: 5
    }, {
      timestamp: moment('01/06/2000').unix(),
      c: 6
    }, {
      timestamp: moment('01/07/2000').unix(),
      c: 7
    }]);
    console.log(this.lists);
  }
);
