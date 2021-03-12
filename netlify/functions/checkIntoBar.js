// /.netlify/functions/checkIntoBar
// This function expects a POST fetch with a body of:
//  userId: [user's uid]
//  bar: [The bar's ID]

let firebase = require('./firebase')

exports.handler = async function (event) {
    let db = firebase.firestore()
    let checkIn = JSON.parse(event.body)
    console.log(`Checking user ${checkIn.userId} into bar ${checkIn.barId}...`)
    await db.collection('users').doc(`${checkIn.userId}`).update({
        location: checkIn.barId,
        lastCheckIn: firebase.firestore.FieldValue.serverTimestamp()
    })
    let checkInMessage = `Checked in to ${checkIn.barName}`
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: checkInMessage, 
            barName: checkIn.barName
        })
    }
}