/* */ 
var test = require('tape');
var JWT = require('jsonwebtoken');
var secret = 'NeverShareYourSecret';
var server = require('./basic_server');
test("Attempt to access restricted content (without auth token)", function(t) {
  var options = {
    method: "POST",
    url: "/privado"
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "No Token should fail");
    t.end();
  });
});
test("Attempt to access restricted content (with an INVALID Token)", function(t) {
  var options = {
    method: "POST",
    url: "/privado",
    headers: {authorization: "Bearer fails.validation"}
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "INVALID Token should fail");
    t.end();
  });
});
test("Malformed JWT", function(t) {
  var options = {
    method: "POST",
    url: "/privado",
    headers: {authorization: "Bearer my.invalid.token"}
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "INVALID Token should fail");
    t.end();
  });
});
test("Try using a token with missing characters in body", function(t) {
  var token = JWT.sign({
    id: 123,
    "name": "Charlie"
  }, secret);
  var tokenData = token.split('.');
  var header = tokenData[0],
      body = tokenData[1],
      signature = tokenData[2];
  token = header + '.' + body.substring(0, body.length - 1) + '.' + signature;
  var options = {
    method: "POST",
    url: "/privado",
    headers: {authorization: "Bearer " + token}
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "INVALID Token should fail");
    t.end();
  });
});
test("Try using an incorrect secret to sign the JWT", function(t) {
  var token = JWT.sign({
    id: 123,
    "name": "Charlie"
  }, 'incorrectSecret');
  var options = {
    method: "POST",
    url: "/privado",
    headers: {authorization: "Bearer " + token}
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "Token signed with incorrect key fails");
    t.end();
  });
});
test("Token is well formed but is allowed=false so should be denied", function(t) {
  var token = JWT.sign({
    id: 321,
    "name": "Old Gregg"
  }, secret);
  var options = {
    method: "POST",
    url: "/privado",
    headers: {authorization: "Bearer " + token}
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "Denied");
    t.end();
  });
});
test("Access restricted content (with VALID Token)", function(t) {
  var token = JWT.sign({
    id: 123,
    "name": "Charlie"
  }, secret);
  var options = {
    method: "POST",
    url: "/privado",
    headers: {authorization: "Bearer " + token}
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "VALID Token should succeed!");
    t.end();
  });
});
test("Access restricted content (with Well-formed but invalid Token)", function(t) {
  var token = JWT.sign({
    id: 123,
    "name": "Charlie"
  }, 'badsecret');
  var options = {
    method: "POST",
    url: "/privado",
    headers: {authorization: "Bearer " + token}
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "InVALID Token should Error!");
    t.end();
  });
});
test("Request with undefined auth header should 401", function(t) {
  var options = {
    method: "POST",
    url: "/privado",
    headers: {authorization: "Bearer "}
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "InVALID Token fails (as expected)!");
    t.end();
  });
});
test("Auth mode 'required' should require authentication header", function(t) {
  var options = {
    method: "POST",
    url: "/required"
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "No token header should fail in auth 'required' mode");
    t.end();
  });
});
test("Auth mode 'required' should fail with invalid token", function(t) {
  var token = JWT.sign({
    id: 123,
    "name": "Charlie"
  }, 'badsecret');
  var options = {
    method: "POST",
    url: "/required",
    headers: {authorization: "Bearer " + token}
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "Invalid token should error!");
    t.end();
  });
});
test("Auth mode 'required' should should pass with valid token", function(t) {
  var token = JWT.sign({
    id: 123,
    "name": "Charlie"
  }, secret);
  var options = {
    method: "POST",
    url: "/required",
    headers: {authorization: "Bearer " + token}
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "Valid token should succeed!");
    t.end();
  });
});
test("Auth mode 'optional' should pass when no auth header specified", function(t) {
  var options = {
    method: "POST",
    url: "/optional"
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "No auth header should pass in optional mode!");
    t.end();
  });
});
test("Auth mode 'optional' should fail with invalid token", function(t) {
  var token = JWT.sign({
    id: 123,
    "name": "Charlie"
  }, 'badsecret');
  var options = {
    method: "POST",
    url: "/optional",
    headers: {authorization: "Bearer " + token}
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "Invalid token should error!");
    t.end();
  });
});
test("Auth mode 'optional' should pass with valid token", function(t) {
  var token = JWT.sign({
    id: 123,
    "name": "Charlie"
  }, secret);
  var options = {
    method: "POST",
    url: "/optional",
    headers: {authorization: "Bearer " + token}
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "Valid token should succeed!");
    t.end();
  });
});
test("Auth mode 'try' should pass when no auth header specified", function(t) {
  var options = {
    method: "POST",
    url: "/try"
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "No auth header should pass in 'try' mode!");
    t.end();
  });
});
test("Auth mode 'try' should pass with invalid token", function(t) {
  var token = JWT.sign({
    id: 123,
    "name": "Charlie"
  }, 'badsecret');
  var options = {
    method: "POST",
    url: "/try",
    headers: {authorization: "Bearer " + token}
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "Invalid token should pass in 'try' mode");
    t.end();
  });
});
test("Auth mode 'try' should pass with valid token", function(t) {
  var token = JWT.sign({
    id: 123,
    "name": "Charlie"
  }, secret);
  var options = {
    method: "POST",
    url: "/try",
    headers: {authorization: "Bearer " + token}
  };
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "Valid token should succeed!");
    t.end();
  });
});
test("Scheme should set token in request.auth.token", function(t) {
  var token = JWT.sign({
    id: 123,
    "name": "Charlie"
  }, secret);
  var options = {
    method: "GET",
    url: "/token",
    headers: {authorization: "Bearer " + token}
  };
  server.inject(options, function(response) {
    t.equal(response.result, token, 'Token is accesible from handler');
    t.end();
  });
});
test.onFinish(function() {
  server.stop(function() {});
});
