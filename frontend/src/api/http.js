import axios from 'axios'

// Feature modules translate HTTP status codes into messages for their screens.
const http = axios.create({ validateStatus: () => true })
const sessionEvents = new EventTarget()

export function onSessionUnauthorized(listener) {
  sessionEvents.addEventListener('unauthorized', listener)
  return () => sessionEvents.removeEventListener('unauthorized', listener)
}

export function requestApi(url, { cache, headers, ...config } = {}) {
  return http.request({
    ...config,
    url,
    headers: cache === 'no-store' ? { 'Cache-Control': 'no-cache, no-store', ...headers } : headers,
  }).then((response) => {
    if (response.status === 401 && (url.startsWith('/api/me/') || url.startsWith('/api/study/generated/saved/')
      || url.startsWith('/api/admin/'))) {
      sessionEvents.dispatchEvent(new Event('unauthorized'))
    }
    return response
  })
}

export function isSuccessful({ status }) {
  return status >= 200 && status < 300
}
