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

import { db } from 'boot/firebase'
import useAuthUser from './UseAuthUser'

const COLLECTION = 'notifications'

export default function useNotifications() {
  const { profile } = useAuthUser()

  /* ==========================================================
   * HELPERS
   * ========================================================== */

  const getUserId = (user) => user?.userId || user?.id || user?.uid || ''

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

    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    )

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

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

    getMyNotifications,
    getUnreadCount,

    subscribeNotifications,

    removeNotification,
    removeAllNotifications,
  }
}
