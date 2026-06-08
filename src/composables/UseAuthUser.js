import { ref } from 'vue'

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth'

import { doc, getDoc } from 'firebase/firestore'

import { auth, db } from 'src/boot/firebase'

const user = ref(null)
const profile = ref(null)
const loading = ref(true)

onAuthStateChanged(auth, async (firebaseUser) => {
  user.value = firebaseUser

  if (firebaseUser) {
    try {
      const userRef = doc(db, 'usuarios', firebaseUser.uid)

      const userSnapshot = await getDoc(userRef)

      if (userSnapshot.exists()) {
        profile.value = userSnapshot.data()
      } else {
        profile.value = null
      }
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error)

      profile.value = null
    }
  } else {
    profile.value = null
  }

  loading.value = false
})

export default function useAuthUser() {
  const login = async ({ email, password }) => {
    const credential = await signInWithEmailAndPassword(auth, email, password)

    return credential.user
  }

  const logout = async () => {
    await signOut(auth)
  }

  const register = async ({ email, password }) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password)

    return credential.user
  }

  const sendPasswordReset = async (email) => {
    await sendPasswordResetEmail(auth, email)
  }

  const isLoggedIn = () => !!user.value

  return {
    user,
    profile,
    loading,
    login,
    logout,
    register,
    sendPasswordReset,
    isLoggedIn,
  }
}
