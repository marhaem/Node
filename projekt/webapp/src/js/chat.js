/*global window, document*/



import $ from 'jquery';

$(document).ready(function() {
  $('#sendMessage').click(function() {
    //do something
    let $board = $('#messageBoard').val();
    let $msg = $('#message').val();

    if(!$msg) {
      //lul yuo domp, fegget!??!11
    }
    else {
      // maek 1 ajax
      $.ajax({
        method: 'POST',
        url: window.location.origin + '/api/v1/sendMessage',
        data: {
          from: '',
          to: '',
          timestamp: '',
          message: $msg
        }
      })
      .done((response) => {
        $board.append('<p> You: ' + response + '</p>');
      })
      .fail((response) => {
        //lele wut?!
      })
      .always(function() {

      });
    }
  });
});



/*import Riot from 'riot';

Riot.tag('helloworld',
  `<h1>
    { title }
  </h1>`,
  function(opts) {
    this.title = `${ opts.title } World!`;
  }
);

Riot.mount('helloworld');
*/
