// /.netlify/functions/checkIntoBar
let firebase = require('./firebase')

exports.handler = async function (event) {
    let db = firebase.firestore()
    let checkIn = JSON.parse(event.body)
    console.log(`Checking user ${checkIn.userId} into bar ${checkIn.bar}...`)
    await db.collection('users').doc(`${checkIn.userId}`).update({
        location: checkIn.bar,
        lastCheckIn: firebase.firestore.FieldValue.serverTimestamp()
    })
    let checkInMessage = {message: `Checked in to bar ${checkIn.bar}`}
    return {
        statusCode: 200,
        body: JSON.stringify(checkInMessage)
    }
}