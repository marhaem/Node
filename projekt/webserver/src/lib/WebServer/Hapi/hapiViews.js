import handlebars from 'handlebars';
const PATH_WEBAPP = '../webApp'; //@TODO: why isn't this path relative to the modules location

export default {
  engines: {
    'htm': handlebars,
    'html': handlebars
  },
  relativeTo: PATH_WEBAPP,
  path: './'
};
