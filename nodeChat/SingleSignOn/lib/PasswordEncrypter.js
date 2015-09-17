'use strict';


// module dependencies
var Crypto = require('crypto');


/// <var type='string' mayBeNull='false'>
/// 	Secret that will be applied to make brute force algorithms useless.
/// 	Constant.
/// </var>
var SECRET = require('./Secret').serialize('PasswordEncrypter.secret');


/// <summary>
/// 	Compares two strings `a` and `b` in length-constant time and invokes the callback `cb`.
/// 	Asynchronous.
/// </summary>
/// <param name='a' type='string'>First string</param>
/// <param name='b' type='string'>Second string</param>
/// <param name='cb' type='function'>Callback({Error} error, {Boolean} isEqual)</param>
function slowEquals(a, b, cb) {
	if (!cb) {
		throw new Error('Callback missing');
	}
	else if (!a) {
		cb(new Error('`a` missing'));
	}
	else if (typeof a !== 'string') {
		cb(new TypeError('`a` must be a string'));
	}
	else if (!b) {
		cb(new Error('`b` missing'));
	}
	else if (typeof b !== 'string') {
		cb(new TypeError('`b` must be a string'));
	}
	else {
		var lengthA = a.length;
		var lengthB = b.length;
		var i = (lengthA > lengthB) ? lengthA : lengthB;
		var diff = lengthA ^ lengthB;

		while (i-- > 0) {
			diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
		}

		cb(null, diff === 0);
	}
}


/// <var type='object' mayBeNull='false'>
/// 	Default values for the PasswordEncrypter options.
/// 	Constant.
/// </var>
var OPTIONS_DEFAULTS = {
	/// <field name='hashLength' tpye='number' integer='true' mayBeNull='false'>
	/// 	Length of a generated hash or salt in bytes.
	// </field>
	'hashLength': 128,

	/// <field name='iterations' type='number' integer='true' mayBeNull='false'>
	/// 	Number of pbkdf2 iterations.
	/// </field>
	'iterations': 12000
};


/// <summary>
/// 	Provides password encryption and validation.
/// </summary>
/// <remarks>
/// 	https://crackstation.net/hashing-security.htm
/// </remarks>
/// <param name='options' type='object' optional='true'>Encryption options</param>
function PasswordEncrypter(options) {
	if (options) {
		if (options.hasOwnProperty('hashLength') === false || typeof options['hashLength'] !== 'number') {
			options['hashLength'] = OPTIONS_DEFAULTS['hashLength'];
		}

		if (options.hasOwnProperty('iterations') === false || typeof options['iterations'] !== 'number') {
			options['iterations'] = OPTIONS_DEFAULTS['iterations'];
		}
	}
	else {
		options = OPTIONS_DEFAULTS;
	}

	/// <value type='object' mayBeNull='false'>
	/// 	Returns the current settings.
	/// </value>
	Object.defineProperty(this, 'settings', {
		get: function() {
			return options;
		}
	});
}

/// <summary>
/// 	Hashes a `password` with optional `salt` (generated if missing) and invokes the callback `cb`.
/// 	Uses crypto.pbkdf2 which uses HMAC-SHA1.
/// 	Asynchronous.
/// </summary>
/// <param name="password">{String} Password to hash</param>
/// <param name="salt">{String} Optional salt</param>
/// <param name="cb">{Function} Callback({Error} error, {String} hash, {String} optional salt)</param>
PasswordEncrypter.prototype.hash = function(password, salt, cb) {
	// hash(password, cb)
	if (typeof salt === 'function') {
		cb = salt;

		if (!cb) {
			throw new Error('Callback missing');
		}
		else if (!password) {
			cb(new Error('Password missing'));
		}
		else {
			var settings = this['settings'];

			Crypto.randomBytes(settings['hashLength'], function(error, salt) {
				if (error) {
					cb(error);
				}
				else {
					salt = salt.toString('base64');

					Crypto.pbkdf2(password, salt + SECRET, settings['iterations'], settings['hashLength'], function(error, hash) {
						error
							? cb(error)
							: cb(null, hash.toString('base64'), salt);
					});
				}
			});
		}
	}
	// hash(password, salt, cb)
	else {
		if (!cb) {
			throw new Error('Callback missing');
		}
		else if (!password) {
			cb(new Error('Password missing'));
		}
		else if (!salt) {
			cb(new Error('Salt missing'));
		}
		else {
			Crypto.pbkdf2(password, salt + SECRET, this['settings']['iterations'], this['settings']['hashLength'], function(error, hash) {
				error
					? cb(error)
					: cb(null, hash.toString('base64'));
			});
		}
	}
};

/// <summary>
/// 	Hashes a `password` with `sameSalt`, matches the resulting hash against the `expectedHash` and invokes the callback `cb`.
/// 	Asynchronous.
/// </summary>
/// <param name="password">{String} Password to validate</param>
/// <param name="sameSalt">{String} Salt that was used to hash the original password</param>
/// <param name="expectedHash">{String} Correct hash to match against</param>
/// <param name="cb">{Function} Callback({Error} error, {Boolean} isEqual)</param>
PasswordEncrypter.prototype.validate = function(password, sameSalt, expectedHash, cb) {
	if (!cb) {
		throw new Error('Callback missing');
	}
	else if (!sameSalt) {
		cb(new Error('Salt missing'));
	}
	else {
		this.hash(password, sameSalt, function(error, hash) {
			if (error) {
				cb(error);
			}
			else {
				slowEquals(hash, expectedHash, function(error, isEqual) {
					cb(error, isEqual);
				});
			}
		});
	}
};


/// <summary>
/// 	Creates a new PasswordEncrypter object and returns it.
/// </summary>
/// <param name='options' type='object' optional='true'>Encryption options</param>
/// <returns type='object'>New PasswordEncrypter instance</returns>
function PasswordEncrypterFactory(options) {
	return new PasswordEncrypter(options);
}


// export
if (typeof exports === 'object') {
	module.exports = PasswordEncrypterFactory;
}
else if (typeof define === 'function' && define.amd) {
	define(PasswordEncrypterFactory);
}