import handlebars from 'handlebars';
const PATH_WEBAPP = '../webApp';

export default {
  engines: {
    'htm': handlebars,
    'html': handlebars
  },
  relativeTo: PATH_WEBAPP,
  path: './'
};
