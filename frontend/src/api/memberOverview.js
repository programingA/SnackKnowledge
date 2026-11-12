import { requestApi, isSuccessful } from './http'
export async function getMemberOverview(signal) {
  const response = await requestApi('/api/me/overview', { signal, cache: 'no-store' })
  if (!isSuccessful(response)) throw new Error('내 활동을 불러오지 못했어요.')
  return response.data
}
