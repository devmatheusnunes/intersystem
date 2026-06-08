import { auth } from 'src/boot/firebase'

export default async (to, from, next) => {
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  auth.onAuthStateChanged((user) => {
    if (user) {
      next()
    } else {
      next('/')
    }
  })
}
