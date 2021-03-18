let db = firebase.firestore()

// queryBar() uses a bar ID to pull a list of
// users that are checked into the queried bar.
async function queryBar(barId) {
  barUsers = await fetch('/.netlify/functions/listUsersInBar', {
    method: 'POST',
    body: JSON.stringify({
      barId: barId
    })
  })
  userList = await barUsers.json()
  // console.log(userList)
  return userList
}

firebase.auth().onAuthStateChanged(async function(user) {
  if (user) {
    // Signed in
    console.log('Signed in.')

    // drawWelcomeMessage() writes an appropriate welcome
    // message and the user's current location.
    function drawWelcomeMessage(barText) {
      document.querySelector('#welcome-message').innerHTML = `
        Hello ${user.displayName}! You are at ${barText}.
      `
    }

    // drawBarButton() inserts a check in button
    // for a bar given its name (barText) and ID.
    function drawBarButton(barText, barId) {
      // Insert button
      document.querySelector("#bar-dropdown").insertAdjacentHTML('beforeend', `
        <div id='ci-${barId}' class='button bg-green-500 hover:bg-green-600 text-white px-4 py-2 my-2 rounded-xl'>
          Check in to ${barText}.
        </div>
      `)
      // Click event and POST to checkIntoBar
      document.querySelector(`#ci-${barId}`).addEventListener('click', async function(event) {
        event.preventDefault()
        // console.log(`${barName} check-in clicked`)
        let checkInResponse = await fetch('/.netlify/functions/checkIntoBar', {
          method: 'POST',
          body: JSON.stringify({
            userId: user.uid,
            barId: barId,
            barName: barText
          })
        })

        let checkInData = await checkInResponse.json()
        drawWelcomeMessage(checkInData.barName)
        // console.log(checkInData)
      })
      // These two blocks change the cursor to a hand on mouseover.
      document.querySelector(`#ci-${barId}`).addEventListener('mouseover', async function(event) {
        event.preventDefault()
        event.target.classList.add('cursor-pointer')
      })
      document.querySelector(`#ci-${barId}`).addEventListener('mouseout', async function(event) {
        event.preventDefault()
        event.target.classList.remove('cursor-pointer')
      })
      // End of check-in buttons
    }

    // Initial welcome message
    let locationResponse = await fetch('/.netlify/functions/getUserLocation', {
      method: 'POST',
      body: JSON.stringify({
        userId: user.uid
      })
    })
    let locationJSON = await locationResponse.json()
    // console.log(locationJSON)
    drawWelcomeMessage(locationJSON.barName)
    // Header for check in area
    document.querySelector('#check-in').insertAdjacentHTML('afterbegin', `
    <div class='font-bold px-4 py-2 my-2'>
      Going out? Check in!
    </div>
    `)
    // Header for friend location area
    document.querySelector('#friend-locations').insertAdjacentHTML('afterbegin', `
    <div class='font-bold px-4 py-2 my-2'>
      Find your friends!
    </div>
    `)

    // "Going home" button to check self out for the night
    document.querySelector('#check-in').insertAdjacentHTML('beforeend', `
    <div id='going-home' class='button bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 my-2 rounded-xl'>
      I'm going home!
    </div>
    `)
    document.querySelector('#going-home').addEventListener('click', async function(event) {
      event.preventDefault()
      // console.log(`User ${user.uid} is going home for the night!`)
      let checkOutResponse = await fetch('/.netlify/functions/checkSelfOut', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.uid
        })
      })
      let checkOutData = await checkOutResponse.json()
      // console.log(checkOutData)
      drawWelcomeMessage('home')
    })
    // These two blocks change the cursor to a hand on mouseover.
    document.querySelector(`#going-home`).addEventListener('mouseover', async function(event) {
      event.preventDefault()
      event.target.classList.add('cursor-pointer')
    })
    document.querySelector(`#going-home`).addEventListener('mouseout', async function(event) {
      event.preventDefault()
      event.target.classList.remove('cursor-pointer')
    })
    // End of Going Home button.

    db.collection('users').doc(user.uid).update({
      name: user.displayName,
      email: user.email
    })

    document.querySelector('form').addEventListener('submit', async function(event) {
      event.preventDefault()

      let barText = document.querySelector('#bar').value

      if (barText.length > 0) {
        // Add user ID to newly created to-do
        let docRef = await db.collection('bar').add({
          text: barText,
          userId: user.uid
        })

        let barId = docRef.id
        console.log(`new bar with ID ${barId} created`)

        document.querySelector('.bars').insertAdjacentHTML('beforeend', `
        <div id='ci-${barId}' class='button bg-green-500 hover:bg-green-600 text-white px-4 py-2 my-2 rounded-xl'>
          Check in to ${barText}
        </div>
        `)
        document.location.href = 'index.html'
      }
    })

    // Show only my to-dos
    // let querySnapshot = await db.collection('bars').where('userId', '==', user.uid).get()
    // console.log(`Number to bars in collection: ${querySnapshot.size}`)

    // let bars = querySnapshot.docs
    let barId = bar.id
    let userId = firebase.auth().currentUser.uid
    let response = await fetch(`/.netlify/functions/createNewBar`, {
      method: 'POST',
      body: JSON.stringify({
        barId: barId,
        userId: userId
      })
      }) //?userId=${user.uid} <-- add to link?
          // Instead of '?userId=...', I think we need to use 'method: "POST"', like lines 12-17 of
          // todo.js in the Week 9 solution [https://github.com/kiei451-winter2021/todos-final/blob/master/todo.js]
          //  -Dan COOL
    let bars = await response.json()
    // console.log(bars)

    for (let i=0; i<bars.length; i++) {
      
      // let barId = bars[i].id
      // let bar = bars[i].data()
      // let barText = bar.text

      let bar = bars[i]
      let barId = bar.id
      let barText = bar.text

      document.querySelector('.bars').insertAdjacentHTML('beforeend', `
        <div class="bar-${barId} py-4 text-xl border-b-2 border-purple-500 w-full">
          <a href="#" class="done p-2 text-sm bg-green-500 text-white">✓</a>
          ${barText}
        </div>
      `)

      document.querySelector(`.bar-${barId} .done`).addEventListener('click', async function(event) {
        event.preventDefault()
        document.querySelector(`.bar-${barId}`).classList.add('opacity-20')
        await db.collection('bars').doc(barId).delete()
      })

      // This part puts bars where people are checked in
      // into the find friends area.

    }

    // Create a sign-out button
    document.querySelector('.sign-in-or-sign-out').innerHTML = `
      <button class="text-pink-500 underline sign-out">Sign Out</button>
    `

    document.querySelector('.sign-out').addEventListener('click', function(event) {
      console.log('sign out clicked')
      firebase.auth().signOut()
      document.location.href = 'index.html'
    })
    
    // This block draws bar-specific check-in buttons
    let responseBar = await fetch(`/.netlify/functions/listBars`, {
      method: 'POST',
      body: JSON.stringify({
        id: barId,
        name: userId
      })
      })
    let barList = await responseBar.json()
    for (let i = 0; i < barList.length; i++) {
      drawBarButton(barList[i].text, barList[i].id)
      barUsers = await queryBar(barList[i].id)
      // console.log(barUsers)
      if (barUsers.length == 1) {
        document.querySelector('#friend-locations').insertAdjacentHTML('beforeend', `
          <div id="friends-${barList[i].id}" class="py-4 text-xl border-b-2 border-purple-500 w-full">
            1 person is at ${barList[i].text}!
          </div>
        `)
      } else if (barUsers.length > 0) {
        document.querySelector('#friend-locations').insertAdjacentHTML('beforeend', `
          <div id="friends-${barList[i].id}" class="py-4 text-xl border-b-2 border-purple-500 w-full">
            ${barUsers.length} people are at ${barList[i].text}!
          </div>
        `)
      }
    }
  } else {
    // Not logged-in

    // Hide the form when signed-out
    document.querySelector('form').classList.add('hidden')

    // Initializes FirebaseUI Auth
    let ui = new firebaseui.auth.AuthUI(firebase.auth())

    // FirebaseUI configuration
    let authUIConfig = {
      signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ],
      signInSuccessUrl: 'index.html'
    }

    // Starts FirebaseUI Auth
    ui.start('.sign-in-or-sign-out', authUIConfig)
  }
})