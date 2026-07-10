import { boot } from 'quasar/wrappers'

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

import { getFirestore } from 'firebase/firestore'

//FIREBASE CONFIG TESTE
const firebaseConfig = {
  apiKey: 'AIzaSyDHR1YlJalcWYWp6q-MgAFOEh3yEbGS9F4',
  authDomain: 'intersystem-teste.firebaseapp.com',
  projectId: 'intersystem-teste',
  storageBucket: 'intersystem-teste.firebasestorage.app',
  messagingSenderId: '1074393042572',
  appId: '1:1074393042572:web:16f99b96c4b81fc23675a9',
  measurementId: 'G-1W7KHJ9NHX',
}

// APP PRINCIPAL
const app = initializeApp(firebaseConfig)

const auth = getAuth(app)
const db = getFirestore(app)

// APP SECUNDÁRIA
const secondaryApp = initializeApp(firebaseConfig, 'secondary')

const secondaryAuth = getAuth(secondaryApp)

export { auth, db, secondaryAuth }

export default boot(() => {})
