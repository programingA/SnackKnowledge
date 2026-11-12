import { requestApi, isSuccessful } from './http'
import { getCsrfHeaders } from './account'

export async function getInterests(signal) {
  const response = await requestApi('/api/me/interests', { signal, cache: 'no-store' })
  if (!isSuccessful(response)) throw new Error('관심 분야를 불러오지 못했어요.')
  return response.data
}

export async function saveInterests(categories) {
  const response = await requestApi('/api/me/interests', {
    method: 'PUT',
    headers: { ...await getCsrfHeaders(), 'Content-Type': 'application/json' },
    data: { categories },
  })
  if (response.status === 400) throw new Error('선택한 분야를 확인해주세요. 목록을 다시 불러올 수 있어요.')
  if (!isSuccessful(response)) throw new Error('관심 분야를 저장하지 못했어요.')
}
