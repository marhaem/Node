const Request = require('request');
const Hawk = require('hawk');


// Client credentials

const credentials = {
    id: 'dh37fgj492je',
    key: 'efargae',
    algorithm: 'sha256'
};

// Request options

const requestOptions = {
    uri: 'http://localhost:3000/api/v1/oz',
    method: 'POST',
    headers: {}
};

// Generate Authorization request header

const header = Hawk.client.header(requestOptions.uri, requestOptions.method, { credentials: credentials, ext: 'some-app-data' });
requestOptions.headers.Authorization = header.field;

// Send authenticated request

Request(requestOptions, function (error, response, body) {

    // Authenticate the server's response

    const isValid = Hawk.client.authenticate(response, credentials, header.artifacts, { payload: body });

    // Output results

    console.log(`${response.statusCode}: ${body}` + (isValid ? ' (valid)' : ' (invalid)'));
});