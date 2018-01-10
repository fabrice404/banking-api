const tools = require('../tools')

module.exports.list = (event, context, callback) => {
  let knex = tools.initKnex()
  knex.select(knex.raw('a.*, coalesce(p.pending, 0) AS pending'))
    .from('account AS a')
    .leftJoin('account_pending AS p', 'a.id', 'p.accountId')
    .whereNot('a.balance', 0)
    .orderBy('a.order')
    .then(accounts => {
      const response = tools.buildResponse(JSON.stringify(accounts))
      callback(null, response)
      return knex.destroy()
    })
}

module.exports.get = (event, context, callback) => {
  let knex = tools.initKnex()
  knex.select()
    .from('account')
    .orderBy('order')
    .where('id', event.pathParameters.id)
    .then(accounts => {
      let account = accounts[0]
      const response = tools.buildResponse(JSON.stringify(account))
      callback(null, response)
      return knex.destroy()
    })
}
