const TAB_KEY = 'snackknowledge.generated-preview-tab'
const STORE = 'previews'

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('snackknowledge-generated-preview', 1)
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(STORE)
      store.createIndex('updatedAt', 'updatedAt')
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function accessPreview(mode, operation) {
  const database = await openDatabase()
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE, mode)
      const request = operation(transaction.objectStore(STORE))
      transaction.oncomplete = () => resolve(request.result)
      transaction.onabort = () => reject(transaction.error)
      transaction.onerror = () => reject(transaction.error)
    })
  } finally {
    database.close()
  }
}

export async function loadGeneratedPreview() {
  const key = sessionStorage.getItem(TAB_KEY)
  if (!key) return null
  const entry = await accessPreview('readonly', (store) => store.get(key))
  return entry?.card ?? null
}

export async function storeGeneratedPreview(card) {
  let key = sessionStorage.getItem(TAB_KEY)
  if (!key) {
    key = crypto.randomUUID()
    sessionStorage.setItem(TAB_KEY, key)
  }
  await accessPreview('readwrite', (store) => {
    const updatedAt = Date.now()
    const request = store.put({ card, updatedAt }, key)
    const sevenDaysAgo = updatedAt - 7 * 24 * 60 * 60 * 1000
    const expired = store.index('updatedAt').openKeyCursor(IDBKeyRange.upperBound(sevenDaysAgo))
    expired.onsuccess = () => {
      const cursor = expired.result
      if (!cursor) return
      store.delete(cursor.primaryKey)
      cursor.continue()
    }
    return request
  })
}

