// /.netlify/functions/pushUser

let firebase = require('./firebase')

exports.handler = async function (event) {
    let db = firebase.firestore()
    user = JSON.parse(event.body)
    db.collection('users').doc(user.id).update({
        name: user.name,
        email: user.email
    })
    return {
        statusCode: 200,
        body: `User confirmed`
    }
}