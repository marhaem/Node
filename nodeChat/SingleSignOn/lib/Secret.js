'use strict';


// module dependencies
var Crypto  = require("crypto");
var FileSystem  = require("fs");


/// <var type='string' mayBeNull='false'>
/// 	Cipher that will be used.
/// 	Constant.
/// </var>
var CIPHER = undefined;

/// <summary>
/// 	Tries to set the best available cipher.
/// 	Synchronous.
/// </summary>
function setBestAvailableCipher() {
	var goodCiphers = ['aes-256-cbc-hmac-sha1', 'aes-256-cbc'];
	var availableCiphers = Crypto.getCiphers();

	var i = goodCiphers.length;
	var index;
	while (i-- > 0) {
		index = availableCiphers.indexOf(goodCiphers[i]);
		if (index !== -1) {
			CIPHER = availableCiphers[index];
		}
	}

	if (!CIPHER) {
		throw new Error('No good cipher found');
	}
}

if (!CIPHER) {
	setBestAvailableCipher();
}


/// <var type='string' mayBeNull='false'>
/// 	Hash algorithm that will be used.
/// 	Constant.
/// </var>
var HASH_ALGORITHM = undefined;

/// <summary>
/// 	Tries to set the best hash algorithm.
/// 	Synchronous.
/// </summary>
function setBestAvailableHashAlgorithm() {
	var goodHashAlgortihms = ['sha512WithRSAEncryption', 'rsa-sha512', 'sha512', 'sha256WithRSAEncryption', 'rsa-sha256', 'sha256'];
	var availableHashAlgorithms = Crypto.getHashes();

	var i = goodHashAlgortihms.length;
	var index;
	while (i-- > 0) {
		index = availableHashAlgorithms.indexOf(goodHashAlgortihms[i]);
		if (index !== -1) {
			HASH_ALGORITHM = availableHashAlgorithms[index];
		}
	}

	if (!HASH_ALGORITHM) {
		throw new Error('No good hash algorithm found');
	}
}

if (!HASH_ALGORITHM) {
	setBestAvailableHashAlgorithm();
}


/// <summary>
/// 	Secret generator with save/load functionality.
/// </summary>
function Secret() {
	//
}

/// <summary>
/// 	Generates a cryptographically strong random secret.
/// 	Synchronous.
/// </summary>
Secret.generate = function() {
	var cipher = Crypto.createCipher(CIPHER, Crypto.randomBytes(64));
	return cipher.update(new Buffer(Crypto.randomBytes(64)), null, 'base64').toString() + cipher.final('base64').toString();
};

/// <summary>
/// 	Saves the secret to a file.
/// 	Synchronous or Asynchronous depending on if `cb` is given.
/// </summary>
/// <param name='filename' type='string'>Filename where to save the secret</param>
/// <param name='secret' type='string'>Secret to save</param>
/// <param name='cb' type='function' optional='true'>Optional callback({Error} error)</param>
Secret.save = function(filename, secret, cb) {
	// synchronous
	if (!cb) {
		FileSystem.writeFileSync(filename, secret);
	}
	// asynchronous
	else {
		FileSystem.writeFile(filename, secret, cb);
	}
};

/// <summary>
/// 	Loads the secret from a file.
/// 	Synchronous or Asynchronous depending on if `cb` is given.
/// </summary>
/// <param name='filename' type='string'>Filename where to load the secret</param>
/// <param name='cb' type='function' optional='true'>Optional callback({Error} error, {String} secret)</param>
/// <returns type='string' mayBeNull='true'>Returns the secret when called without `cb` specified</returns>
Secret.load = function(filename, cb) {
	// synchronous
	if (!cb) {
		return FileSystem.readFileSync(filename).toString();
	}
	// asynchronous
	else {
		FileSystem.readFile(filename, function(error, data) {
			cb(error, data ? data.toString() : data);
		});
	}
};

/// <summary>
/// 	Tries to load the secret from `filename`. If it doesn't exist it generates a new secret and saves it to `filename`.
/// 	Synchronous or Asynchronous depending on if `cb` is given.
/// </summary>
/// <param name='filename' type='string'>Filename where to load/save the secret</param>
/// <param name='cb' type='function' optional='true'>Optional callback({Error} error, {String} secret)</param>
/// <returns type='string' mayBeNull='true'>Returns the secret when called without `cb` specified</returns>
Secret.serialize = function(filename, cb) {
	// synchronous
	if (!cb) {
		var _secret;

		try {
			_secret = Secret.load(filename);
		}
		catch (error) {
			try {
				_secret = Secret.generate();
				Secret.save(filename, _secret);
			}
			catch (error) {
				throw error;
			}
		}

		return _secret;
	}
	// asynchronous
	else {
		Secret.load(filename, function(error, secret) {
			if (error) {
				secret = Secret.generate();

				Secret.save(filename, secret, function(error) {
					if (error) {
						cb(error);
					}
					else {
						cb(null, secret);
					}
				});
			}
			else {
				cb(null, secret);
			}
		});
	}
}


// export
if (typeof exports === 'object') {
	module.exports = Secret;
}
else if (typeof define === 'function' && define.amd) {
	define(Secret);
}
else if (typeof window !== 'undefined') {
	window.Secret = Secret;
}
else if (typeof global !== 'undefined') {
	global.Secret = Secret;
}
else if (typeof self !== 'undefined') {
	self.Secret = Secret;
}
else {
	// uh-oh
}
