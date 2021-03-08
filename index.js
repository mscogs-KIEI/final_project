let db = firebase.firestore()
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