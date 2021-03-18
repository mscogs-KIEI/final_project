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
    
    // Make sure we have a user in the collection
    // to manipulate.
    await fetch('/.netlify/functions/pushUser', {
      method: 'POST',
      body: JSON.stringify({
        id: user.uid,
        name: user.displayName,
        email: user.email
      })
    })

    // drawWelcomeMessage() writes an appropriate welcome
    // message and the user's current location.
    function drawWelcomeMessage(barText) {
      document.querySelector('#welcome-message').innerHTML = `
        Hello ${user.displayName}! You are at ${barText}.
      `
    }

    // drawFriendCount prints the number of people at each bar, if any.
    async function drawFriendCount(barText, barId) {
      barUsers = await queryBar(barId)
      // console.log(barUsers)
      if (barUsers.length == 1) {
        document.querySelector('#friend-locations').insertAdjacentHTML('beforeend', `
          <div id="friends-${barId}" class="py-4 text-xl border-b-2 border-purple-500 w-full">
            1 person is at ${barText}!
          </div>
        `)
      } else if (barUsers.length > 0) {
        document.querySelector('#friend-locations').insertAdjacentHTML('beforeend', `
          <div id="friends-${barId}" class="py-4 text-xl border-b-2 border-purple-500 w-full">
            ${barUsers.length} people are at ${barText}!
          </div>
        `)
      }

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
      // let checkOutData = await checkOutResponse.json()
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


    document.querySelector('form').addEventListener('submit', async function(event) {
      event.preventDefault()
      let barText = document.querySelector('#bar').value
      if (barText.length > 0) {
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
    // Get the list of bars
    let responseBar = await fetch(`/.netlify/functions/listBars`)
    let barList = await responseBar.json()

    // Draw a button for each bar and list how many users are there.
    for (let i = 0; i < barList.length; i++) {
      drawBarButton(barList[i].text, barList[i].id)
      drawFriendCount(barList[i].text, barList[i].id)
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