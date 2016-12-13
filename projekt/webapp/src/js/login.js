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

    if($email === '' || $password === '') {
      $('input[type=text],input[type="password"]').css('border','2px solid red');
      $('input[type=text],input[type="password"]').css('box-shadow','0 0 3px red');
    }
    else {
      $status.append('<p>Please wait...</p>');
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
        $status.append('<p>' + response + '</p>');
        console.log(response);
      })
      .fail((response) => {//if error reply doesn't transact data given
        let message;
        //console.log(objectKeysToString(response));
        //console.log(response.status);
        //console.log(response.responseText);
        //console.log(response.responseJSON);

        if(response.status !== 302)
        {
          if(response.responseJSON && response.responseJSON.error) {
            message = response.responseJSON.error;
          }
          else {
            message = 'wrong credentials or locked account!';
          }
          $status.empty();
          $status.append('<p>' + message + '</p>');
        }//@TODO: make it more modular
        else if(!window.location.origin) {//every browser should be able to do this
          $status.empty();
          $status.append('<p>' + 'successfully logged in!' + '</p>');
          let urlSplit = window.location.href.split('/');
          window.location.href = urlSplit[0] + '//' + urlSplit[2] + response.responseJSON.data;
          //window.location.href = window.location.protocol + '//' + window.location.host + response.responseJSON.data;
          //window.location.replace(urlSplit[0] + '//' + urlSplit[2] + response.responseJSON.data);
        }
        else {
          $status.empty();
          $status.append('<p>' + 'successfully logged in!' + '</p>');
          //@TODO: create a cookie or session id/token for the user and send it
          window.location.replace(window.location.origin + response.responseJSON.data);
        }
      })
      .always(function() {
        //
      });
    }
  });
});
