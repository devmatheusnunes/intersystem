import { ref } from 'vue'

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth'

import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'

import { auth, db } from 'src/boot/firebase'

const user = ref(null)
const profile = ref(null)
const loading = ref(true)

const loadUserProfile = async (uid) => {
  try {
    const usersRef = collection(db, 'users')

    const q = query(usersRef, where('userId', '==', uid))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      console.warn('Usuário não encontrado para UID:', uid)

      profile.value = null
      return
    }

    const userDoc = querySnapshot.docs[0]

    const userData = {
      id: userDoc.id,
      ...userDoc.data(),
    }

    let roleData = null

    if (userData.roleId) {
      try {
        const roleRef = doc(db, 'roles', userData.roleId)

        const roleSnapshot = await getDoc(roleRef)

        if (roleSnapshot.exists()) {
          roleData = roleSnapshot.data()
        }
      } catch (error) {
        console.error('Erro ao carregar role:', error)
      }
    }

    profile.value = {
      ...userData,

      permissions: roleData?.permissions || [],

      visibilityType: roleData?.visibilityType || 'own',

      visibleSectors: roleData?.visibleSectors || [],
    }

    console.log('PROFILE:', profile.value)
  } catch (error) {
    console.error('Erro ao carregar perfil:', error)

    profile.value = null
  }
}

onAuthStateChanged(auth, async (firebaseUser) => {
  user.value = firebaseUser

  if (firebaseUser) {
    await loadUserProfile(firebaseUser.uid)
  } else {
    profile.value = null
  }

  loading.value = false
})

export default function useAuthUser() {
  const login = async ({ email, password }) => {
    const credential = await signInWithEmailAndPassword(auth, email, password)

    await loadUserProfile(credential.user.uid)

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

  const reloadProfile = async () => {
    if (!user.value?.uid) {
      return
    }

    await loadUserProfile(user.value.uid)
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

    reloadProfile,

    isLoggedIn,
  }
}
