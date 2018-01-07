const tools = require('./tools')

module.exports.list = (event, context, callback) => {
  let type = event.queryStringParameters.t || 'u';
  switch (type) {
    case 'am':
      getMonthOperations(event, context, callback);
      break;
    case 'u':
    default:
      getUncheckedOperations(event, context, callback)
  }
}

module.exports.get = (event, context, callback) => {
  getOperation(event, context, callback)
}

module.exports.post = (event, context, callback) => {
  let knex = tools.initKnex()
  let body = JSON.parse(event.body)
  let schema = require('validate');
  let constraints = schema({
    name: {
      type: 'string',
      required: true,
      message: 'The name is required.'
    },
    accountId: {
      type: 'number',
      required: true,
      message: 'The account is required.'
    },
    categoryId: {
      type: 'number',
      required: true,
      message: 'The category is required.'
    },
    amount: {
      type: 'number',
      required: true,
      message: 'The amount is required.'
    },
    date: {
      type: 'date',
      required: true,
      message: 'The date is required.'
    }
  }, {
    typecast: true
  })
  let errors = constraints.validate(body)
  if (errors.length) {
    const response = tools.buildResponse(JSON.stringify(errors), 400)
    callback(null, response)
    return knex.destroy()
  } else {
    knex('operation')
      .returning('id')
      .insert(body)
      .then(ids => {
        knex.destroy()
        getOperation({
          pathParameters: {
            id: ids[0]
          }
        }, context, callback)
      })
  }
}

module.exports.put = (event, context, callback) => {
  let knex = tools.initKnex()
  let body = JSON.parse(event.body)
  let schema = require('validate');
  let constraints = schema({
    name: {
      type: 'string',
      required: true,
      message: 'The name is required.'
    },
    accountId: {
      type: 'number',
      required: true,
      message: 'The account is required.'
    },
    categoryId: {
      type: 'number',
      required: true,
      message: 'The category is required.'
    },
    amount: {
      type: 'number',
      required: true,
      message: 'The amount is required.'
    },
    date: {
      type: 'date',
      required: true,
      message: 'The date is required.'
    }
  }, {
    typecast: true
  })
  let errors = constraints.validate(body)
  if (errors.length) {
    const response = tools.buildResponse(JSON.stringify(errors), 400)
    callback(null, response)
    return knex.destroy()
  } else {
    knex('operation')
      .update(body)
      .from('operation')
      .where('operation.id', event.pathParameters.id)
      .returning('id')
      .then(ids => {
        knex.destroy();
        getOperation(event, context, callback);
      })
  }
}

module.exports.patch = (event, context, callback) => {
  let knex = tools.initKnex()
  let body = JSON.parse(event.body)

  if (body.checked != null) {
    // check if change checked
    knex.select()
      .from('operation')
      .where('id', event.pathParameters.id)
      .then(operations => {
        let operation = operations[0]
        if (operation.checked !== body.checked) {
          // update operation
          knex('operation')
            .where('id', event.pathParameters.id)
            .update({
              checked: body.checked
            })
            .then(count => {
              if (count === 1) {
                // update account balance
                knex('account')
                  .where('id', operation.accountId)
                  .update({
                    balance: knex.raw('balance + ??', [parseFloat(operation.amount) * (body.checked ? 1 : -1)])
                  })
                  .then(count => {
                    knex.destroy()
                    getOperation(event, context, callback)
                  })
              } else {
                knex.destroy()
                getOperation(event, context, callback)
              }
            })
        } else {
          knex.destroy()
          getOperation(event, context, callback)
        }
      })
  } else {
    knex.destroy()
    getOperation(event, context, callback)
  }
}

const getUncheckedOperations = (event, context, callback) => {
  let knex = tools.initKnex()
  let query = knex.select(
      'o.id         AS _id',
      'o.name       AS _name',
      'o.checked    AS _checked',
      'o.date       AS _date',
      'o.amount     AS _amount',
      'o.accountId  AS _accountId',
      'o.categoryId AS _categoryId',

      'a.id         AS _account_id',
      'a.name       AS _account_name',
      'a.balance    AS _account_balance',
      'a.currency   AS _account_currency',
      'a.color      AS _account_color',
      'a.icon       AS _account_icon',
      'a.order      AS _account_order',

      'c.id         AS _category_id',
      'c.name       AS _category_name'
    )
    .from('operation AS o')
    .innerJoin('account AS a', 'a.id', 'o.accountId')
    .innerJoin('category AS c', 'c.id', 'o.categoryId')
    .where('o.checked', false)
    .orderBy('o.date')

  let knexnest = require('knexnest')
  knexnest(query)
    .then(operations => {
      const response = tools.buildResponse(JSON.stringify(operations))
      callback(null, response)
      return knex.destroy()
    })
}

const getMonthOperations = (event, context, callback) => {

  let dateStart = new Date(event.queryStringParameters.y, event.queryStringParameters.m - 1, 1);
  let dateEnd = new Date(event.queryStringParameters.y, event.queryStringParameters.m - 1, 1);
  dateEnd.setMonth(dateEnd.getMonth() + 1)
  dateEnd.setDate(dateEnd.getDate() - 1)
  console.log(dateStart, dateEnd)
  let knex = tools.initKnex()
  let query = knex.select(
      'o.id         AS _id',
      'o.name       AS _name',
      'o.checked    AS _checked',
      'o.date       AS _date',
      'o.amount     AS _amount',
      'o.accountId  AS _accountId',
      'o.categoryId AS _categoryId',

      'a.id         AS _account_id',
      'a.name       AS _account_name',
      'a.balance    AS _account_balance',
      'a.currency   AS _account_currency',
      'a.color      AS _account_color',
      'a.icon       AS _account_icon',
      'a.order      AS _account_order',

      'c.id         AS _category_id',
      'c.name       AS _category_name'
    )
    .from('operation AS o')
    .innerJoin('account AS a', 'a.id', 'o.accountId')
    .innerJoin('category AS c', 'c.id', 'o.categoryId')
    .whereBetween('o.date', [dateStart, dateEnd])
    .andWhere('o.accountId', event.queryStringParameters.a)
    .orderBy('o.date')

  let knexnest = require('knexnest')
  knexnest(query)
    .then(operations => {
      const response = tools.buildResponse(JSON.stringify(operations))
      callback(null, response)
      return knex.destroy()
    })
}

const getOperation = (event, context, callback) => {
  let knex = tools.initKnex()
  let query = knex.select(
      'o.id         AS _id',
      'o.name       AS _name',
      'o.checked    AS _checked',
      'o.date       AS _date',
      'o.amount     AS _amount',
      'o.accountId  AS _accountId',
      'o.categoryId AS _categoryId',

      'a.id         AS _account_id',
      'a.name       AS _account_name',
      'a.balance    AS _account_balance',
      'a.currency   AS _account_currency',
      'a.color      AS _account_color',
      'a.icon       AS _account_icon',
      'a.order      AS _account_order',

      'c.id         AS _category_id',
      'c.name       AS _category_name'
    )
    .from('operation AS o')
    .innerJoin('account AS a', 'a.id', 'o.accountId')
    .innerJoin('category AS c', 'c.id', 'o.categoryId')
    .where('o.id', event.pathParameters.id)

  let knexnest = require('knexnest')
  knexnest(query)
    .then(operations => {
      let operation = operations[0]
      const response = tools.buildResponse(JSON.stringify(operation))
      callback(null, response)
      return knex.destroy()
    })
}
