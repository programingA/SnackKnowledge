import axios from 'axios'

// Feature modules translate HTTP status codes into messages for their screens.
const http = axios.create({ validateStatus: () => true })

export function requestApi(url, { cache, headers, ...config } = {}) {
  return http.request({
    ...config,
    url,
    headers: cache === 'no-store' ? { 'Cache-Control': 'no-cache, no-store', ...headers } : headers,
  })
}

export function isSuccessful({ status }) {
  return status >= 200 && status < 300
}
