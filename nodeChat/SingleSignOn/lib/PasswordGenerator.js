'use strict';


// module dependencies
Crypto = require('crypto');
PasswordComplexity = require('./PasswordComplexity');


/// <var type='string' mayBeNull='false'>
/// 	Name of the database.
/// 	Constant.
/// </var>
var DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/// <var type='string' mayBeNull='false'>
/// 	Name of the database.
/// 	Constant.
/// </var>
var LOWER = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

/// <var type='string' mayBeNull='false'>
/// 	Name of the database.
/// 	Constant.
/// </var>
var UPPER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

/// <var type='string' mayBeNull='false'>
/// 	Name of the database.
/// 	Constant.
/// </var>
var SYMBOLS = ['!', '"', '§', '$', '%', '&', '/', '(', ')', '=', '?', '^', '+', '*', '#', '\'', '@', '<', '>', '|', '\\', '-', '_', '.', ':', ',', ';'];



/// <summary>
/// 	Password generator.
/// </summary>
/// <param name='complexity' type='object' optional='true'>Password complexity</param>
function PasswordGenerator(complexity) {
	this._complexity = PasswordComplexity.validate(complexity);
}

/// <summary>
/// 	Generates a cryptographically strong random password.
///		Uses predefined characters and always meets the password complexity reqirements.
///		Asynchronous.
/// </summary>
/// <param name='cb' type='function'>Callback({Error} error, {String} password)</param>
PasswordGenerator.prototype.generate = function(cb) {
	if (!cb) {
		throw new Error('Callback missing');
	}
	else {
		var complexity = this._complexity;

		// get random bytes and use them to generate the password
		Crypto.randomBytes(3 + (minLength * 2), function(error, buffer) {
			if (error) {
				cb(error);
			}
			else {
				var minLength = complexity.minLength;
				var minDigits = complexity.minDigits;
				var minLower = complexity.minLower;
				var minUpper = complexity.minUpper;
				var minSymbols = complexity.minSymbols;

				// enhance each min count to reach min length
				var charsNeeded = minLength - minDigits + minLower + minUpper + minSymbols;
				var count;
				var position = 0;

				if (charsNeeded > 0) {
					count = buffer[position++] % charsNeeded;
					minSymbols += count;
					charsNeeded -= count;
				}

				if (charsNeeded > 0) {
					count = buffer[position++] % charsNeeded;
					minLower += count;
					charsNeeded -= count;
				}

				if (charsNeeded > 0) {
					count = buffer[position++] % charsNeeded;
					minDigits += count;
					charsNeeded -= count;
				}

				if (charsNeeded > 0) {
					minUpper += charsNeeded;
				}

				// fill password
				position = 3;
				var password = [];

				var stop = position + minDigits;
				while (position < stop) {
					password.push(DIGITS[buffer[position++] % DIGITS.length]);
				}

				stop += minLower;
				while (position < stop) {
					password.push(LOWER[buffer[position++] % LOWER.length]);
				}

				stop += minUpper;
				while (position < stop) {
					password.push(UPPER[buffer[position++] % UPPER.length]);
				}

				stop += minSymbols;
				while (position < stop) {
					password.push(SYMBOLS[buffer[position++] % SYMBOLS.length]);
				}

				// jumble/shuffle
				var jumblePosition;
				var tmp;
				while (position-- > 0) {
					jumblePosition = buffer[position + minLength] % minLength;
					tmp = password[position];
					password[position] = password[jumblePosition];
					password[jumblePosition] = tmp;
				}

				cb(null, password.join(''));
			}
		});
	}
}


/// <summary>
/// 	Creates a new PasswordGenerator object and returns it.
/// </summary>
/// <param name='complexity' type='object' optional='true'>Password complexity</param>
/// <returns type='object'>New PasswordGenerator instance</returns>
function PasswordGeneratorFactory(complexity) {
	return new PasswordGenerator(complexity);
}


// export
if (typeof exports === 'object') {
	module.exports = PasswordGeneratorFactory;
}
else if (typeof define === 'function' && define.amd) {
	define(PasswordGeneratorFactory);
}