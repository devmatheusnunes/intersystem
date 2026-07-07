import { ref, computed } from 'vue'

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth'

import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'

import { auth, db } from 'src/boot/firebase'

const firebaseUser = ref(null)
const profile = ref(null)
const loading = ref(true)

/**
 * 🔥 MANTÉM SUA ESTRUTURA ORIGINAL (COMPATÍVEL COM BANCO)
 */
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
  } catch (error) {
    console.error('Erro ao carregar perfil:', error)
    profile.value = null
  }
}

/**
 * 🔥 USER PADRONIZADO (RESOLVE O HISTÓRICO)
 */
const user = computed(() => {
  if (!firebaseUser.value) return null

  return {
    id: firebaseUser.value.uid,
    uid: firebaseUser.value.uid,

    nome: profile.value?.nome || '',
    name: profile.value?.nome || '',

    email: firebaseUser.value.email || '',

    // mantém compatibilidade com resto do sistema
    permissions: profile.value?.permissions || [],
    visibilityType: profile.value?.visibilityType || 'own',
    visibleSectors: profile.value?.visibleSectors || [],
  }
})

/**
 * 🔥 OBSERVER GLOBAL
 */
onAuthStateChanged(auth, async (fbUser) => {
  firebaseUser.value = fbUser

  if (fbUser) {
    await loadUserProfile(fbUser.uid)
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
    firebaseUser.value = null
    profile.value = null
  }

  const register = async ({ email, password }) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password)

    return credential.user
  }

  const sendPasswordReset = async (email) => {
    await sendPasswordResetEmail(auth, email)
  }

  const reloadProfile = async () => {
    if (!firebaseUser.value?.uid) return
    await loadUserProfile(firebaseUser.value.uid)
  }

  const isLoggedIn = () => !!firebaseUser.value

  return {
    user, // 🔥 USAR ESSE NO SISTEMA (CORRIGIDO)
    profile, // mantém compatibilidade com telas antigas
    loading,

    login,
    logout,
    register,

    sendPasswordReset,
    reloadProfile,

    isLoggedIn,
  }
}
