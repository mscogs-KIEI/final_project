firebase.auth().onAuthStateChanged(async function(user) {
  if (user) {
    // Signed in
    console.log('signed in')
    document.querySelector("#check-in").insertAdjacentHTML('beforeend', `
      <div id='ci-FsTWmvFr4q9zOff1Ntjh' class='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl'>Check into Test Bar</div>
    `)
    document.querySelector("#check-in").addEventListener('click', async function(event) {
      event.preventDefault()
      console.log('Test check-in clicked')
      let checkInResponse = await fetch('/.netlify/functions/checkIntoBar', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.uid,
          bar: 'FsTWmvFr4q9zOff1Ntjh'
        })
      })
      let checkInData = await checkInResponse.json()
      console.log(checkInData)
      
    })
    document.querySelector("#ci-FsTWmvFr4q9zOff1Ntjh").addEventListener('mouseover', async function(event) {
      event.preventDefault()
      let mouseElement = document.querySelector("#ci-FsTWmvFr4q9zOff1Ntjh")
      mouseElement.classList.add('cursor-pointer')
    })
    document.querySelector("#ci-FsTWmvFr4q9zOff1Ntjh").addEventListener('mouseout', async function(event) {
      event.preventDefault()
      let mouseElement = document.querySelector("#ci-FsTWmvFr4q9zOff1Ntjh")
      mouseElement.classList.remove('cursor-pointer')
    })
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
