import { requestApi, isSuccessful } from './http'
import { getCsrfHeaders } from './account'

async function request(path, options) {
  const response = await requestApi('/api/' + path, { cache: 'no-store', ...options })
  if (response.status === 404) {
    const error = new Error('카드를 찾을 수 없어요.')
    error.status = response.status
    throw error
  }
  if (!isSuccessful(response)) throw new Error('커뮤니티 요청을 처리하지 못했어요.')
  return response
}

export async function getCommunityCards(signal) {
  return (await request('community/cards', { signal })).data
}

export async function getCommunityCard(id, signal) {
  return (await request('community/cards/' + id, { signal })).data
}

export async function getShareStatus(id, signal) {
  return (await request('me/community-shares/' + id, { signal })).data
}

export async function submitShare(id) {
  return (await request('me/community-shares/' + id, {
    method: 'PUT', headers: await getCsrfHeaders(),
  })).data
}

export async function withdrawShare(id) {
  await request('me/community-shares/' + id, { method: 'DELETE', headers: await getCsrfHeaders() })
}

async function reviewRequest(id, options) {
  const path = '/api/admin/community/reviews' + (id ? '/' + id : '')
  const response = await requestApi(path, { cache: 'no-store', ...options })
  if (isSuccessful(response)) return response.data

  const messages = {
    401: '관리자 계정으로 로그인해 주세요.',
    403: '이 계정에는 커뮤니티 검토 권한이 없어요.',
    404: '검토 요청이 철회되었거나 이미 처리됐어요.',
    409: '이미 처리된 요청이에요. 검토 목록으로 돌아가 주세요.',
  }
  const error = new Error(messages[response.status] ?? '검토 요청을 처리하지 못했어요.')
  error.status = response.status
  throw error
}

export function getCommunityReview(signal, id) {
  return reviewRequest(id, { signal })
}

export async function decideCommunityReview(id, status) {
  return reviewRequest(id, { method: 'PUT', headers: await getCsrfHeaders(), data: { status } })
}
