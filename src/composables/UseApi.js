import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  limit,
  startAfter,
  orderBy,
} from 'firebase/firestore'

import { db } from 'src/boot/firebase'

import useAuthUser from './UseAuthUser.js'

export default function useApi() {
  const { user } = useAuthUser()

  const list = async (collectionName) => {
    const snapshot = await getDocs(collection(db, collectionName))

    return snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }))
  }

  const getById = async (collectionName, id) => {
    const documentRef = doc(db, collectionName, id)

    const documentData = await getDoc(documentRef)

    if (!documentData.exists()) {
      return null
    }

    return {
      id: documentData.id,
      ...documentData.data(),
    }
  }

  const post = async (collectionName, form) => {
    const docRef = await addDoc(collection(db, collectionName), {
      ...form,
      userId: user.value?.uid || null,

      createdAt: new Date(),

      updatedAt: null,
    })

    return docRef.id
  }

  const update = async (collectionName, id, form) => {
    const documentRef = doc(db, collectionName, id)

    await updateDoc(documentRef, {
      ...form,
      updatedAt: new Date(),
    })

    return true
  }

  const remove = async (collectionName, id) => {
    const documentRef = doc(db, collectionName, id)

    await deleteDoc(documentRef)

    return true
  }

  const find = async (collectionName, field, value) => {
    const q = query(collection(db, collectionName), where(field, '==', value))

    const snapshot = await getDocs(q)

    return snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }))
  }

  const findMany = async (collectionName, filters = []) => {
    const constraints = filters.map((filter) =>
      where(filter.field, filter.operator || '==', filter.value),
    )

    const q = query(collection(db, collectionName), ...constraints)

    const snapshot = await getDocs(q)

    return snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }))
  }

  const paginate = async (
    collectionName,
    pageSize = 10,
    lastDocument = null,
    orderField = 'createdAt',
    direction = 'desc',
  ) => {
    let q

    if (lastDocument) {
      q = query(
        collection(db, collectionName),
        orderBy(orderField, direction),
        startAfter(lastDocument),
        limit(pageSize),
      )
    } else {
      q = query(collection(db, collectionName), orderBy(orderField, direction), limit(pageSize))
    }

    const snapshot = await getDocs(q)

    const data = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }))

    return {
      data,

      lastDocument: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
    }
  }

  return {
    list,
    getById,
    post,
    update,
    remove,
    find,
    findMany,
    paginate,
  }
}
