import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'

import useApi from './UseApi.js'
import { db } from 'boot/firebase.js'
import useAuthUser from './UseAuthUser.js'

const COLLECTION = 'notifications'

export default function useNotifications() {
  const { profile } = useAuthUser()
  const api = useApi()
  /* ==========================================================
   * HELPERS
   * ========================================================== */

  const getUserId = (user) => user?.id || user?.userId || user?.uid || user?._id || ''

  /* ==========================================================
   * CRIAR UMA NOTIFICAÇÃO
   * ========================================================== */

  const createNotification = async ({
    userId,
    title,
    message,
    module = '',
    type = '',
    requestId = '',
    requestNumber = '',
    route = '',
    icon = 'notifications',
    color = 'primary',
    metadata = {},
  }) => {
    if (!userId) return

    await addDoc(collection(db, COLLECTION), {
      userId,

      title,
      message,

      module,
      type,

      requestId,
      requestNumber,

      route,

      icon,
      color,

      metadata,

      createdAt: serverTimestamp(),
    })
  }

  /* ==========================================================
   * CRIAR PARA VÁRIOS USUÁRIOS
   * ========================================================== */

  const createManyNotifications = async ({
    users = [],
    title,
    message,
    module = '',
    type = '',
    requestId = '',
    requestNumber = '',
    route = '',
    icon = 'notifications',
    color = 'primary',
    metadata = {},
  }) => {
    const promises = []

    users.forEach((user) => {
      const userId = typeof user === 'string' ? user : getUserId(user)

      if (!userId) return

      promises.push(
        createNotification({
          userId,

          title,
          message,

          module,
          type,

          requestId,
          requestNumber,

          route,

          icon,
          color,

          metadata,
        }),
      )
    })

    await Promise.all(promises)
  }

  /* ==========================================================
   * USUÁRIOS POR PERMISSÃO
   * ========================================================== */

  const getUsersByPermission = async (permission) => {
    if (!permission) return []

    const users = await api.list('users')

    const [module] = permission.split('.')

    return users.filter((user) => {
      const permissions = user.permissions || []

      if (permissions.includes('*')) {
        return true
      }

      if (permissions.includes(permission)) {
        return true
      }

      if (permissions.includes(`${module}.*`)) {
        return true
      }

      return false
    })
  }

  /* ==========================================================
   * MINHAS NOTIFICAÇÕES
   * ========================================================== */

  const getMyNotifications = async () => {
    const userId = getUserId(profile.value)

    if (!userId) return []

    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    )

    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  }

  /* ==========================================================
   * QUANTIDADE
   * ========================================================== */

  const getUnreadCount = async () => {
    const notifications = await getMyNotifications()

    return notifications.length
  }

  /* ==========================================================
   * REALTIME
   * ========================================================== */

  const subscribeNotifications = (callback) => {
    const userId = getUserId(profile.value)

    if (!userId) return () => {}

    const q = query(collection(db, COLLECTION), where('userId', '==', userId))

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => {
          const da = a.createdAt?.toDate?.() || new Date(0)
          const db = b.createdAt?.toDate?.() || new Date(0)
          return db - da
        })

      callback(notifications)
    })
  }

  /* ==========================================================
   * REMOVER
   * ========================================================== */

  const removeNotification = async (id) => {
    await deleteDoc(doc(db, COLLECTION, id))
  }

  /* ==========================================================
   * REMOVER TODAS
   * ========================================================== */

  const removeAllNotifications = async () => {
    const notifications = await getMyNotifications()

    await Promise.all(notifications.map((notification) => removeNotification(notification.id)))
  }

  /* ==========================================================
   * API FUTURA
   * ========================================================== */

  const notify = async ({
    users = [],

    title,
    message,

    module = '',
    type = '',

    requestId = '',
    requestNumber = '',

    route = '',

    icon = 'notifications',
    color = 'primary',

    metadata = {},

    channels = {
      database: true,
      whatsapp: false,
      email: false,
      push: false,
    },
  }) => {
    if (channels.database) {
      await createManyNotifications({
        users,

        title,
        message,

        module,
        type,

        requestId,
        requestNumber,

        route,

        icon,
        color,

        metadata,
      })
    }

    /*
      Futuramente:

      if (channels.whatsapp) {
        await sendWhatsapp(...)
      }

      if (channels.email) {
        await sendEmail(...)
      }

      if (channels.push) {
        await sendPush(...)
      }
    */
  }

  return {
    notify,

    createNotification,
    createManyNotifications,

    getUsersByPermission,

    getMyNotifications,
    getUnreadCount,

    subscribeNotifications,

    removeNotification,
    removeAllNotifications,
  }
}
