/* */ 
'use strict';
const Boom = require('boom');
const Cryptiles = require('cryptiles');
const Hawk = require('hawk');
const Hoek = require('hoek');
const Iron = require('iron');
const Scope = require('./scope');
const internals = {};
internals.defaults = {
  ticketTTL: 60 * 60 * 1000,
  rsvpTTL: 1 * 60 * 1000,
  keyBytes: 32,
  hmacAlgorithm: 'sha256'
};
exports.issue = function(app, grant, encryptionPassword, options, callback) {
  const fail = Hoek.nextTick(callback);
  if (!app || !app.id) {
    return fail(Boom.internal('Invalid application object'));
  }
  if (grant && (!grant.id || !grant.user || !grant.exp)) {
    return fail(Boom.internal('Invalid grant object'));
  }
  if (!encryptionPassword) {
    return fail(Boom.internal('Invalid encryption password'));
  }
  if (!options) {
    return fail(Boom.internal('Invalid options object'));
  }
  const scope = (grant && grant.scope) || app.scope || [];
  const error = Scope.validate(scope);
  if (error) {
    return fail(error);
  }
  if (grant && grant.scope && app.scope && !Scope.isSubset(app.scope, grant.scope)) {
    return fail(Boom.internal('Grant scope is not a subset of the application scope'));
  }
  let exp = (Hawk.utils.now() + (options.ttl || internals.defaults.ticketTTL));
  if (grant) {
    exp = Math.min(exp, grant.exp);
  }
  const ticket = {
    exp,
    app: app.id,
    scope
  };
  if (grant) {
    ticket.grant = grant.id;
    ticket.user = grant.user;
  }
  if (options.delegate === false) {
    ticket.delegate = false;
  }
  exports.generate(ticket, encryptionPassword, options, callback);
};
exports.reissue = function(parentTicket, grant, encryptionPassword, options, callback) {
  const fail = Hoek.nextTick(callback);
  if (!parentTicket) {
    return fail(Boom.internal('Invalid parent ticket object'));
  }
  if (!encryptionPassword) {
    return fail(Boom.internal('Invalid encryption password'));
  }
  if (!options) {
    return fail(Boom.internal('Invalid options object'));
  }
  if (parentTicket.scope) {
    const error = Scope.validate(parentTicket.scope);
    if (error) {
      return fail(error);
    }
  }
  if (options.scope) {
    const error = Scope.validate(options.scope);
    if (error) {
      return fail(error);
    }
    if (!Scope.isSubset(parentTicket.scope, options.scope)) {
      return fail(Boom.forbidden('New scope is not a subset of the parent ticket scope'));
    }
  }
  if (options.delegate && parentTicket.delegate === false) {
    return fail(Boom.forbidden('Cannot override ticket delegate restriction'));
  }
  if (options.issueTo) {
    if (parentTicket.dlg) {
      return fail(Boom.badRequest('Cannot re-delegate'));
    }
    if (parentTicket.delegate === false) {
      return fail(Boom.forbidden('Ticket does not allow delegation'));
    }
  }
  if (grant && (!grant.id || !grant.user || !grant.exp)) {
    return fail(Boom.internal('Invalid grant object'));
  }
  if (grant || parentTicket.grant) {
    if (!grant || !parentTicket.grant || parentTicket.grant !== grant.id) {
      return fail(Boom.internal('Parent ticket grant does not match options.grant'));
    }
  }
  let exp = (Hawk.utils.now() + (options.ttl || internals.defaults.ticketTTL));
  if (grant) {
    exp = Math.min(exp, grant.exp);
  }
  const ticket = {
    exp,
    app: options.issueTo || parentTicket.app,
    scope: options.scope || parentTicket.scope
  };
  if (!options.ext && parentTicket.ext) {
    options = Hoek.shallow(options);
    options.ext = parentTicket.ext;
  }
  if (grant) {
    ticket.grant = grant.id;
    ticket.user = grant.user;
  }
  if (options.issueTo) {
    ticket.dlg = parentTicket.app;
  } else if (parentTicket.dlg) {
    ticket.dlg = parentTicket.dlg;
  }
  if (options.delegate === false || parentTicket.delegate === false) {
    ticket.delegate = false;
  }
  exports.generate(ticket, encryptionPassword, options, callback);
};
exports.rsvp = function(app, grant, encryptionPassword, options, callback) {
  const fail = Hoek.nextTick(callback);
  if (!app || !app.id) {
    return fail(Boom.internal('Invalid application object'));
  }
  if (!grant || !grant.id) {
    return fail(Boom.internal('Invalid grant object'));
  }
  if (!encryptionPassword) {
    return fail(Boom.internal('Invalid encryption password'));
  }
  if (!options) {
    return fail(Boom.internal('Invalid options object'));
  }
  options.ttl = options.ttl || internals.defaults.rsvpTTL;
  const envelope = {
    app: app.id,
    exp: Hawk.utils.now() + options.ttl,
    grant: grant.id
  };
  Iron.seal(envelope, encryptionPassword, options.iron || Iron.defaults, (err, sealed) => {
    if (err) {
      return callback(err);
    }
    const rsvp = sealed;
    return callback(null, rsvp);
  });
};
exports.generate = function(ticket, encryptionPassword, options, callback) {
  const fail = Hoek.nextTick(callback);
  const random = Cryptiles.randomString(options.keyBytes || internals.defaults.keyBytes);
  if (random instanceof Error) {
    return fail(random);
  }
  ticket.key = random;
  ticket.algorithm = options.hmacAlgorithm || internals.defaults.hmacAlgorithm;
  if (options.ext) {
    ticket.ext = {};
    if (options.ext.public !== undefined) {
      ticket.ext.public = options.ext.public;
    }
    if (options.ext.private !== undefined) {
      ticket.ext.private = options.ext.private;
    }
  }
  Iron.seal(ticket, encryptionPassword, options.iron || Iron.defaults, (err, sealed) => {
    if (err) {
      return callback(err);
    }
    ticket.id = sealed;
    if (ticket.ext) {
      if (ticket.ext.public !== undefined) {
        ticket.ext = ticket.ext.public;
      } else {
        delete ticket.ext;
      }
    }
    return callback(null, ticket);
  });
};
exports.parse = function(id, encryptionPassword, options, callback) {
  const fail = Hoek.nextTick(callback);
  if (!encryptionPassword) {
    return fail(Boom.internal('Invalid encryption password'));
  }
  if (!options) {
    return fail(Boom.internal('Invalid options object'));
  }
  Iron.unseal(id, encryptionPassword, options.iron || Iron.defaults, (err, object) => {
    if (err) {
      return callback(err);
    }
    const ticket = object;
    ticket.id = id;
    return callback(null, ticket);
  });
};
