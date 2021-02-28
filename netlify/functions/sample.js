let firebase = require('./firebase')

exports.handler = async function(event) {
  let data = [] // sample only...
  return {
    statusCode: 200,
    body: JSON.stringify(data)
  }
}