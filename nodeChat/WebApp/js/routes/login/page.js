import riot from 'riot';
import './header';
import './form';

riot.tag(
    'login-page',
    '<div class="login-page">' +
      '<div name="header"></div>' +
      '<div name="form"></div>',
    '</div>',
    function(opts) {
        //
        
        this.on('mount', function() {
            riot.mount(this.header, 'login-header', opts.header);
            riot.mount(this.form, 'login-form', opts.form);
        });
    }
);