import { isSuccessful, requestApi } from './http'

export async function getAdminOverview(signal) {
  const response = await requestApi('/api/admin/overview', { signal, cache: 'no-store' })
  if (!isSuccessful(response)) throw new Error('관리자 통계를 불러오지 못했어요.')
  return response.data
}
