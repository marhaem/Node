/*jshint esnext:true */

import i18n from 'i18next-client';
import riot from 'riot';

riot.tag(
  'content-404',
  '<div style="padding: 40px 15px; text-align: center;">' +
    '<h1>404</h1>' +
    '<p class="lead">{ opts.i18n.text }</p>' +
  '</div>',
  function(opts) {
    opts.i18n = i18n.t('routes.notFound404', { returnObjectTrees: true });
  }
);

export let NotFound404 = {
  tagName: 'content-404'
};