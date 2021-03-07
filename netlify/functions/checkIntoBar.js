// /.netlify/functions/checkIntoBar
let firebase = require('./firebase')

exports.handler = async function (event) {
    let db = firebase.firestore()
    let checkIn = JSON.parse(event.body)
    console.log(`Checking user ${checkIn.userId} into bar ${checkIn.bar}...`)
    let checkInMessage = {message: 'Check in received'}
    return {
        statusCode: 200,
        body: JSON.stringify(checkInMessage)
    }
}