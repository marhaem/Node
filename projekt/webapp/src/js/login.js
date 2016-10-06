/*global window, document*/

import $ from 'jquery';

function objectKeysToString(obj) {
  let ret;
  if(!obj) {
    return 'object is undefined';
  }
  else {
    for(let key in obj) {
      if(obj.hasOwnProperty(key)) {
        ret += key + '\n';// + response[key] + '\n';
      }
      else {
        //go fuck urself
      }
    }
    return ret;
  }

}

$(document).ready(function() {
  $('#login').click(function() {

    let $status = $('.status');
    let $email = $('#email').val();
    let $password = $('#password').val();

    $status.empty();
    $status.append('<p>Please wait...</p>');

    if($email === '' || $password === '') {
      $('input[type=text],input[type="password"]').css('border','2px solid red');
      $('input[type=text],input[type="password"]').css('box-shadow','0 0 3px red');
    }
    else {
      $.ajax({
        method: 'POST',
        url: window.location.origin + '/api/v1/login',
        data: {
          email: $email.toLowerCase(),
          password: $password
        }
      })
      .done((response) => {
        //check if ok else reroute
        $status.empty();
        $status.append('<p>' + response.data + '</p>');
      })
      .fail((response) => {//if error reply doesn't transact data given
        let message;
        console.log(objectKeysToString(response));

        if(response.responseJSON && response.responseJSON.error) {
          message = response.responseJSON.error;
        }
        else {
          message = 'wrong email or password';
        }
        $status.empty();
        $status.append('<p>' + response.data + '</p>');
      })
      .always(function() {
        //
      });
    }
  });
});
