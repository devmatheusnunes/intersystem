import { boot } from 'quasar/wrappers'

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyACADF6tvr4_ENNF_MGama4WXQFNiw3-GQ',
  authDomain: 'solicitacoes-compras.firebaseapp.com',
  projectId: 'solicitacoes-compras',
  storageBucket: 'solicitacoes-compras.firebasestorage.app',
  messagingSenderId: '777383924849',
  appId: '1:777383924849:web:1992b16c819288a888f7d0',
  measurementId: 'G-S773MFQS6L',
}

const app = initializeApp(firebaseConfig)

const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db }

export default boot(() => {})
