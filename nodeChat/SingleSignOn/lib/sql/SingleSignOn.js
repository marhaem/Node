'use strict';


// module dependencies
var Mysql = require('mysql');
var Schema = require('./SingleSignOnSchema');
var PasswordEncrypter = require('./PasswordEncrypter')({ hashLength: 128, iterations: 12000 });


/// <summary>
/// 	.
/// </summary>
/// <param name='mysqlConnection' type='object'>Database connection object</param>
function mysqlConnect(mysqlConnection) {
	mysqlConnection.connect(function mysqlConnectConnectCB(error) {
		if (error) {
			console.log('Error when connecting to database:', error);
			setTimeout(function mysqlConnectRetry() {
				mysqlConnect(mysqlConnection);
			}, 2000);
		}
	});

	mysqlConnection.on('error', function mysqlConnectOnErrorCB(error) {
		console.log('Database error:', error);

		if (error.code === 'PROTOCOL_CONNECTION_LOST') {
			console.log('Lost connection, reconnecting:', error.stack);
			mysqlConnect(Mysql.createConnection(mysqlConnection.config));
		}
		else {
			throw error;
		}
	});
}

/// <summary>
/// 	Returns a new function that closes the connection before invoking cb.
/// </summary>
/// <param name='mysqlConnection' type='object'>Database connection object</param>
/// <param name='cb' type='function'>Callback that is executed after the database connection was closed</param>
function getMysqlEndCallback(mysqlConnection, cb) {
	return function() {
		var args = arguments;
		mysqlConnection.end(function mysqlEndCB(error) {
			if (error) {
				cb(error);
			}
			else {
				cb.apply(this, args);
			}
		});
	}
}


/// <summary>
/// 	Checks if there is already a user with the given email address.
/// 	Asynchronous.
/// </summary>
/// <param name='mysqlConnectionConfig' type='object'>Database connection configuration</param>
/// <param name='email' type='string'>Email to check</param>
/// <param name='cb' type='function'>Callback({Error} error, {Boolean} exists)</param>
function emailExists(mysqlConnection, email, cb) {
	if (!cb) {
		throw new Error('Callback missing');
	}
	else if (!mysqlConnection) {
		cb(new Error('Database connection missing'));
	}
	else if (!email) {
		cb(new Error('Email missing'));
	}
	else {
		mysqlConnection.query(
			'SELECT COUNT(*) FROM ??.?? WHERE ? LIMIT 1',
			[Schema['DATABASE'], Schema['TABLE_USERS'], { 'Email': email }],
			function emailExistsQueryCB(error, rows) {
				if (error) {
					cb(error);
				}
				else {
					cb(null, rows[0]['COUNT(*)'] !== 0 ? true : false);
				}
			}
		);
	}
}

/// <summary>
/// 	.
/// 	Asynchronous.
/// </summary>
/// <param name='mysqlConnectionConfig' type='object'>Database connection configuration</param>
/// <param name='user' type='object'>User to insert</param>
/// <param name='cb' type='function'>Callback({Error} error, {Number} userId)</param>
function insertUser(mysqlConnection, user, cb) {
	if (!cb) {
		throw new Error('Callback missing');
	}
	else if (!mysqlConnection) {
		cb(new Error('Database connection missing'));
	}
	else if (!user) {
		cb(new Error('User missing'));
	}
	else if (!user.email) {
		cb(new Error('User has no `email`'));
	}
	else if (!user.passwordHash) {
		cb(new Error('User has no `passwordHash`'));
	}
	else if (!user.passwordSalt) {
		cb(new Error('User has no `passwordSalt`'));
	}
	else {
		mysqlConnection.query(
			'INSERT INTO ??.?? SET ?',
			[Schema['DATABASE'], Schema['TABLE_USERS'], {
				'AccountLocked'				: user.accountLocked ? user.accountLocked : false,
				'Email'						: user.email,
				'EmailVerified'				: user.emailVerified ? user.emailVerified : false,
				'PasswordHash'				: user.passwordHash,
				'PasswordSalt'				: user.passwordSalt,
				'PasswordErrorCount'		: 0,
				'PasswordIsTemporary'		: user.passwordIsTemporary ? user.passwordIsTemporary : false,
				'PasswordLastWrong'			: null,
				'SecureQuestion'			: user.secureQuestion ? user.secureQuestion : null,
				'SecureQuestionAnswer'		: user.secureQuestionAnswer ? user.secureQuestionAnswer : null,
				'SecureQuestionLastWrong'	: null,
				'FirstName'					: user.firstName ? user.firstName : null,
				'LastName'					: user.lastName ? user.lastName : null,
				'DateOfBirth'				: user.dateOfBirth ? user.dateOfBirth : null,
				'PreferredLanguage'			: user.preferredLanguage ? user.preferredLanguage : null
			}],
			function insertUserQueryCB(error, result) {
				if (error) {
					cb(error);
				}
				else {
					cb(null, result.insertId);
				}
			}
		);
	}
}


