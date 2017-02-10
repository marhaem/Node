/*global window, document*/

import $ from 'jquery';

//@TODO:100 find a better way to route the client. readout Authenticate-cookie to authenticate on /chat

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
        if(!window.location.origin) {//if undefined or empty use window.location.href
          $status.empty();
          console.log('response: ' + response);

          $status.append('<p>' + 'successfully logged in!' + '</p>');
          //split http://example.com:3000/login
          let urlSplit = window.location.href.split('/');
          //put together the new url and set it on the client-side because rerouting doesn't work ¯\_(ツ)_/¯
          //window.location.href = urlSplit[0] + '//' + urlSplit[2] + response.responseJSON.data;
          //window.location.href = window.location.protocol + '//' + window.location.host + response.responseJSON.data;
          window.location.replace(urlSplit[0] + '//' + urlSplit[2] + response.data);
        }
        else {
          $status.empty();
          $status.append('<p>' + 'successfully logged in!' + '</p>');
          //@TODO:60 create a cookie or session id/token for the user and send it
          window.location.replace(window.location.origin + response.data);
        }
      })
      .fail((response) => {//if error reply doesn't transact data given
        let message;
        console.log('fail: ' + response.responseJSON.error);
        //console.log(objectKeysToString(response));
        //console.log(response.status);
        //console.log(response.responseText);
        //console.log(response.responseJSON);

        if(response.status !== 302) {
          if(response.responseJSON && response.responseJSON.error) {
            message = response.responseJSON.error;
          }
          else {
            message = 'wrong credentials or locked account!';
          }
          $status.empty();
          $status.append('<p>' + message + '</p>');
        }//@TODO:150 make it more modular
        else if(!window.location.origin) {//if undefined or empty use window.location.href
          $status.empty();
          $status.append('<p>' + 'successfully logged in!' + '</p>');
          //split http://example.com:3000/login
          let urlSplit = window.location.href.split('/');
          //put together the new url and set it on the client-side because rerouting doesn't work ¯\_(ツ)_/¯
          //window.location.href = urlSplit[0] + '//' + urlSplit[2] + response.responseJSON.data;
          //window.location.href = window.location.protocol + '//' + window.location.host + response.responseJSON.data;
          //window.location.replace(urlSplit[0] + '//' + urlSplit[2] + response.responseJSON.data);
        }
        else {
          $status.empty();
          $status.append('<p>' + 'successfully logged in!' + '</p>');
          //@TODO:60 create a cookie or session id/token for the user and send it
          //window.location.replace(window.location.origin + response.responseJSON.data);
        }
      })
      .always(function() {
        //
      });
    }
  });
});
