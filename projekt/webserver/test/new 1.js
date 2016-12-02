'use strict';

const jwt = require('jsonwebtoken');
const Boom = require('boom');

function UserController (db) {
  this.database = db;
  this.model = db.User;
}

module.exports = UserController;

UserController.prototype.create = function (request, reply) {
  let payload = request.payload;

  this.model.createAsync(payload)
  .then((user) => {
    let token = getToken(user.id);

    reply({
      token: token
    }).code(201);
  })
  .catch((err) => {
    reply(Boom.badImplementation(err.message));
  });
};

UserController.prototype.logIn = function (request, reply) {
  let credentials = request.payload;

  this.model.findOneAsync({email: credentials.email})
  .then((user) => {
    if (!user) {
      return reply(Boom.unauthorized('Email or Password invalid'));
    }

    if (!user.validatePassword(credentials.password)) {
      return reply(Boom.unauthorized('Email or Password invalid'));
    }

    let token = getToken(user.id);

    reply({
      token: token
    });
  })
  .catch((err) => {
    reply(Boom.badImplementation(err.message));
  });
};

function getToken (id) {
  let secretKey = process.env.JWT || 'stubJWT';

  return jwt.sign({
    id: id
  }, secretKey, {expiresIn: '18h'});
}