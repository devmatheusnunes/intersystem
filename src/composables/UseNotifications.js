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

import useApi from 'src/composables/UseApi'

import { createNotification } from 'src/models/notificationModel'

import { getNotificationEvent } from 'src/constants/notificationEvents'

import { resolveNotificationUsers } from 'src/utils/notificationResolver'

export default function UseNotifications() {
  const api = useApi()

  const collectionName = 'notifications'

  /**
   * Criar notificação individual
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
   * Disparar notificação para um usuário
   *
   * Atualmente:
   * - Sistema
   *
   * Futuro:
   * - WhatsApp
   * - Email
   * - Push
   */
  const dispatch = async ({ user, request, notificationEvent }) => {
    const message = notificationEvent.buildMessage
      ? notificationEvent.buildMessage(request)
      : notificationEvent.message

    await create({
      userId: user.id,

      type: notificationEvent.key,

      title: notificationEvent.title,

      message,

      requestId: request.id || null,

      requestNumber: request.requestNumber || null,

      sectorId: request?.solicitante?.setorId || null,

      channels: {
        system: true,
        whatsapp: false,
        email: false,
      },

      metadata: {
        event: notificationEvent.key,

        requestStatus: request.status || null,

        requestTitle: request?.produto?.titulo || null,
      },
    })

    /**
     * Futuro:
     *
     * if(notificationEvent.channels.includes('whatsapp'))
     * {
     *   await WhatsAppService.send(...)
     * }
     */
  }

  /**
   * Disparar evento de notificação
   *
   * Exemplo:
   *
   * await sendEvent({
   *   event:'REQUEST_ANALYSIS',
   *   request
   * })
   */
  const sendEvent = async ({ event, request }) => {
    try {
      const notificationEvent = getNotificationEvent(event)

      if (!notificationEvent) {
        console.warn(`Evento de notificação não encontrado: ${event}`)

        return []
      }

      /**
       * Usuários ativos
       */
      const users = await api.find('users', 'ativo', true)

      /**
       * Roles
       */
      const rolesList = await api.list('roles')

      /**
       * Transforma em Map
       *
       * {
       *   roleId : role
       * }
       */
      const roles = rolesList.reduce((acc, role) => {
        acc[role.id] = role

        return acc
      }, {})

      /**
       * Resolve destinatários
       */
      const recipients = resolveNotificationUsers({
        event,

        request,

        users,

        roles,
      })

      if (!recipients.length) {
        return []
      }

      /**
       * Dispara notificações
       */
      await Promise.all(
        recipients.map((user) =>
          dispatch({
            user,

            request,

            notificationEvent,
          }),
        ),
      )

      return recipients
    } catch (error) {
      console.error('Erro ao enviar notificações:', error)

      throw error
    }
  }
  /**
   * Buscar notificações do usuário
   *
   * Retorna somente notificações
   * pertencentes ao usuário logado
   */
  const getUserNotifications = async (userId, max = 50) => {
    try {
      const q = query(
        collection(db, collectionName),

        where('userId', '==', userId),

        orderBy('createdAt', 'desc'),

        limit(max),
      )

      const snapshot = await getDocs(q)

      return snapshot.docs.map((item) => ({
        id: item.id,

        ...item.data(),
      }))
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)

      return []
    }
  }

  /**
   * Buscar apenas notificações não lidas
   */
  const getUnreadNotifications = async (userId) => {
    try {
      const q = query(
        collection(db, collectionName),

        where('userId', '==', userId),

        where('read', '==', false),

        orderBy('createdAt', 'desc'),
      )

      const snapshot = await getDocs(q)

      return snapshot.docs.map((item) => ({
        id: item.id,

        ...item.data(),
      }))
    } catch (error) {
      console.error('Erro ao buscar notificações não lidas:', error)

      return []
    }
  }

  /**
   * Contador de notificações não lidas
   */
  const countUnread = async (userId) => {
    const notifications = await getUnreadNotifications(userId)

    return notifications.length
  }

  /**
   * Marcar uma notificação como lida
   */
  const markAsRead = async (notificationId) => {
    try {
      const ref = doc(db, collectionName, notificationId)

      await updateDoc(ref, {
        read: true,

        readAt: serverTimestamp(),
      })

      return true
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)

      return false
    }
  }

  /**
   * Marcar todas as notificações
   * do usuário como lidas
   */
  const markAllAsRead = async (userId) => {
    try {
      const notifications = await getUnreadNotifications(userId)

      if (!notifications.length) {
        return true
      }

      await Promise.all(
        notifications.map((notification) => {
          const ref = doc(db, collectionName, notification.id)

          return updateDoc(ref, {
            read: true,

            readAt: serverTimestamp(),
          })
        }),
      )

      return true
    } catch (error) {
      console.error('Erro ao marcar todas notificações:', error)

      return false
    }
  }

  /**
   * Retorna notificações recentes
   */
  const getLatest = async (userId, max = 5) => {
    const notifications = await getUserNotifications(userId, max)

    return notifications
  }

  return {
    /**
     * Criação
     */
    create,

    dispatch,

    sendEvent,

    /**
     * Consulta
     */
    getUserNotifications,

    getUnreadNotifications,

    getLatest,

    countUnread,

    /**
     * Controle leitura
     */
    markAsRead,

    markAllAsRead,
  }
}
