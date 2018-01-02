const tools = require('./tools');

module.exports.list = (event, context, callback) => {
  let knex = tools.initKnex();
  knex.select()
    .from('category')
    .orderBy('name')
    .asCallback((error, categories) => {
      if (error) {
        return console.error(error);
      }
      const response = tools.buildResponse(JSON.stringify(categories));
      callback(null, response);
      return knex.destroy();
    });
};

module.exports.get = (event, context, callback) => {
  let knex = tools.initKnex();
  knex.select()
    .from('category')
    .where('id', event.pathParameters.id)
    .asCallback((error, categories) => {
      if (error) {
        return console.error(error);
      }
      const response = tools.buildResponse(JSON.stringify(categories));
      callback(null, response);
      return knex.destroy();
    });
};
