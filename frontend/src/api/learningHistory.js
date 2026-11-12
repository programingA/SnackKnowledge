import { getCsrfHeaders } from './account'

export async function getLearningHistory(signal) {
  const response = await fetch('/api/me/learning-history', { signal })
  if (!response.ok) throw new Error('학습 기록을 불러오지 못했어요.')
  return response.json()
}

export async function recordLearningActivity(id, activity, signal) {
  const response = await fetch(`/api/me/learning-history/${id}/${activity}`, {
    method: 'POST',
    headers: await getCsrfHeaders(signal),
    signal,
  })
  if (!response.ok) throw new Error('학습 기록을 저장하지 못했어요.')
}
