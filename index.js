let db = firebase.firestore()
async function queryBar(barId) {
  barUsers = await fetch('/.netlify/functions/listUsersInBar', {
    method: 'POST',
    body: JSON.stringify({
      barId: barId
    })
  })
  userList = await barUsers.json()
  // console.log(userList)
}

firebase.auth().onAuthStateChanged(async function(user) {

  if (user) {
    // Signed in
    

    db.collection('users').doc(user.uid).set({
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
          <div class="bar-${barId} py-4 text-xl border-b-2 border-purple-500 w-full">
            <a href="#" class="done p-2 text-sm bg-green-500 text-white">✓</a>
            ${barText}
          </div>
        `)

        document.querySelector(`.bar-${barId} .done`).addEventListener('click', async function(event) {
          event.preventDefault()
          document.querySelector(`.bar-${barId}`).classList.add('opacity-20')
          await db.collection('bar').doc(barId).delete()
        })
        document.querySelector('#bar').value = ''
      }
    })

    // Show only my to-dos
    // let querySnapshot = await db.collection('bars').where('userId', '==', user.uid).get()
    // console.log(`Number to bars in collection: ${querySnapshot.size}`)

    // let bars = querySnapshot.docs

    let response = await fetch(`http://localhost:55621/.netlify/functions/createNewBar`) //?userId=${user.uid} <-- add to link?
    let bars = await response.json()

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

    console.log('signed in')
    
    // "Going home" button to check self out for the night
    document.querySelector('#check-in').insertAdjacentHTML('beforeend', `
    <div id='going-home' class='button bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 my-2 rounded-xl'>
      I'm going home!
    </div>
    `)
    document.querySelector('#going-home').addEventListener('click', async function(event) {
      event.preventDefault()
      console.log(`User ${user.uid} is going home for the night!`)
      let checkOutResponse = await fetch('/.netlify/functions/checkSelfOut', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.uid
        })
      })
      let checkOutData = await checkOutResponse.json()
      console.log(checkOutData)
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
    
    // This block draws bar-specific check-in buttons
    // Bars are hard-coded for now, need to convert as part
    // of the "list bars" story and merge into one loop
    let barList = [
      {
        Id: 'FsTWmvFr4q9zOff1Ntjh',
        name: 'DryHop Brewers',
        imageUrl: 'https://images.squarespace-cdn.com/content/v1/5bce90a8523958e26e9a434d/1600798629477-J2WQ5Y2ZBR0I3RJYUL5I/ke17ZwdGBToddI8pDm48kBzQH4RWPYqW2DD4NX3pz-JZw-zPPgdn4jUwVcJE1ZvWQUxwkmyExglNqGp0IvTJZamWLI2zvYWH8K3-s_4yszcp2ryTI0HqTOaaUohrI8PI517V6XQux86P6g_UYsh_OSCLQfLRlx_kfEHVvADs56A/DryHop+Brewers_Barman%27s+Banquet.png',
      },
      {
        Id: 'dWNK0uAGeNySVL6gVs2H',
        name: 'Prairie Moon',
        imageUrl: 'https://dailynorthwestern.com/wp-content/uploads/2018/09/PrairieMoon_AllieGoulding_WEB-900x600.jpg'
      }
    ]
    for (let i = 0; i < barList.length; i++) {
      // Define bar in question
      let barId = barList[i].Id
      let barName = barList[i].name
      // Insert button
      document.querySelector("#check-in").insertAdjacentHTML('beforeend', `
        <div id='ci-${barId}' class='button bg-green-500 hover:bg-green-600 text-white px-4 py-2 my-2 rounded-xl'>
          Check in to ${barName}
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
            bar: barId
          })
        })
        let checkInData = await checkInResponse.json()
        console.log(checkInData)
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