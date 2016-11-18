import Oz from 'Oz';
import Hawk from 'hawk';

let ticket;
/*
const apps = {
        social: {
            id: 'social',
            scope: ['a', 'b', 'c'],
            key: 'werxhqb98rpaxn39848xrunpaw3489ruxnpa98w4rxn',
            algorithm: 'sha256'
        },
        network: {
            id: 'network',
            scope: ['b', 'x'],
            key: 'witf745itwn7ey4otnw7eyi4t7syeir7bytise7rbyi',
            algorithm: 'sha256'
        }
}

const req = {
  method: 'POST',
  url: '/oz/app',
  headers: {
    host: 'localhost',
    authorization: Oz.client.header('http://localhost:3000/oz/test', 'POST', ticket).field
  }
};

let encryptionPassword = 'bkahbsczig';

const options= {
  encryptionPassword,
  loadAppFunc: function (id, callback) {
    callback(null, apps[id]);
  }
};
Oz.endpoints.app();*/

const credentialsFunc = function (id, callback) {
  const credentials = {
    key: 'efargae',
    algorithm: 'sha256',
    user: 'Steve'
  };

  return callback(null, credentials);
};

const handler = function(req, res) {
  Hawk.server.authenticate(req, credentialsFunc, {}, (err, credentials, artifacts) => {
    const payload = (!err ? `Hello ${credentials.user} ${artifacts.ext}` : 'Shoosh!');
    const headers = {'Content-Type': 'text/plain'};

    const header = Hawk.server.header(credentials, artifacts, {
      payload,
      contentType: headers['Content-Type']
    });
    headers['Server-Authorization'] = header;

    res.writeHead(!err ? 200 : 400, headers);
    res.end(payload);
  });
};

Http.createServer(handler).listen(8000, 'localhost')
