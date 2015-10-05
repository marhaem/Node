/*jshint esnext:true*/

import $ from 'jquery';
import 'bootstrap';
import riot from 'riot';
import moment from 'moment';

/**
 */
function parseItems(items) {
  let len = items.length;
  let i = -1;
  let item;

  while (++i < len) {
    item = items[i];
    item.time = moment.unix(item.timestamp).format('hh:mm');
  }

  return items;
}

/**
 * timestamp is in seconds
 */
function splitByDate(items) {
  let lists = [];
  let i = items.length;
  let index = --i;
  let timestamp = moment.unix(items[index].timestamp).startOf('day').unix();
  let today = moment().startOf('day');
  let daysInThePast = today.diff(moment.unix(timestamp), 'days');

  while (--i >= 0) {
    if (items[i].timestamp < timestamp) {
      if (daysInThePast >= 3) {
        lists.unshift({
          daysInThePast: daysInThePast,
          timestamp: timestamp,
          items: items.slice(0, i + 1)
        });

        break;
      } else {
        lists.unshift({
          daysInThePast: daysInThePast,
          timestamp: timestamp,
          items: items.slice(i + 1, index + 1)
        });

        index = i;
        timestamp = moment.unix(items[index].timestamp).startOf('day').unix();
        daysInThePast = today.diff(moment.unix(timestamp), 'days');
      }
    }
  }

  return lists;
}

/*
 * listOld = Container list
 */
function merge(listsNew, lists) {

  var ts = lists[lists.length - 1].timestamp;

  var len = listsNew.length;
  var i = -1;

  // find matching lists and get items
  while (++i < len) {
    if (listsNew[i].timestamp === ts) {
      Array.prototype.push.apply(lists[lists.length - 1].items, listsNew[i].items);
      listsNew.splice(i, 1);
      break;
    }
  }

  // consolidate
  if (listsNew.length > 0) {
    Array.prototype.push(lists, listsNew);
    if (lists.length > 4) {
      //@TODO: merge
      len = lists.length - 3;
      i = 0;
      while (++i < len) {
        Array.prototype.push.apply(lists[0].items, lists[i].items);
      }
      lists.splice(1, len - 1);
    }
  }

  return lists;
}

function labelLists(lists) {
  let len = lists.length;
  let i = -1;
  let list;

  while (++i < len) {
    list = lists[i];
    if (list.daysInThePast === 0) {
      list.label = 'Today';
    } else if (list.daysInThePast === 1) {
      list.label = 'Yesterday';
    } else if (list.daysInThePast === 2) {
      list.label = '2 days ago';
    } else {
      list.label = 'Older';
    }

    list.label += ' - ' + moment.unix(list.timestamp).format('DD.MM.YYYY');
  }
  return lists;
}

riot.tag(
  'chat-message-container',
  '<div each="{ list in this.lists }" class="clearfix">' +
  '<div class="chat-message-container-label">{ list.label }</div>' +
  '<div each="{ item in list.items }" class="col-lg-8 col-md-9 col-xs-10 chatMessage { item.mine ? \'pull-right\' : \'pull-left\' }">' +
  '<div class="message">{ item.message }</div>' +
  '<div class="upperLine">{ item.from.name } - { item.time }</div>' +
  '</div>' +
  '</div>',
  function (opts) {
    this.lists = labelLists(splitByDate(parseItems(opts.items)));

    this.add = function add(items) {
      let timestamp = moment.unix(items[0].timestamp).startOf('day').unix();
      if (items.length > 0) {
        let listsNew;
        if (items.length > 1) {

          listsNew = [{
            daysInThePast: moment().startOf('day').diff(moment.unix(timestamp), 'days'),
            timestamp: timestamp,
            items: parseItems(items)
          }];
        } else {
          listsNew = [{
            daysInThePast: moment().startOf('day').diff(moment.unix(timestamp), 'days'),
            timestamp: timestamp,
            items: parseItems(items)
          }];
        }
        this.lists = merge(listsNew, this.lists);
      }
    };
  }
);
