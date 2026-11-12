import { requestApi, isSuccessful } from './http'
export async function getRecommendations(signal) {
  const response = await requestApi('/api/me/recommendations', { signal, cache: 'no-store' })
  if (!isSuccessful(response)) throw new Error('추천 카드를 불러오지 못했어요.')
  return response.data
}
