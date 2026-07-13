import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
  limit,
} from 'firebase/firestore'

import { db } from 'boot/firebase'

import { createNotification } from 'src/models/notificationModel'

export default function UseNotifications() {
  const collectionName = 'notifications'

  /**
   * Criar notificação
   */
  const create = async (data) => {
    const notification = createNotification({
      ...data,

      read: false,

      createdAt: serverTimestamp(),
    })

    const ref = await addDoc(
      collection(db, collectionName),

      notification,
    )

    return {
      id: ref.id,

      ...notification,
    }
  }

  /**
   * Buscar notificações do usuário
   */
  const getUserNotifications = async (userId, maxItems = 20) => {
    const q = query(
      collection(db, collectionName),

      where('userId', '==', userId),

      orderBy('createdAt', 'desc'),

      limit(maxItems),
    )

    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,

      ...doc.data(),
    }))
  }

  /**
   * Buscar quantidade de notificações não lidas
   */
  const getUnreadCount = async (userId) => {
    const q = query(
      collection(db, collectionName),

      where('userId', '==', userId),

      where('read', '==', false),
    )

    const snapshot = await getDocs(q)

    return snapshot.size
  }

  /**
   * Marcar notificação como lida
   */
  const markAsRead = async (notificationId) => {
    const ref = doc(
      db,

      collectionName,

      notificationId,
    )

    await updateDoc(
      ref,

      {
        read: true,

        readAt: serverTimestamp(),
      },
    )
  }

  /**
   * Marcar todas notificações como lidas
   */
  const markAllAsRead = async (userId) => {
    const notifications = await getUserNotifications(userId, 100)

    const updates = notifications

      .filter((item) => !item.read)

      .map((item) =>
        updateDoc(
          doc(db, collectionName, item.id),

          {
            read: true,

            readAt: serverTimestamp(),
          },
        ),
      )

    await Promise.all(updates)
  }

  /**
   * Remover notificação
   * (mantido para uso futuro)

  const remove = async(notificationId)=>{


    // reservado para futura implementação

  }
 */

  return {
    create,

    getUserNotifications,

    getUnreadCount,

    markAsRead,

    markAllAsRead,

    //remove
  }
}
