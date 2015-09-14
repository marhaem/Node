import $ from 'jquery';
import 'bootstrap';
import riot from 'riot';

riot.tag(
  'root-navbar',
  '<nav class="navbar navbar-default navbar-static-top">'+
      '<div class="container">'+
        '<div class="navbar-header">'+
          '<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">'+
            '<span class="sr-only">Toggle navigation</span>'+
            '<span class="icon-bar"></span>'+
            '<span class="icon-bar"></span>'+
            '<span class="icon-bar"></span>'+
          '</button>'+
          '<a class="navbar-brand" href="#login">MoWS</a>'+
        '</div>'+
        '<div id="navbar" class="navbar-collapse collapse">'+
          '<ul class="nav navbar-nav navbar-right">'+
            '<li each="{ item in opts.items }" class="{ item.active === true ? \'active\' : null }">'+
              '<a href="#{ item.href }">{ item.title }</a>'+
            '</li>'+
          '</ul>'+
        '</div>'+
      '</div>'+
    '</nav>' +
  '<div class="container-fluid">' +
    '<div name="content"></div>' +
  '</div>',
  function(opts) {
    // routeable
    RouteableComponent.bind(this);

    this.onRouteHit = function onRouteHit(route, index, params) {
      let i = -1;
      let len = opts.items.length;
      let hit = route.slice(0, index + 1).join('/');

      while (++i < len) {
        opts.items[i].active = (opts.items[i].href === hit);
      }

      this.update();

      this.Routeable.next(route, index, params, routes, this.content);
    };
  }
);