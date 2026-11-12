import { requestApi, isSuccessful } from './http'
import { getCsrfHeaders } from './account'
import { parseKnowledgeQuiz } from './study'

async function request(path, options) {
  const response = await requestApi('/api/me/wrong-answers' + path, options)
  if (response.status === 404) throw new Error('저장된 문제를 찾을 수 없어요.')
  if (!isSuccessful(response)) throw new Error('오답 노트를 처리하지 못했어요. 다시 시도해주세요.')
  return response
}

export async function getWrongAnswers(signal) {
  return (await request('', { signal, cache: 'no-store' })).data
}

export async function startWrongAnswerQuiz(id) {
  const response = await request('/' + id + '/retry', {
    method: 'POST',
    headers: await getCsrfHeaders(),
  })
  return parseKnowledgeQuiz(response.data)
}

export async function deleteWrongAnswer(id) {
  await request('/' + id, { method: 'DELETE', headers: await getCsrfHeaders() })
}
