/* */ 
var Joi = require('../lib/index');
var intRating = Joi.number().integer().min(1).max(5);
var schema = Joi.object().keys({
  q1: Joi.boolean().required(),
  q2: Joi.boolean().when('q1', {
    is: true,
    then: Joi.required()
  }),
  q3: Joi.string().when('q2', {
    is: true,
    then: Joi.valid('1-5', '6-10', '11-50', '50+').required()
  }),
  q4: Joi.array().when('q3', {
    is: '1-5',
    then: Joi.array().min(0).max(1).items(intRating).required()
  }).when('q3', {
    is: '6-10',
    then: Joi.array().min(1).max(2).items(intRating).required()
  }).when('q3', {
    is: '11-50',
    then: Joi.array().min(2).max(10).items(intRating).required()
  }).when('q3', {
    is: '50+',
    then: Joi.array().min(10).items(intRating).required()
  }),
  q5: Joi.array().when('q3', {
    is: '1-5',
    then: Joi.array().min(1).max(4).items(intRating).required()
  }).when('q3', {
    is: '6-10',
    then: Joi.array().min(4).max(8).items(intRating).required()
  }).when('q3', {
    is: '11-50',
    then: Joi.array().min(8).max(40).items(intRating).required()
  }).when('q3', {
    is: '50+',
    then: Joi.array().min(40).items(intRating).required().required()
  }),
  q6: intRating.required()
});
var response = {
  q1: true,
  q2: true,
  q3: '1-5',
  q4: [5],
  q5: [1],
  q6: 2
};
Joi.assert(response, schema);
