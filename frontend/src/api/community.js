import { getCsrfHeaders } from './account'

async function reviewRequest(path, options) {
  const response = await fetch('/api/admin/community/reviews' + path, { cache: 'no-store', ...options })
  if (response.ok) return response

  const messages = {
    401: '로그인한 관리자만 검토할 수 있어요.',
    403: '이 계정에는 커뮤니티 검토 권한이 없어요.',
    404: '검토 요청이 철회되었거나 이미 처리됐어요.',
    409: '검토 요청이 이미 처리됐어요. 검토 목록으로 돌아가 주세요.',
  }
  const error = new Error(messages[response.status] ?? '검토 요청을 처리하지 못했어요.')
  if (messages[response.status]) error.status = response.status
  throw error
}

export async function getCommunityReviews(signal) {
  return (await reviewRequest('', { signal })).json()
}

export async function getCommunityReview(id, signal) {
  return (await reviewRequest('/' + id, { signal })).json()
}

export async function decideCommunityReview(id, status) {
  await reviewRequest('/' + id, {
    method: 'PUT',
    headers: { ...await getCsrfHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}

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
