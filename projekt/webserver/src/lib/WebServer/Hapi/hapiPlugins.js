import hapiBunyan from 'hapi-bunyan';
import vision from 'vision';
import inert from 'inert';
import global from '../../Global';

export default [{
  register: vision,
  options: {}
}, {
  register: inert,
  options: {}
}, {
  register: hapiBunyan,
  options: {
    logger: global.logger
  }
}];
