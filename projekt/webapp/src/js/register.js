/*global window, document*/

import $ from 'jquery';

$(document).ready(function() {
  $('#register').click(function() {

    let $status = $('.status');
    let $email = $('#email').val();
    let $password = $('#password').val();
    let $firstName = $('#firstName').val();
    let $lastName = $('#lastName').val();

    $status.empty();
    $status.append('<p>Please wait...</p>');

    if($email === '' || $password === '') {
      $('input[type=text],input[type="password"]').css('border','2px solid red');
      $('input[type=text],input[type="password"]').css('box-shadow','0 0 3px red');
    }
    else {

      $.ajax({
        method: 'POST',
        url: window.location.origin + '/api/v1/register',
        data: {
          email: $email.toLowerCase(),
          firstName: $firstName,
          lastName: $lastName,
          password: $password
        }
      })
      .done((response) => {
        //check if ok else reroute
        //let message = 'Successfully registered!';
        $status.empty();
        $status.append('<p>' + response.data + '</p>'); // success
      })
      .fail((response) => {
        let message = response.status;

        if(response.responseJSON && response.responseJSON.error) {
          message += response.responseJSON.error;
        }
        else {
          message += ' Unknown error';
        }

        $status.empty();
        $status.append('<p>' + message + '</p>');
      })

      .always(function() {
        //
      });
    }
  });
});
