const firebase = require("firebase/app")
require("firebase/firestore")

const firebaseConfig = {
  apiKey: "AIzaSyBReWli-h7d02S5RZ_kQ29sGKsUCwV5scQ",
  authDomain: "kiei-451-dap.firebaseapp.com",
  projectId: "kiei-451-dap",
  storageBucket: "kiei-451-dap.appspot.com",
  messagingSenderId: "800524210099",
  appId: "1:800524210099:web:0f897514dc6a2b20a8c5c6"
} // replace

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

module.exports = firebase