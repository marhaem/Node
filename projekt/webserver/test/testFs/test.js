const Http = require('http');
const Hawk = require('hawk');

// Credentials lookup function

const credentialsFunc = function (id, callback) {

    const credentials = {
        key: 'efargae',
        algorithm: 'sha256',
        user: 'Steve'
    };

    return callback(null, credentials);
};

// Create HTTP server

const handler = function (req, res) {

    // Authenticate incoming request
	console.log(req.headers.authorization);
    Hawk.server.authenticate(req, credentialsFunc, {}, (err, credentials, artifacts) => {

        // Prepare response
		//{user:credentials.user, ext: artifacts.ext, newToken: '1234566778899'}

        const payload = (!err ? `Hello ${credentials.user} ${artifacts.ext}` : 'Shoosh!');
        let headers = { 'Content-Type': 'aplication/json' };

        // Generate Server-Authorization response header

        const header = Hawk.server.header(credentials, artifacts, { payload, contentType: headers['Content-Type'] });
        headers['Server-Authorization'] = header;

        // Send the response back

        res.writeHead(!err ? 200 : 401, headers);
        res.end(payload);
    });
};

// Start server

Http.createServer(handler).listen(3000, 'localhost');