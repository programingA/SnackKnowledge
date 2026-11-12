import { getCsrfHeaders } from './account'

async function request(path, options) {
  const response = await fetch('/api/' + path, { cache: 'no-store', ...options })
  if (response.status === 404) throw new Error('카드를 찾을 수 없어요.')
  if (!response.ok) throw new Error('커뮤니티 요청을 처리하지 못했어요.')
  return response
}

export async function getCommunityCards(signal) {
  return (await request('community/cards', { signal })).json()
}

export async function getCommunityCard(id, signal) {
  return (await request('community/cards/' + id, { signal })).json()
}

export async function getShareStatus(id, signal) {
  return (await request('me/community-shares/' + id, { signal })).json()
}

export async function submitShare(id) {
  return (await request('me/community-shares/' + id, {
    method: 'PUT', headers: await getCsrfHeaders(),
  })).json()
}

export async function withdrawShare(id) {
  await request('me/community-shares/' + id, { method: 'DELETE', headers: await getCsrfHeaders() })
}
