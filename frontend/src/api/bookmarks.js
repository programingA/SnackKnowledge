import { requestApi, isSuccessful } from './http'
import { getCsrfHeaders } from './account'

async function request(path, options) {
  const response = await requestApi('/api/me/bookmarks' + path, options)
  if (response.status === 401) throw new Error('로그인한 뒤 북마크를 사용할 수 있어요.')
  if (response.status === 404) throw new Error('해당 카드를 찾을 수 없어요.')
  if (!isSuccessful(response)) throw new Error('북마크를 처리하지 못했어요. 다시 시도해주세요.')
  return response
}

export async function getBookmarks(signal) {
  return (await request('', { signal })).data
}

export async function setBookmark(id, saved) {
  await request('/' + id, {
    method: saved ? 'PUT' : 'DELETE',
    headers: await getCsrfHeaders(),
  })
}
