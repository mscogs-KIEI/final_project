// /.netlify/functions/getUserLocation
// This function expects a POST fetch with a body of:
//  userId: [user's uid]
// and returns the ID and name of the user's location.

let firebase = require('./firebase')

exports.handler = async function (event) {
    let db = firebase.firestore()
    let request = JSON.parse(event.body)
    console.log(`Checking location of user ${request.userId}`)
    let userQuery = await db.collection('users').doc(request.userId).get()
    let userData = await userQuery.data()
    let barName = ''
    console.log(`User location is ${userData.location}.`)
    if (userData.location != '') {
        let barQuery = await db.collection('bar').doc(userData.location).get()
        // console.log(barQuery)
        let barData = barQuery.data()
        if (barData) {
            if (barData.text == '') {
                console.log('User location undefined')
                barName = 'home'
            } else {
                barName = barData.text
            }
            // console.log(barData)
        } else {
            console.log('User location undefined')
            barName = 'home'
        }
    } else {
        console.log('User location undefined')
        barName = 'home'
    }
    return {
        statusCode: 200,
        body: JSON.stringify({
            barName: barName
        })
    }
}