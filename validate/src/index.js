let validator = require('is-my-json-valid');

let externalSchema = {
	required: true,
	type: 'string'
};

let schema = {
	$ref: '#externalSchema'
};

let val = {
	required: true,
	type: 'object',
	properties: {
		hello: {
			required: true,
			type: 'string'
		},
		val: {
			required: true,
			type: 'string'
		}
	}
};

let filter = validator.filter({
	required: true,
	type: 'object',
	properties: {
		herro: {type: 'string', required: true}
	},
	additionalProperties: true // filters properties that are not defined here
});

let doc = {hello: 'world', val: 'string'};

let validate = validator(schema, {schemas: {externalSchema: externalSchema}});

types = {};

types.number = (name) => {
	return 'typeof ' + name + ' === "number"';
};

types.string = (name) => {
	return 'typeof ' + name + ' === "string"';
};

let a = 42;
let b = 'string';
let str = types.string(b);
debug(eval(str));
debug(eval(types.string(a)));
debug(eval(types.string(b)));
debug(eval(types.number(a)));
debug(eval(types.number(b)));

//@TODO: check JSON specification/documentations


function debug(val) {
	console.log(val);
}