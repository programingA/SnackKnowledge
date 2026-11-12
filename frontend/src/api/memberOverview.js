export async function getMemberOverview(signal) {
  const response = await fetch('/api/me/overview', { signal, cache: 'no-store' })
  if (!response.ok) throw new Error('내 활동을 불러오지 못했어요.')
  return response.json()
}
