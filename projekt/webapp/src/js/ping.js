/*global window*/

import $ from 'jquery';
import moment from 'moment';


$(function() {
  let $div = $('<div></div>');
  $div.css({paddingTop: '49vh'});

  let $status = $('<div></div>');
  $status.addClass('status');
  $status.css({textAlign: 'center'});

  let $button = $('<button>click</button>');
  $button.css({display: 'block', marginLeft: 'auto', marginRight: 'auto'});
  $button.on('click', () => {
    $status.empty();
    $status.append('<p>Please wait...</p>');

    $.ajax({
      method: 'POST',
      url: window.location.origin + '/api/v1/ping',
      data: {
        date: moment().toISOString()
      }
    })
    .done(function (response) {
      $status.empty();
      $status.append('<p>Done, request took ' + Math.abs(parseInt(response.data, 10)).toString() + 'ms</p>');
    })
    .fail(function (response) {
      let message = response.status + ': ';

      if (response.responseJSON && response.responseJSON.error) {
        message += response.responseJSON.error;
      }
      else {
        message += ' Unknown error';
      }

      $status.empty();
      $status.append('<p>' + message + '</p>');
    })
    .always(function () {
      //
    });
  });

  $div.append($button);
  $div.append($status);
  $('body').append($div);
});
