let firebase = require('./firebase')
exports.handler = async function (event) {
    let db = firebase.firestore()
    let barData = []
    let querySnapshot = await db.collection(`bar`).get()
    let queryStringUserId = event.queryStringParameters.userId

    let bars = querySnapshot.docs 
    for (let i = 0; i < bars.length; i++) {
        let barId = bars[i].id
        let bar = bars[i].data()
       // console.log(bar)

        barData.push({
id: barId,
text: bar.text
        })

    }

    return {
        statusCode: 200,
        body: JSON.stringify(barData)
    }
}