let firebase = require('./firebase')

exports.handler = async function(event) {
  console.log('hello from the back-end!')
  let queryStringUserId= event.queryStringParameters.userId

  let barsData = []
  let db = firebase.firestore()
  let quertSnapshot = await db.collection('bars').get() // MAYBE ADD 'where('userId', '==', queryStringUserId)'
  //console.log(`number of bars: ${quertSnapshot.size} ` )

  let bars = quertSnapshot.docs
  for (let i=0;i<bars.length; i++) {
    let barId = bars[i].id 
    let bar = bars[i].data()
    // console.log(bar)

    barsData.push({
      id: barId,
      text: bar.text
    })
  }

  return {
    statusCode: 200,
    body: JSON.stringify(barsData)
  }
}