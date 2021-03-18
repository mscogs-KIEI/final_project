let firebase = require('./firebase')

exports.handler = async function(event) {
  // console.log('hello from the back-end!')
  let db = firebase.firestore()
  let barData = JSON.parse(event.body)
  console.log(barData)
  let docRef = await db.collection('bar').add({
    text: barData.text,
    userId: barData.userId
  })
  let barId = docRef.id
  barData.barId = barId

  return {
    statusCode: 200,
    body: JSON.stringify(barData)
  }
}