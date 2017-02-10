/*
 *https://hapijs.com/tutorials/auth, https://hapijs.com/api#serverauthschemename-scheme, https://hapijs.com/api#serverauthstrategyname-scheme-mode-options
 *This module defines a scheme to authenticate a client-/user-request using jsonwebtokens.
 *The scheme is a method, which is being passed the hapi "server" object and an optional "options" object.
 *The options object is provided when registering the strategy later.
 *It can be whatever, e.g. another function used to authenticate... "hapi-auth-jwt2" uses this, so a specific method to validate a jwt can be implemented via a strategy
 *
 *The scheme-method returns an "authenticate"-method which acts like a request-handler and is called on every request as an intermediate function before the actual request-handler.
 *authenticate uses the validate-method provided in the options when registering a strategy.
 *the authenticate method itself returns a credentials-object.
 *the crendentials-object is accessible in the reply handler as request.auth.credentials.
 */

/*global console*/
import jwt from 'jsonwebtoken';
import boom from 'boom';

const log = function log(info) {
  console.log(info);
};

export default function scheme(server, options) {
  return {
    authenticate: function (request, reply) {
      log('hapiScheme#header: ' + JSON.stringify(request.headers));
      log('hapiScheme#payload: ' + JSON.stringify(request.payload));
      //log('request.state.authentication: ' + request.state.authentication);
      //check header for jwt - header authentication preferred, because xss or xrf
      if(!request.headers.authentication) {// read: if request.headers.authentication is null
        //check cookie for jwt
        if(!request.state.authentication) {// read: if request.state.authentication is null
          //credentials darf nicht null sein, sonst fehler durch hapi
          //isAuthorized===true, aber credentials===unauthorized. sonst gibt es nicht die Möglichkeit, eine Anfrage entsprechend weiterzu leiten
          reply.continue({credentials: 'unauthorized'});
        }
        else {
          // verify the jwt in the cookie
          jwt.verify(request.state.authentication, server.app.jwt_secret, (err, decoded) => {
            if(err) {
              log('couldn\'t verify token ' + err.message);
              reply.continue({credentials: 'expired'});
            }
            else {
              options.validateFunc(decoded, (err, id) => {
                if(err) {
                  log(err.message);
                  reply('session timed out');
                }
                else {
                  //log(id);
                  reply.continue({credentials: {userID: id, authorizedVia: 'cookie'}});
                }
              });
            }
          });
        }
      }
      // verify the jwt in the header
      else {
        jwt.verify(request.headers.authentication, server.app.jwt_secret, (err, decoded) => {
          if(err) {
            log(err.message);
            reply.continue({credentials: 'unauthorized'});
          }
          else {
            options.validateFunc(decoded, (err, id) => {
              if(err) {
                log(err.message);
                reply(boom.unauthorized('unauthorized', 'jwt'));
              }
              else {
                //log(id);
                reply.continue({credentials: {userID: id, authorizedVia: 'header'}});
              }
            });
          }
        });
      }
    }
  };
}
