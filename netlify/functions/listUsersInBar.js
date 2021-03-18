// /.netlify/functions/listUsersInBar
// Given a bar ID as a string, returns an array of
// user objects with userName and checkIn attributes
let firebase = require('./firebase')

exports.handler = async function (event) {
    let db = firebase.firestore()
    let queryBody = await JSON.parse(event.body)
    let queriedBar = queryBody.barId
    // console.log(`Checking bar ${queriedBar}`)
    let UsersQuery = await db.collection('users')
                         .where('location', '==', queriedBar)
                         .get()
    let barUserDocs = UsersQuery.docs
    // console.log(`${barUserDocs.length} users at bar ${queriedBar}`)
    let barUsers = []
    for (let i = 0; i < barUserDocs.length; i++) {
        let user = barUserDocs[i].data()
        // console.log(user)
        let userName = user.name
        let userCheckInTime = user.lastCheckIn
        barUser = {
            userName: userName,
            checkIn: userCheckInTime
        }
        // console.log(barUser)
        barUsers.push(barUser)
    }
    // console.log(barUsers) 
    return {
        statusCode: 200,
        body: JSON.stringify(barUsers)
    }
}