/// <summary>
/// 	Single sign on interface.
/// </summary>
/// <param name='mysqlConnectionConfig' type='object'>Database connection configuration</param>
function SingleSignOn(mysqlConnectionConfig) {
	if (!mysqlConnectionConfig) {
		throw new Error('Mysql connection configuration missing');
	}
	else {
		/// <value type='object' mayBeNull='false'>
		/// 	Returns the current mysql connection configuration.
		/// </value>
		Object.defineProperty(this, 'mysqlConnectionConfig', {
			get: function() {
				return mysqlConnectionConfig;
			}
		});


		var _prepared = false;

		/// <value type='object' mayBeNull='false'>
		/// 	Returns the current mysql connection configuration.
		/// </value>
		Object.defineProperty(this, 'prepared', {
			get: function() {
				return _prepared;
			}
		});

		/// <summary>
		/// 	Makes sure the database schema exists and invokes the callback `cb`.
		/// 	Asynchronous.
		/// </summary>
		/// <param name='cb' type='function'>Callback({Error} error)</param>
		this.prepare = function(cb) {
			if (!cb) {
				throw new Error('Callback missing');
			}
			else if (_prepared === false) {
				Schema.prepare(this['mysqlConnectionConfig'], function singleSignOnSchemaPrepareCB(error) {
					if (error) {
						cb(error);
					}
					else {
						_prepared = true;
						cb();
					}
				});
			}
		};
	}
}

/// <summary>
/// 	Creates a new user.
/// 	Asynchronous.
/// </summary>
/// <param name='user' type='object'>User to create.</param>
/// <param name='cb' type='function'>Callback({Error} error, {Boolean} alreadyExists, {Number} newUserId)</param>
SingleSignOn.prototype.createUser = function(user, cb) {
	if (this['prepared'] === false) {
		cb(new Error('Schema not prepared'));
	}
	else if (!cb) {
		throw new Error('Callback missing');
	}
	else if (!user) {
		cb(new Error('User missing'));
	}
	else if (!user.password && (!user.passwordHash || !user.passwordSalt)) {
		cb(new Error('User has to provide either `password` or `passwordHash` and `passwordSalt`'));
	}
	else {
		var mysqlConnection = Mysql.createConnection(this['mysqlConnectionConfig']);
		cb = getMysqlEndCallback(mysqlConnection, cb);
		mysqlConnect(mysqlConnection);

		// check if email exists
		emailExists(mysqlConnection, user.email, function registerEmailExistsCB(error, alreadyExists) {
			if (error) {
				cb(error);
			}
			else if (alreadyExists) {
				cb(null, alreadyExists);
			}
			else {
				if (user.passwordHash) {
					insertUser(mysqlConnection, user, function insertUserCB(error, userId) {
						cb(error, alreadyExists, userId);
					});
				}
				else {
					PasswordEncrypter.hash(user.password, function hashCB(error, hash, salt) {
						if (error) {
							cb(error);
						}
						else {
							user.passwordHash = hash;
							user.passwordSalt = salt;
							insertUser(mysqlConnection, user, function insertUserWithHashCB(error, userId) {
								cb(error, alreadyExists, userId);
							});
						}
					});
				}
			}
		});
	}
};


/// <summary>
/// 	Creates a new SingleSignOn object and returns it.
/// </summary>
/// <param name='mysqlConnectionConfig' type='object'>Database connection configuration</param>
/// <returns type='object'>New PasswordEncrypter instance</returns>
function SingleSignOnFactory(mysqlConnectionConfig) {
	return new SingleSignOn(mysqlConnectionConfig);
}


// export
if (typeof exports === 'object') {
	module.exports = SingleSignOnFactory;
}
else if (typeof define === 'function' && define.amd) {
	define(SingleSignOnFactory);
}