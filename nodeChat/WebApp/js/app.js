import $ from 'jquery';
import i18n from 'i18next-client';

$(document).ready(function ready() {
	'use strict';

  // load i18n translation
  i18n.init({
    resGetPath: '../locales/__ns__.__lng__.json',
    fallbackLng: 'en',
    lngWhitelist: ['en', 'de']
  }, function(error, t) {
    if (error) {
      console.log(error);
    }
    else {
      // start routing
      System.import('./js/router').then(function(Router) {
        Router = Router.Router;

        System.import('./js/routes').then(function(Routes) {
          Routes = Routes.Routes;

          Routes.init(document.body);
          Router.start('login', Routes);
        });
      });
    }
  });
});