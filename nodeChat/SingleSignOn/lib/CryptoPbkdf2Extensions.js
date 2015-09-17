'use strict';


/**
 * Size of one character in the hash in bits.
 */
var _hashCharBitLength = Math.pow(2, 32) - 1;


/**
 * Same as crypto.pbkdf2, but instead of HMAC-SHA1 uses HMAC-SHA256.
 * Asynchronous.
 *
 * @param {String} password
 * @param {String} salt
 * @param {Function} callback fn({Error} error, {String} salt, {String} hash)
 * @api public
 */
function pbkdf2HmacSha256(password, salt, iterations, keyLength, fn) {
	var hmacBitLength = 32;	// SHA256 HMAC length in bits

	// validation
	if (keyLength > _hashCharBitLength * hmacBitLength) {
		return fn && fn(new Error('Requested key length too long'));
	}
	else if (typeof password != 'string' && !Buffer.isBuffer(password)) {
		return fn && fn(new TypeError('password must a string or Buffer'));
	}
	else if (typeof salt != 'string' && !Buffer.isBuffer(salt)) {
		return fn && fn(new TypeError('salt must a string or Buffer'));
	}
	// compute hash
	else {
		// make sure salt is a buffer
		if (typeof salt == 'string') {
			salt = new Buffer(salt);
		}


		var derivedKey = new Buffer(keyLength),
			U = new Buffer(hmacBitLength),
			T = new Buffer(hmacBitLength),
			block1 = new Buffer(salt.length + 4),
			l = Math.ceil(keyLength / hmacBitLength),
			r = keyLength - (l - 1) * hmacBitLength;

		salt.copy(block1, 0, 0, salt.length);

		for (var i = 1; i <= l; i++) {
			block1[salt.length + 0] = (i >> 24 & 0xff);
			block1[salt.length + 1] = (i >> 16 & 0xff);
			block1[salt.length + 2] = (i >> 8  & 0xff);
			block1[salt.length + 3] = (i >> 0  & 0xff);

			U = _crypto.createHmac('sha256', password).update(block1).digest();

			U.copy(T, 0, 0, hmacBitLength);

			for (var j = 1; j < iterations; j++) {
				U = _crypto.createHmac('sha256', password).update(U).digest();

				for (var k = 0; k < hmacBitLength; k++) {
					T[k] ^= U[k];
				}
			}

			var destPos = (i - 1) * hmacBitLength;
			var len = (i == l)
				? r
				: hmacBitLength;
			T.copy(derivedKey, destPos, 0, len);
		}

		return fn && fn(null, derivedKey);
	}
}

/**
 * Same as crypto.pbkdf2, but instead of HMAC-SHA1 uses HMAC-SHA512.
 * Asynchronous.
 *
 * @param {String} password
 * @param {String} salt
 * @param {Function} callback fn({Error} error, {String} salt, {String} hash)
 * @api public
 */
function pbkdf2HmacSha512(password, salt, iterations, keyLength, fn) {
	var hmacBitLength = 64;	// SHA512 HMAC length in bits

	// validation
	if (keyLength > _hashCharBitLength * hmacBitLength) {
		return fn && fn(new Error('Requested key length too long'));
	}
	else if (typeof password != 'string' && !Buffer.isBuffer(password)) {
		return fn && fn(new TypeError('Password must a string or Buffer'));
	}
	else if (typeof salt != 'string' && !Buffer.isBuffer(salt)) {
		return fn && fn(new TypeError('Salt must a string or Buffer'));
	}
	// compute hash
	else {
		// make sure salt is a buffer
		if (typeof salt == 'string') {
			salt = new Buffer(salt);
		}


		var derivedKey = new Buffer(keyLength),
			U = new Buffer(hmacBitLength),
			T = new Buffer(hmacBitLength),
			block1 = new Buffer(salt.length + 4),
			l = Math.ceil(keyLength / hmacBitLength),
			r = keyLength - (l - 1) * hmacBitLength;

		salt.copy(block1, 0, 0, salt.length);

		for (var i = 1; i <= l; i++) {
			block1[salt.length + 0] = (i >> 24 & 0xff);
			block1[salt.length + 1] = (i >> 16 & 0xff);
			block1[salt.length + 2] = (i >> 8  & 0xff);
			block1[salt.length + 3] = (i >> 0  & 0xff);

			U = _crypto.createHmac('sha512', password).update(block1).digest();

			U.copy(T, 0, 0, hmacBitLength);

			for (var j = 1; j < iterations; j++) {
				U = _crypto.createHmac('sha512', password).update(U).digest();

				for (var k = 0; k < hmacBitLength; k++) {
					T[k] ^= U[k];
				}
			}

			var destPos = (i - 1) * hmacBitLength;
			var len = (i == l)
				? r
				: hmacBitLength;
			T.copy(derivedKey, destPos, 0, len);
		}

		return fn && fn(null, derivedKey);
	}
}