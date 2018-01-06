const tools = require('./tools')

module.exports.list = (event, context, callback) => {
  let knex = tools.initKnex()
  knex.select()
    .from('category')
    .orderBy('name')
    .then(categories => {
      const response = tools.buildResponse(JSON.stringify(categories))
      callback(null, response)
      return knex.destroy()
    })
}

module.exports.get = (event, context, callback) => {
  let knex = tools.initKnex()
  knex.select()
    .from('category')
    .where('id', event.pathParameters.id)
    .then(categories => {
      let category = categories[0]
      const response = tools.buildResponse(JSON.stringify(category))
      callback(null, response)
      return knex.destroy()
    })
}
