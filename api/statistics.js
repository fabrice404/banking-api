const tools = require('../tools')

module.exports.operations_dailyBalance = (event, context, callback) => {
  let accountId = event.queryStringParameters.a
  let dateStart = new Date(event.queryStringParameters.y, event.queryStringParameters.m - 1, 1)
  let dateEnd = new Date(event.queryStringParameters.y, event.queryStringParameters.m - 1, 1)
  dateEnd.setMonth(dateEnd.getMonth() + 1)
  dateEnd.setDate(dateEnd.getDate() - 1)

  let knex = tools.initKnex()
  knex.select()
    .from(knex.raw('statistics_operations_dailyBalance(?,?,?)', [accountId, dateStart, dateEnd]))
    .then(stats => {
      const response = tools.buildResponse(JSON.stringify(stats))
      callback(null, response)
      return knex.destroy()
    })
}

module.exports.account_dayBalance = (event, context, callback) => {
  let accountId = event.queryStringParameters.a
  let date = new Date(event.queryStringParameters.y, event.queryStringParameters.m - 1, 1)

  let knex = tools.initKnex()
  knex.select()
    .from(knex.raw('statistics_account_dayBalance(?,?)', [accountId, date]))
    .then(stats => {
      let stat = stats[0]
      const response = tools.buildResponse(JSON.stringify(stat))
      callback(null, response)
      return knex.destroy()
    })
}
