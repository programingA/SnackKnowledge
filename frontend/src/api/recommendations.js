export async function getRecommendations(signal) {
  const response = await fetch('/api/me/recommendations', { signal, cache: 'no-store' })
  if (!response.ok) throw new Error('추천 카드를 불러오지 못했어요.')
  return response.json()
}
