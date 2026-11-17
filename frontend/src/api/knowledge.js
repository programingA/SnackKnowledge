import { requestApi, isSuccessful } from './http'

async function fetchKnowledge(path, signal, errorLabel) {
  const response = await requestApi(path, { signal })

  if (!isSuccessful(response)) {
    const error = new Error(errorLabel)
    error.status = response.status
    throw error
  }

  return response.data
}

export function getKnowledgeList(signal) {
  return fetchKnowledge('/api/knowledge', signal, '지식 목록을 불러오지 못했어요.')
}

export function getKnowledge(id, signal) {
  return fetchKnowledge('/api/knowledge/' + id, signal, '지식 카드를 불러오지 못했어요.')
}

export async function generateKnowledge(topic, signal) {
  const response = await requestApi('/api/knowledge/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { topic },
    signal,
  })

  if (response.status === 422) throw new Error('학습에 적합한 주제를 다시 입력해주세요.')

  if (!isSuccessful(response)) {
    throw new Error(`지식 카드를 생성하지 못했어요(${response.status}).`)
  }

  return response.data
}
