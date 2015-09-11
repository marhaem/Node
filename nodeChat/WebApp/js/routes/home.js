/*jshint esnext:true */

import i18n from 'i18next-client';
import riot from 'riot';

riot.tag(
  'content-home',
  '<div style="padding: 40px 15px; text-align: center;">' +
    '<h1>{ opts.i18n.heading }</h1>' +
    '<p class="lead">{ opts.i18n.text }</p>' +
  '</div>',
  function(opts) {
    opts.i18n = i18n.t('routes.home', { returnObjectTrees: true });
  }
);

export let Home = {
  tagName: 'content-home'
};