firebase.auth().onAuthStateChanged(async function(user) {
  if (user) {
    // Signed in
    console.log('signed in')
    
    // "Going home" button to check self out for the night
    document.querySelector('#check-in').insertAdjacentHTML('beforeend', `
    <div id='going-home' class='bg-green-600 hover:bg-green-800 text-white px-4 py-2 my-2 rounded-xl'>
      I'm going home!
    </div>
    `)
    document.querySelector('#going-home').addEventListener('click', async function(event) {
      event.preventDefault()
      console.log(`User ${user.uid} is going home for the night!`)      
    })

    // This block draws bar-specific check-in buttons
    // Bars are hard-coded for now, need to convert as part
    // of the "lsit bars" story and merge into one loop
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
    for (i = 0; i < barList.length; i++) {
      // Define bar in question
      let barId = barList[i].Id
      let barName = barList[i].name
      // Insert button
      document.querySelector("#check-in").insertAdjacentHTML('beforeend', `
        <div id='ci-${barId}' class='bg-green-500 hover:bg-green-600 text-white px-4 py-2 my-2 rounded-xl'>
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
    // Signed out
    console.log('signed out')

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
