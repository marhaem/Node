/*jshint esnext:true*/

import $ from 'jquery';
import 'bootstrap';
import riot from 'riot';
import moment from 'moment';

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}


/**
 */
function parseItems(items) {
  let len = items.length;
  let i = -1;
  let item;
  while (++i < len) {
    item = items[i];
    item.time = moment(item.timestamp).format('hh:mm');
  }
  return items;
}

/**
 * timestamp is in seconds
 */
function splitByDate(items) {

  let splittedLists = [{
    items: []
  },{
    items: []
  },{
    items: []
  }];
  let i = items.length;
  let index = --i ;
  let itemStamp = moment(items[index].timestamp.format('YYYY-MM-DD'));
  var listCounter = 2;
  let list = [];

  while (index >= 0) {
    let curItemStamp = moment(items[index].timestamp).startOf('day');
    if (!Math.abs(itemStamp.diff(curItemStamp, 'days')) == 0) {
      itemStamp = moment(items[index].timestamp).startOf('day');
      if (listCounter == 2 || listCounter == 1) {
        listCounter--;
      }
      splittedLists[listCounter].items.unshift(items[index]);
    } else {
      splittedLists[listCounter].items.unshift(items[index]);
      splittedLists[listCounter].timestamp = moment(items[index].timestamp).startOf('day');
    }
    index--;
  }
  return splittedLists;
}

function labelLists(lists) {
  let len = lists.length;
  let i = len;
  let list;

  while (--i > 0) {
    list = lists[i];

    list.label = moment(list.timestamp).utc().format('LL');
  }
  lists[0].label = "Older";
  return lists;
}

riot.tag(
  'chat-message-container',
  '<div each="{ list in this.lists }" class="clearfix">' +
  '<div class="chat-message-container-label" data-spy="affix" data-offset-top="75">{ list.label }</div>' +
  '<div each="{ item in list.items }" class="col-lg-8 col-md-9 col-xs-10 chatMessage { item.mine ? \'pull-right\' : \'pull-left\' }">' +
  '<div class="message">{ item.message }</div>' +
  '<div class="upperLine">{ item.from.name } - { item.time }</div>' +
  '</div>' +
  '</div>',
  function (opts) {
    this.items = opts.items;
    this.lists = labelLists(splitByDate(parseItems(this.items)));
    this.update();

    this.add = function add(newItems) {

      if (newItems.length > 0) {
        //this.items.unshift(newItems);
        // console.warn("test achtung");
        // console.log(newItems);
        console.log(parseItems(newItems));

        var ind = newItems.length;

        while (--ind >= 0) {
          this.items.push(parseItems(newItems[ind]));
        }
        this.lists = labelLists(splitByDate(this.items));
        // this.lists[2].items.push(parseItems(newItems)); // = labelLists(splitByDate(parseItems(this.items)));
        //this.lists = merge(listsNew, this.lists);
        this.update();
      }
    };
    this.on('update', function(){
      setCookie('lastUpdate', moment().utc().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z', 365);
    })
  }
);
