// /.netlify/functions/checkSelfOut
let firebase = require('./firebase')

exports.handler = async function (event) {
    let db = firebase.firestore()
    let checkOut = JSON.parse(event.body)
    await db.collection('users').doc(checkOut.userId).update({
        location: ''
    })
    let checkOutMessage = 'Sleep tight!'
    return {
        statusCode: 200,
        body: JSON.stringify(checkOutMessage)
    }
}