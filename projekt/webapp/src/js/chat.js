import Riot from 'riot';

Riot.tag('helloworld',
  `<h1>
    { title }
  </h1>`,
  function(opts) {
    this.title = `${ opts.title } World!`;
  }
);

Riot.mount('helloworld');
