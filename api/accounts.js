const tools = require('./tools');

module.exports.list = (event, context, callback) => {
  let knex = tools.initKnex();
  knex.select()
    .from('account')
    .whereNot('balance', 0)
    .orderBy('order')
    .asCallback((error, accounts) => {
      if (error) {
        return console.error(error);
      }
      const response = tools.buildResponse(JSON.stringify(accounts));
      callback(null, response);
      return knex.destroy();
    });
};

module.exports.get = (event, context, callback) => {
  let knex = tools.initKnex();
  knex.select()
    .from('account')
    .orderBy('order')
    .where('id', event.pathParameters.id)
    .asCallback((error, accounts) => {
      if (error) {
        return console.error(error);
      }
      const response = tools.buildResponse(JSON.stringify(accounts));
      callback(null, response);
      return knex.destroy();
    });
};
