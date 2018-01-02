const tools = require('./tools');

module.exports.list = (event, context, callback) => {
  getUncheckedOperations(event, context, callback);
};

module.exports.get = (event, context, callback) => {
  let knex = tools.initKnex();
  knex.select()
    .from('operation')
    .where('id', event.pathParameters.id)
    .asCallback((error, operations) => {
      if (error) {
        return console.error(error);
      }
      const response = tools.buildResponse(JSON.stringify(operations));
      callback(null, response);
      return knex.destroy();
    });
};

const getUncheckedOperations = (event, context, callback) => {
  let knex = tools.initKnex();
  knex.select()
    .from('operation')
    .where('checked', false)
    .orderBy('date')
    .asCallback((error, operations) => {
      if (error) {
        return console.error(error);
      }
      const response = tools.buildResponse(JSON.stringify(operations));
      callback(null, response);
      return knex.destroy();
    });
}
