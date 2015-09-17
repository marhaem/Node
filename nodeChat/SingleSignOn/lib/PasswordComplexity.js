'use strict';


/// <var type='number'>Default minimum password length. Constant.</var>
var DEFAULT_MIN_LENGTH	= 8;

/// <var type='number'>Default minimum amount of digits the password has to contain. Constant.</var>
var DEFAULT_MIN_DIGITS	= 1;

/// <var type='number'>Default minimum amount of lowercase characters the password has to contain. Constant.</var>
var DEFAULT_MIN_LOWER	= 1;

/// <var type='number'>Default minimum amount of uppercase characters the password has to contain. Constant.</var>
var DEFAULT_MIN_UPPER	= 1;

/// <var type='number'>Default minimum amount of symbols the password has to contain. Constant.</var>
var DEFAULT_MIN_SYMBOLS	= 1;


/// <summary>
/// 	Password complexity values.
/// </summary>
/// <param name='complexity' type='object' optional='true'>Password complexity settings</param>
function PasswordComplexity() {
	//
}

/// <summary>
/// 	Always returns a _new_ valid password complexity settings object.
/// </summary>
/// <param name='complexity' type='object' optional='true'>Password complexity settings</param>
PasswordComplexity.validate(complexity) {
	var obj = {};

	if (complexity) {
		obj.minLength = (typeof complexity['minLength'] !== 'number' || complexity['minLength'] < DEFAULT_MIN_LENGTH)
			? DEFAULT_MIN_LENGTH
			: complexity['minLength'];

		obj.minDigits = (typeof complexity['minDigits'] !== 'number')
			? DEFAULT_MIN_DIGITS
			: complexity['minDigits'];

		obj.minLower = (typeof complexity['minLower'] !== 'number')
			? DEFAULT_MIN_LOWER
			: complexity['minLower'];

		obj.minUpper = (typeof complexity['minUpper'] !== 'number')
			? DEFAULT_MIN_UPPER
			: complexity['minUpper'];

		obj.minSymbols = (typeof complexity['minSymbols'] !== 'number')
			? DEFAULT_MIN_SYMBOLS
			: complexity['minSymbols'];
	}
	else {
		obj.minLength	= DEFAULT_MIN_LENGTH;
		obj.minDigits	= DEFAULT_MIN_DIGITS;
		obj.minLower	= DEFAULT_MIN_LOWER;
		obj.minUpper	= DEFAULT_MIN_UPPER;
		obj.minSymbols	= DEFAULT_MIN_SYMBOLS;
	}

	var calculatedMinLength = obj.minDigits + obj.minLower + obj.minUpper + obj.minSymbols;
	if (obj.minLength < calculatedMinLength) {
		obj.minLength = calculatedMinLength;
	}

	return obj;
}


// export
if (typeof exports === 'object') {
	module.exports = PasswordComplexity;
}
else if (typeof define === 'function' && define.amd) {
	define(PasswordComplexity);
}