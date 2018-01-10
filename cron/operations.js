const tools = require('../tools')

module.exports.month = (event, context) => {
  let time = new Date()
  time.setMonth(time.getMonth() + 1)

  let knex = tools.initKnex()
  knex.select()
    .from(knex.raw('generate_operation_month(?, ?)', [(time.getMonth() + 1), time.getFullYear()]))
    .then(() => {
      knex.destroy()
    })
}
